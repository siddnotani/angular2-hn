import { expect, test } from '../fixtures';

test.use({ serviceWorkers: 'allow' });

const cachedUrls = (page: import('@playwright/test').Page) =>
  page.evaluate(async () => {
    const urls: string[] = [];
    for (const name of await caches.keys()) {
      for (const req of await (await caches.open(name)).keys()) urls.push(req.url.split('?')[0]);
    }
    return [...new Set(urls)].sort();
  });

// The same checks pass for ngsw (Angular) and Workbox (React), which is what "mirrors
// ngsw-config.json" means in practice.
test.describe('service worker', () => {
  test('precaches the app shell, caches assets on use, never caches the API, works offline', async ({ page, context }) => {
    await page.goto('/news/1');
    await expect(page.locator('li.post')).toHaveCount(30);
    await page.evaluate(() => navigator.serviceWorker.ready);
    const origin = new URL(page.url()).origin;
    const scripts = await page.evaluate(() => [...document.scripts].map(s => s.src).filter(src => src.startsWith(location.origin)));
    const styles = await page.evaluate(() =>
      [...document.querySelectorAll<HTMLLinkElement>('link[rel=stylesheet]')].map(l => l.href),
    );

    // "app" group: installMode prefetch.
    await expect.poll(() => cachedUrls(page), { timeout: 15_000 }).toEqual(
      expect.arrayContaining([`${origin}/index.html`, `${origin}/favicon.ico`, ...scripts, ...styles]),
    );

    // "assets" group: installMode lazy. Requests made after the worker took control get cached.
    await page.reload();
    await expect(page.locator('li.post')).toHaveCount(30);
    await expect.poll(() => cachedUrls(page)).toEqual(
      expect.arrayContaining([`${origin}/assets/images/logo.svg`, `${origin}/assets/images/cog.svg`]),
    );
    const cached = await cachedUrls(page);
    expect(cached.filter(u => !u.startsWith(origin))).toEqual([]);
    expect(cached).not.toContain(`${origin}/manifest.json`);

    // Offline: the shell and its images come from the cache; the API is not cached, so the
    // feed shows its error.
    await context.setOffline(true);
    await context.unroute('https://node-hnapi.herokuapp.com/**');
    await context.route('https://node-hnapi.herokuapp.com/**', r => r.abort('internetdisconnected'));
    await page.reload();
    await expect(page.locator('app-header #header')).toBeVisible();
    await expect(page.locator('.error-section .strong')).toHaveText('Could not load news stories.');
    expect(await page.locator('app-header img.logo').evaluate(img => (img as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);

    // Navigations to any app URL are answered with the cached index.html.
    await page.goto('/user/pg');
    await expect(page.locator('app-header #header')).toBeVisible();
  });
});
