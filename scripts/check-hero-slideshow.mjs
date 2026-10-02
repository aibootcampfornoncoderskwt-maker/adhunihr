const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
import { mkdir } from 'node:fs/promises';
import assert from 'node:assert/strict';
await mkdir('tmp/hero-qa', { recursive: true });
const browser = await chromium.launch({ executablePath: process.env.PLAYWRIGHT_CHROMIUM_PATH, headless: true });
for (const [name, width, language, reduced] of [['desktop',1440,'en',false],['mobile',390,'en',false],['arabic',1440,'ar',false],['arabic-mobile',390,'ar',false],['reduced',1440,'en',true]]) {
  const page = await browser.newPage({ viewport: { width, height: 1000 }, deviceScaleFactor: 1, reducedMotion: reduced ? 'reduce' : 'no-preference' });
  const errors = [];
  const images = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('request', request => { if (request.url().includes('/hero/')) images.push(request.url()); });
  await page.goto(`http://localhost:4321/?lang=${language}`);
  await page.waitForFunction(() => !document.documentElement.dataset.intro);
  await page.locator('.hero-slide').first().evaluate(image => image.decode());
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
  assert.equal(await page.locator('.hero-slide').count(), 5);
  await page.screenshot({ path: `tmp/hero-qa/${name}.png` });
  if (reduced) {
    await page.waitForTimeout(6500);
    assert.equal(images.length, 1);
    assert.equal(await page.locator('.hero-slideshow-control').isVisible(), false);
  } else {
    const button = page.locator('.hero-slideshow-control');
    await button.focus();
    await page.keyboard.press('Space');
    assert.equal(await button.getAttribute('aria-pressed'), 'true');
    await page.locator('.hero-slide').first().evaluate(el => Promise.all(el.getAnimations().map(animation => animation.ready)));
    const before = await page.locator('.hero-slide').first().evaluate(el => getComputedStyle(el).transform);
    await page.waitForTimeout(300);
    assert.equal(await page.locator('.hero-slide').first().evaluate(el => getComputedStyle(el).transform), before);
    await page.keyboard.press('Enter');
    await page.waitForFunction(() => document.querySelectorAll('.hero-slide')[1].getAttribute('aria-hidden') === 'false');
    await page.waitForTimeout(1600);
    assert.equal(await page.locator('.hero-slide').nth(1).evaluate(el => getComputedStyle(el).opacity), '1');
    if (width === 390) assert.ok(images.every(url => url.includes('-mobile.webp')));
    if (language === 'ar') assert.equal(await page.locator('html').getAttribute('dir'), 'rtl');
    if (name === 'desktop') {
      for (const index of [2, 3, 4, 0]) {
        await page.waitForFunction(index => document.querySelectorAll('.hero-slide')[index].getAttribute('aria-hidden') === 'false', index);
        await page.waitForTimeout(1600);
        assert.equal(await page.locator('.hero-slide').nth(index).evaluate(el => getComputedStyle(el).opacity), '1');
      }
    }
  }
  assert.deepEqual(errors, []);
  console.log(`PASS ${name}: layout, image loading, motion/control behavior, no browser errors`);
  await page.close();
}
await browser.close();
