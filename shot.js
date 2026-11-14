const { chromium } = require('playwright-core');
(async () => {
  const b = await chromium.launch({ executablePath: '/usr/bin/chromium', args: ['--no-sandbox','--disable-dev-shm-usage'] });
  const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
  await p.goto('http://localhost:8000/', { waitUntil: 'networkidle' });
  await p.waitForTimeout(800);
  await p.screenshot({ path: '/opt/shots/30-calibrated-dashboard.png', fullPage: true });
  const t = await p.evaluate(() => document.body.innerText);
  console.log('BMD values in UI: ' + (t.match(/-\d+(\.\d+)?% BMD Loss/g) || []).join(', '));
  await b.close();
})().catch(e => { console.log('FATAL ' + e.message); process.exit(1); });
