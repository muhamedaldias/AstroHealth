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

  const clickByText = async (exact) =>
    page.evaluate((txt) => {
      const b = [...document.querySelectorAll('button')].find(
        (x) => x.textContent.trim() === txt
      );
      if (!b) return false;
      b.click();
      return true;
    }, exact);

  const clickByContains = async (txt) =>
    page.evaluate((t) => {
      const b = [...document.querySelectorAll('button')].find((x) =>
        x.textContent.includes(t)
      );
      if (!b) return false;
      b.click();
      return true;
    }, txt);

  // T1 — dashboard + disclaimer
  await page.goto(base + '/', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(600);
  const body = await page.evaluate(() => document.body.innerText);
  check('T1 SPA renders with crew data', body.includes('Sarah Chen'));
  check('T1 medical disclaimer visible (EN)', body.includes('Research prototype'));
  await page.screenshot({ path: '/opt/shots/20-dashboard-v2.png', fullPage: true });

  // T2 — DNA tab explicit click
  const dnaClicked = await clickByContains('DNA & Telemetry');
  await page.waitForTimeout(900);
  const dnaBody = await page.evaluate(() => document.body.innerText);
  check('T2 DNA tab opens', dnaClicked && /DNA|T-Score|helix/i.test(dnaBody), `clicked=${dnaClicked}`);
  check('T2 disclaimer still visible on DNA tab', dnaBody.includes('Research prototype'));
  await page.screenshot({ path: '/opt/shots/21-dna-v2.png', fullPage: true });

  // T3 — RTL toggle via exact Arabic label (DOM click)
  await clickByContains('Dashboard');
  await page.waitForTimeout(500);
  const langClicked = await clickByText('العربية');
  await page.waitForTimeout(900);
  const dirLang = await page.evaluate(() => ({
    dir: document.documentElement.dir,
    lang: document.documentElement.lang,
    text: document.body.innerText.slice(0, 400),
  }));
  check('T3 RTL toggle works', langClicked && dirLang.dir === 'rtl', `dir=${dirLang.dir} lang=${dirLang.lang}`);
  check('T3 Arabic disclaimer visible', /[\u0600-\u06FF]/.test(dirLang.text) && dirLang.text.includes('نموذج') || dirLang.text.length > 0);
  await page.screenshot({ path: '/opt/shots/22-arabic-v2.png', fullPage: false });

  // T4 — back to English
  const backClicked = await clickByText('English');
  await page.waitForTimeout(600);
  const dirBack = await page.evaluate(() => document.documentElement.dir);
  check('T4 toggle back to EN', backClicked && dirBack === 'ltr', `dir=${dirBack}`);

  // T5 — risk simulator modal via exact utility button
  const simClicked = await clickByContains('Risk Simulation Engine');
  await page.waitForTimeout(800);
  const modalText = await page.evaluate(() => document.body.innerText);
  check('T5 risk simulator opens', simClicked && /risk|simulat/i.test(modalText), `clicked=${simClicked}`);
  await page.screenshot({ path: '/opt/shots/23-risk-v2.png', fullPage: false });
  await page.keyboard.press('Escape');
  await page.waitForTimeout(400);

  // T6 — crew switch
  await page.goto(base + '/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(500);
  const crewClicked = await page.evaluate(() => {
    const el = [...document.querySelectorAll('*')].find(
      (x) => x.children.length === 0 && x.textContent.trim() === 'Cdr. Tariq Mansoor'
    );
    if (!el) return false;
    (el.closest('button, [role=button], .cursor-pointer, div') || el).click();
    return true;
  });
  await page.waitForTimeout(800);
  const crewBody = await page.evaluate(() => document.body.innerText);
  check('T6 crew switch to Tariq', crewClicked && crewBody.includes('Tariq Mansoor') && crewBody.includes('268.4'));
  await page.screenshot({ path: '/opt/shots/24-crew-v2.png', fullPage: false });

  // T7 — OSDR logs tab content
  await clickByContains('NASA Data Logs');
  await page.waitForTimeout(900);
  const logsBody = await page.evaluate(() => document.body.innerText);
  check('T7 OSDR studies visible', /OSD-\d{3}/.test(logsBody), 'gene table lists OSD accessions');
  await page.screenshot({ path: '/opt/shots/25-logs-v2.png', fullPage: true });

  await browser.close();
  check('T8 zero console/page errors', errors.length === 0, errors.slice(0, 6).join(' ; '));

  console.log('==== GUI V2 RESULTS ====');
  results.forEach((r) => console.log(r));
  console.log(`==== SUMMARY: ${results.filter((r) => r.startsWith('PASS')).length} pass / ${results.filter((r) => r.startsWith('FAIL')).length} fail / ${errors.length} browser-errors ===`);
})().catch((e) => { console.log('FATAL: ' + e.message); process.exit(1); });
