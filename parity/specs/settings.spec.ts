import { expect, test } from '../fixtures';

const root = (page: import('@playwright/test').Page) => page.locator('app-root > div').first();

test.describe('settings and themes', () => {
  test('defaults to the light theme and follows a dark system preference', async ({ page, browser }) => {
    await page.goto('/news/1');
    await expect(root(page)).toHaveClass('default');
    const dark = await browser.newContext({ colorScheme: 'dark', baseURL: page.url() });
    const darkPage = await dark.newPage();
    await darkPage.route('https://**', r => r.abort());
    await darkPage.goto('/news/1');
    await expect(root(darkPage)).toHaveClass('night');
    await dark.close();
  });

  for (const [label, theme] of [['Night', 'night'], ['Black (AMOLED)', 'amoledblack'], ['Default', 'default']]) {
    test(`choosing ${label} applies and persists the ${theme} theme`, async ({ page }) => {
      const start = theme === 'default' ? 'night' : 'default';
      await page.addInitScript(t => localStorage.getItem('theme') || localStorage.setItem('theme', t), start);
      await page.goto('/news/1');
      await expect(root(page)).toHaveClass(start);
      await page.getByAltText('Settings').click();
      await page.getByRole('radio', { name: label }).check();
      await expect(root(page)).toHaveClass(theme);
      await page.reload();
      await expect(root(page)).toHaveClass(theme);
      expect(await page.evaluate(() => localStorage.getItem('theme'))).toBe(theme);
    });
  }

  test('font size, list spacing and new-tab links apply and persist', async ({ page }) => {
    await page.goto('/news/1');
    await expect(page.locator('li.post').first()).toBeVisible();
    await page.getByAltText('Settings').click();
    await page.getByRole('checkbox').check();
    await page.getByLabel('Font size:').fill('20');
    await page.getByLabel('Font size:').press('ArrowRight');
    await page.getByLabel('List spacing:').fill('6');
    await page.getByLabel('List spacing:').press('ArrowRight');
    await page.locator('.close').click();
    await expect(page.locator('app-settings')).toHaveCount(0);
    await page.reload();
    const title = page.locator('li.post a.title').first();
    await expect(title).toHaveCSS('font-size', '20px');
    await expect(page.locator('li.post .item-block > div').first()).toHaveCSS('margin-bottom', '6px');
    await expect(page.locator('li.post a.title[href^="http"]').first()).toHaveAttribute('target', '_blank');
  });
});
