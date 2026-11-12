import { test as base, type BrowserContext, type Page } from '@playwright/test';

import { API_ORIGIN, apiResponse, fixture } from './api.mjs';
import type { BuildName } from './builds';

export { fixture };

export const manifest = fixture<{ pollId: number; storyId: number; askId: number; jobId: number; userId: string }>('manifest');

export async function mockApi(target: Page | BrowserContext) {
  await target.route(`${API_ORIGIN}/**`, route =>
    route.fulfill({ ...apiResponse(route.request().url()), headers: { 'Access-Control-Allow-Origin': '*' } }),
  );
}

// Replaces analytics.js with a recorder so pageviews can be compared without network access.
export async function mockAnalytics(target: Page | BrowserContext) {
  await target.route('https://www.google-analytics.com/**', route =>
    route.fulfill({
      contentType: 'text/javascript',
      body: `(function () {
        var calls = (window.__ga = []);
        var record = function () { calls.push([].slice.call(arguments)); };
        (window.ga.q || []).forEach(function (args) { record.apply(null, args); });
        window.ga = record;
      })();`,
    }),
  );
}

export const gaCalls = (page: Page) => page.evaluate(() => (window as unknown as { __ga?: unknown[][] }).__ga ?? []);

interface Options {
  build: BuildName;
  theme: string | undefined;
}

export const test = base.extend<Options>({
  build: ['react', { option: true }],
  theme: [undefined, { option: true }],
  context: async ({ context, theme }, use) => {
    await mockApi(context);
    await mockAnalytics(context);
    if (theme) await context.addInitScript(t => localStorage.setItem('theme', t), theme);
    await use(context);
  },
});

export { expect } from '@playwright/test';
