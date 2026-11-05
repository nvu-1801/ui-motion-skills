import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
for (const theme of ['light', 'dark']) {
  test(`shared roles and scoped variant in ${theme}`, async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Confirm Home' }).waitFor();
    await page.locator('html').evaluate((element, value) => element.dataset.theme = value, theme);
    const home = page.getByRole('button', { name: 'Confirm Home' });
    const settings = page.getByRole('button', { name: 'Confirm Settings' });
    const checkout = page.getByRole('button', { name: 'Confirm Checkout' });
    await expect(home).toHaveCSS('font-size', '14px');
    await expect(settings).toHaveCSS('font-size', '14px');
    await expect(checkout).toHaveCSS('font-size', '12px');
    expect(await home.evaluate(node => getComputedStyle(node).backgroundColor)).toBe(await settings.evaluate(node => getComputedStyle(node).backgroundColor));
    await home.focus(); await page.keyboard.press('Enter');
    await expect(page.getByRole('dialog')).toBeVisible();
    await page.getByRole('button', { name: 'Close', exact: true }).click();
    await expect(home).toBeFocused();
    await expect(page.getByRole('link', { name: 'View details' })).toHaveAttribute('href', '#details');
    await page.getByRole('checkbox', { name: 'Choose item' }).check();
    await expect(page.getByRole('checkbox')).toBeChecked();
    const a11y = await new AxeBuilder({ page }).analyze();
    expect(a11y.violations.filter(v => ['serious', 'critical'].includes(v.impact || ''))).toEqual([]);
  });
}
