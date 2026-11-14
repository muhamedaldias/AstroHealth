const { chromium } = require('playwright-core');
const fs = require('fs');

(async () => {
  const base = 'http://localhost:8000';
  const errors = [];
  const results = [];
  const check = (name, ok, extra = '') =>
    results.push(`${ok ? 'PASS' : 'FAIL'} | ${name}${extra ? ' | ' + extra : ''}`);

  fs.mkdirSync('/opt/shots', { recursive: true });
  const browser = await chromium.launch({
    executablePath: '/usr/bin/chromium',
    args: ['--no-sandbox', '--disable-dev-shm-usage', '--disable-gpu'],
  });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  page.on('pageerror', (e) => errors.push('PAGEERROR: ' + e.message));
  page.on('console', (m) => { if (m.type() === 'error') errors.push('CONSOLE: ' + m.text()); });

  // T1 — app shell loads
  await page.goto(base + '/', { waitUntil: 'networkidle', timeout: 30000 });
  const body = await page.evaluate(() => document.body.innerText);
  check('T1 SPA renders', body.length > 100);
  check('T1 brand "AstroHealth" visible', /astrohealth/i.test(body));
  check('T1 hero crew Sarah Chen (telemetry API data)', body.includes('Sarah Chen'));
  check('T1 bilingual data (Arabic name present)', body.includes('سارة تشن') || body.includes('د.'));
  check('T1 medical disclaimer present', /prototype|not a medical/i.test(body));
  await page.screenshot({ path: '/opt/shots/01-dashboard.png', fullPage: true });

  // T2 — API sanity from page context
  const api = await page.evaluate(async () => {
    const r = await fetch('/api/v1/telemetry/crew');
    const j = await r.json();
    return { status: r.status, count: j.count, first: j.crew && j.crew[0] ? j.crew[0].name : '' };
  });
  check('T2 in-page API telemetry/crew', api.status === 200 && api.count === 4, `status=${api.status} count=${api.count} first=${api.first}`);

  // T3 — visit every tab (click all header/nav buttons, screenshot each)
  const headerButtons = await page.$$('header button, nav button');
  results.push(`INFO | header/nav buttons found | ${headerButtons.length}`);
  let shotIdx = 2;
  const seen = new Set();
  for (let i = 0; i < headerButtons.length; i++) {
    label = '';
    try { label = (await headerButtons[i].innerText()).trim().slice(0, 30); } catch (e) {}
    if (!label || seen.has(label)) continue;
    seen.add(label);
    await headerButtons[i].click().catch(() => {});
    await page.waitForTimeout(900);
    const t = await page.evaluate(() => document.body.innerText);
    const marker =
      /gene|osd-\d|study/i.test(t) ? 'data-logs content'
      : /dna|helix|cellular/i.test(t) ? 'dna-telemetry content'
      : /protocol|countermeasure|rescue|nutrition/i.test(t) ? 'bio-rescue content'
      : /risk|simulat/i.test(t) ? 'risk-simulator content'
      : /dashboard|sarah|crew/i.test(t) ? 'dashboard content'
      : 'unknown content';
    results.push(`INFO | tab[${i}] "${label}" -> ${marker}`);
    await page.screenshot({ path: `/opt/shots/${String(shotIdx).padStart(2, '0')}-tab.png`, fullPage: true });
    shotIdx++;
  }

  // T4 — crew switch (click another crew member card if present on dashboard)
  await page.goto(base + '/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(500);
  const crewCard = await page.$('text=Cdr. Tariq Mansoor');
  if (crewCard) {
    await crewCard.click();
    await page.waitForTimeout(800);
    const t = await page.evaluate(() => document.body.innerText);
    check('T4 crew switch to Tariq updates hero', t.includes('Tariq Mansoor'));
    await page.screenshot({ path: '/opt/shots/90-crew-switched.png', fullPage: false });
  } else {
    check('T4 crew switch', false, 'crew card not found on dashboard');
  }

  // T5 — language toggle to Arabic (RTL)
  const langBtn = await page.$('button:has-text("ع"), button:has-text("AR"), button:has-text("EN")');
  if (langBtn) {
    await langBtn.click();
    await page.waitForTimeout(800);
    const dir = await page.evaluate(() => document.documentElement.dir);
    const t = await page.evaluate(() => document.body.innerText);
    check('T5 RTL toggle', dir === 'rtl' && /[\u0600-\u06FF]/.test(t), `dir=${dir}`);
    await page.screenshot({ path: '/opt/shots/91-arabic-rtl.png', fullPage: false });
    await langBtn.click();
    await page.waitForTimeout(400);
  } else {
    check('T5 language toggle', false, 'toggle button not found');
  }

  // T6 — risk simulator modal (header button opens it)
  const simBtn = await page.$('button:has-text("Simulat"), button:has-text("محاك")');
  if (simBtn) {
    await simBtn.click();
    await page.waitForTimeout(700);
    const t = await page.evaluate(() => document.body.innerText);
    check('T6 risk simulator modal opens', /risk|simulat|mission/i.test(t));
    await page.screenshot({ path: '/opt/shots/92-risk-modal.png', fullPage: false });
    await page.keyboard.press('Escape');
  } else {
    results.push('INFO | risk simulator modal button not found (may live inside a tab)');
  }

  await browser.close();
  check('T7 zero console/page errors', errors.length === 0, errors.slice(0, 6).join(' ; '));

  console.log('==== GUI TEST RESULTS ====');
  results.forEach((r) => console.log(r));
  console.log(`==== SUMMARY: ${results.filter((r) => r.startsWith('PASS')).length} pass / ${results.filter((r) => r.startsWith('FAIL')).length} fail / ${errors.length} browser-errors ===`);
})().catch((e) => { console.log('FATAL: ' + e.message); process.exit(1); });
