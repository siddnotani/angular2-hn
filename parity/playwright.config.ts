import { defineConfig, devices } from '@playwright/test';

import { baseURL, BUILDS, type BuildName } from './builds';

const desktop = { ...devices['Desktop Chrome'], viewport: { width: 1280, height: 800 } };
const mobile = devices['Pixel 7'];
const shared = { colorScheme: 'light' as const, serviceWorkers: 'block' as const, timezoneId: 'UTC', locale: 'en-US' };

// Every functional spec runs once per build and viewport, so a spec only passes if Angular and
// React both satisfy it. The visual project drives both builds itself and diffs them.
const builds = Object.keys(BUILDS) as BuildName[];
const functional = builds.flatMap(build =>
  [
    ['desktop', desktop],
    ['mobile', mobile],
  ].map(([name, device]) => ({
    name: `${build}-${name}`,
    testIgnore: /visual\.spec/,
    use: { ...(device as object), ...shared, build, baseURL: baseURL(build) },
  })),
);

export default defineConfig({
  testDir: './specs',
  fullyParallel: true,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: { trace: 'retain-on-failure' },
  projects: [
    ...functional,
    { name: 'visual-desktop', testMatch: /visual\.spec/, use: { ...desktop, ...shared } },
    { name: 'visual-mobile', testMatch: /visual\.spec/, use: { ...mobile, ...shared } },
  ],
  webServer: builds.map(build => ({
    command: `node serve.mjs ${BUILDS[build].dir} ${BUILDS[build].port}`,
    url: baseURL(build),
    reuseExistingServer: true,
  })),
});
