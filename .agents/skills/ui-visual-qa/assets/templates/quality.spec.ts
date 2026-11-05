import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

// Set QUALITY_BASE_URL or configure baseURL. Adapt readiness and the business journey.
for (const width of [390, 768, 1440]) {
  test(`changed route at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    const errors: string[] = [];
    page.on('pageerror', error => errors.push(error.message));
    page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
    await page.goto(process.env.QUALITY_BASE_URL || '/');
    await page.locator('main').waitFor();
    await page.evaluate(() => document.fonts.ready);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    const accessibility = await new AxeBuilder({ page }).analyze();
    expect(accessibility.violations.filter(v => ['serious', 'critical'].includes(v.impact || ''))).toEqual([]);
    await expect(page).toHaveScreenshot(`changed-route-${width}.png`, { fullPage: true, animations: 'disabled' });
    expect(errors).toEqual([]);
  });
}
