import { expect, fixture, test } from '../fixtures';

const pages = fixture<{ feedPages: Record<string, number[]> }>('manifest').feedPages;
const header = (page: import('@playwright/test').Page) => page.locator('app-header header');

test.describe('feeds and pagination', () => {
  for (const [feed, nums] of Object.entries(pages)) {
    for (const num of nums) {
      test(`/${feed}/${num} renders the recorded page`, async ({ page }) => {
        const items = fixture<{ title: string; id: number }[]>(`${feed}/${num}`);
        await page.goto(`/${feed}/${num}`);
        await expect(page.locator('.main-content .nav')).toBeAttached();
        await expect(page.locator('li.post')).toHaveCount(items.length);
        await expect(page.locator('.main-content ol')).toHaveAttribute('start', String((num - 1) * 30 + 1));
        if (items.length) await expect(page.locator('li.post a.title').first()).toHaveText(items[0].title);
        await expect(page.locator('.job-header')).toHaveCount(feed === 'jobs' ? 1 : 0);

        const prev = page.locator('.nav a.prev');
        const more = page.locator('.nav a.more');
        if (num === 1) await expect(prev).toHaveCount(0);
        else await expect(prev).toHaveAttribute('href', `/${feed}/${num - 1}`);
        if (items.length === 30) await expect(more).toHaveAttribute('href', `/${feed}/${num + 1}`);
        else await expect(more).toHaveCount(0);
      });
    }
  }

  test('/ redirects to /news/1, keeping the query string', async ({ page }) => {
    await page.goto('/?ref=x');
    await expect(page).toHaveURL('/news/1?ref=x');
    await expect(page.locator('li.post')).toHaveCount(30);
  });

  test('More and Prev move between pages', async ({ page }) => {
    await page.goto('/news/1');
    await page.locator('.nav a.more').click();
    await expect(page).toHaveURL('/news/2');
    await expect(page.locator('.main-content ol')).toHaveAttribute('start', '31');
    await page.locator('.nav a.prev').click();
    await expect(page).toHaveURL('/news/1');
    await expect(page.locator('.main-content ol')).toHaveAttribute('start', '1');
  });

  test('header links go to page 1 of each feed and mark the active one', async ({ page }) => {
    await page.goto('/news/2');
    for (const [name, feed] of [['new', 'newest'], ['show', 'show'], ['ask', 'ask'], ['jobs', 'jobs']]) {
      await header(page).getByRole('link', { name, exact: true }).click();
      await expect(page).toHaveURL(`/${feed}/1`);
      await expect(page.locator('li.post').first()).toBeVisible();
      await expect(header(page).locator('a.active')).toHaveText(name);
    }
    await header(page).locator('a.home-link').click();
    await expect(page).toHaveURL('/news/1');
    await expect(header(page).locator('a.active')).toHaveClass(/home-link/);
  });

  test('an unrecorded page shows the feed error', async ({ page }) => {
    await page.goto('/news/9');
    await expect(page.locator('.error-section .strong')).toHaveText('Could not load news stories.');
  });

  test('a non-numeric page numbers the list NaN', async ({ page }) => {
    await page.goto('/news/abc');
    await expect(page.locator('.error-section, .main-content ol').first()).toBeAttached();
    const ol = page.locator('.main-content ol');
    if (await ol.count()) await expect(ol).toHaveAttribute('start', 'NaN');
  });

  for (const path of ['/news', '/NEWS/1', '/top/1', '/news/1/extra']) {
    test(`${path} matches no route: only the shell renders`, async ({ page }) => {
      await page.goto(path);
      await expect(page.locator('app-header #header')).toBeVisible();
      await expect(page.locator('app-footer #footer')).toBeAttached();
      await expect(page.locator('.main-content')).toHaveCount(0);
    });
  }
});
