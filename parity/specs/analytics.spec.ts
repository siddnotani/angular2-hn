import { expect, gaCalls, test } from '../fixtures';

const pageviews = async (page: import('@playwright/test').Page) =>
  (await gaCalls(page)).filter(c => c[0] === 'set').map(c => c[2]);

test.describe('Google Analytics', () => {
  test('creates the tracker and sends a pageview per navigation', async ({ page }) => {
    await page.goto('/?ref=x');
    await expect.poll(() => pageviews(page)).toEqual(['/news/1?ref=x']);
    const calls = await gaCalls(page);
    expect(calls[0]).toEqual(['create', 'UA-66348622-3', 'auto']);
    expect(calls.slice(1)).toEqual([['set', 'page', '/news/1?ref=x'], ['send', 'pageview']]);

    await page.locator('app-header').getByRole('link', { name: 'show', exact: true }).click();
    await expect(page).toHaveURL('/show/1');
    await page.locator('.nav a.more').click();
    await expect.poll(() => pageviews(page)).toEqual(['/news/1?ref=x', '/show/1', '/show/2']);
  });

  test('sends nothing for an unmatched URL', async ({ page }) => {
    await page.goto('/top/1');
    await expect.poll(() => gaCalls(page)).toEqual([['create', 'UA-66348622-3', 'auto']]);
  });
});
