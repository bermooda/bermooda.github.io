// Captures the homepage screenshots from a running bermooda dev server into
// src/assets/screens. See README.md for the full setup.
import { mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright-core';

const BASE = process.env.BERMOODA_URL ?? 'http://localhost:3000';
const OUT = fileURLToPath(new URL('../../src/assets/screens', import.meta.url));
mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH });

// Waits for the page to go quiet; retries when a client-side redirect lands mid-wait.
async function settle(page, attempts = 3) {
  try {
    await page.waitForLoadState('networkidle');
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(400);
  } catch (error) {
    if (attempts <= 1) throw error;
    await page.waitForTimeout(500);
    await settle(page, attempts - 1);
  }
}

// Dev-only notice (2FA off until email is configured); not part of a real shop.
async function hideDevNotices(page) {
  await page.evaluate(() => {
    for (const el of document.querySelectorAll('main div, div')) {
      if (
        el.children.length <= 2 &&
        /Two-factor authentication is off/.test(el.textContent ?? '') &&
        el.textContent.length < 200
      ) {
        el.remove();
        break;
      }
    }
  });
}

// Photo-heavy shots are JPEG, UI-only shots PNG.
async function shoot(page, name, options = {}) {
  const type = options.type ?? 'png';
  await page.mouse.move(0, 0); // no stray hover states
  await page.waitForTimeout(150);
  await page.screenshot({
    path: `${OUT}/${name}.${type === 'jpeg' ? 'jpg' : 'png'}`,
    ...(type === 'jpeg' ? { type, quality: 90 } : {}),
    ...options,
  });
  console.log('saved', name);
}

// ── Storefront ────────────────────────────────────────────────────────────
{
  const ctx = await browser.newContext({ viewport: { width: 1100, height: 900 }, deviceScaleFactor: 2 });
  const page = await ctx.newPage();
  await page.goto(BASE + '/');
  await settle(page);
  const heroBottom = await page.evaluate(() => {
    const h1 = document.querySelector('h1');
    return h1.closest('section').getBoundingClientRect().bottom;
  });
  await shoot(page, 'storefront', {
    type: 'jpeg',
    clip: { x: 0, y: 0, width: 1100, height: Math.round(heroBottom) },
  });

  const arrivals = await page.evaluate(() => {
    const r = document.getElementById('new-arrivals').closest('section').getBoundingClientRect();
    return { x: 0, y: Math.round(r.top + window.scrollY), width: 1100, height: Math.round(r.height) };
  });
  await shoot(page, 'arrivals', { type: 'jpeg', clip: arrivals, fullPage: true });

  // Checkout with two items in the cart.
  for (const slug of ['glazed-bud-vase', 'speckled-cup-set']) {
    await page.goto(`${BASE}/products/${slug}`);
    await settle(page);
    await page.getByRole('button', { name: /add to cart/i }).click();
    await page.waitForTimeout(1200);
  }
  await page.setViewportSize({ width: 1200, height: 820 });
  await page.goto(BASE + '/checkout');
  await settle(page);
  const email = page.locator('input[type="email"]').first();
  if (await email.count()) await email.fill('maya@cove.shop').catch(() => {});
  // Skip the shop header; frame the checkout from its heading to the pay button.
  const box = await page.evaluate(() => {
    const eyebrow = [...document.querySelectorAll('main *')].find((el) => el.children.length === 0 && /secure checkout/i.test(el.textContent));
    const top = eyebrow.getBoundingClientRect().top - 40;
    const pay = [...document.querySelectorAll('button')].find((el) => /pay now/i.test(el.textContent) && el.getBoundingClientRect().height > 0);
    return { top: Math.round(top + window.scrollY), bottom: Math.round(pay.getBoundingClientRect().bottom + window.scrollY + 48) };
  });
  await shoot(page, 'checkout', {
    clip: { x: 0, y: box.top, width: 1200, height: box.bottom - box.top },
    fullPage: true,
  });
  await ctx.close();
}

// ── Admin ─────────────────────────────────────────────────────────────────
{
  const ctx = await browser.newContext({ viewport: { width: 1024, height: 680 }, deviceScaleFactor: 2 });
  const page = await ctx.newPage();
  await page.goto(BASE + '/admin');
  await settle(page);
  await page.locator('#email').fill('admin@bermooda.dev');
  await page.locator('#password').fill('changeme123!');
  await page.locator('button[type="submit"]').click();
  await page.waitForURL(/\/admin\/dashboard/, { timeout: 30000 });
  await settle(page);

  for (const [name, path] of [
    ['admin-dashboard', '/admin/dashboard'],
    ['admin-orders', '/admin/orders'],
    ['admin-plugins', '/admin/plugins'],
  ]) {
    await page.goto(BASE + path);
    await settle(page);
    await hideDevNotices(page);
    await page.waitForTimeout(200);
    await shoot(page, name);
  }
  await ctx.close();
}

await browser.close();
