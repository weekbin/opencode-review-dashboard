import puppeteer from 'puppeteer';
const browser = await puppeteer.launch({
  headless: 'new',
  executablePath: '/usr/bin/google-chrome',
  args: ['--no-sandbox', '--disable-setuid-sandbox', '--force-device-scale-factor=2']
});
const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });
const base = 'http://127.0.0.1:8897/review/test?token=test';

await page.goto(base, { waitUntil: 'networkidle0' });
await page.waitForSelector('.card', { timeout: 10000 });
await new Promise(r => setTimeout(r, 800));
await page.screenshot({ path: '/home/weekbin/.opencode/plugins/opencode-review-dashboard/docs/screenshots/diff.png', fullPage: false });

// Switch to Commits tab
await page.click('button[data-tab="commits"]');
await new Promise(r => setTimeout(r, 600));
await page.screenshot({ path: '/home/weekbin/.opencode/plugins/opencode-review-dashboard/docs/screenshots/commits.png', fullPage: false });

// Switch to Conversation tab
await page.click('button[data-tab="conversation"]');
await new Promise(r => setTimeout(r, 600));
await page.screenshot({ path: '/home/weekbin/.opencode/plugins/opencode-review-dashboard/docs/screenshots/conversation.png', fullPage: false });

// Back to Files and click a line to show finding drawer
await page.click('button[data-tab="files"]');
await new Promise(r => setTimeout(r, 600));
const line = await page.$('[data-line-number="7"]');
if (line) {
  await line.click();
  await new Promise(r => setTimeout(r, 600));
}
await page.screenshot({ path: '/home/weekbin/.opencode/plugins/opencode-review-dashboard/docs/screenshots/finding.png', fullPage: false });

await browser.close();
console.log('screenshots done');
