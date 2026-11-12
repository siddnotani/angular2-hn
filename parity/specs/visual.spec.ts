import { mkdirSync, writeFileSync } from 'node:fs';
import type { Page } from '@playwright/test';
import pixelmatch from 'pixelmatch';
import { PNG } from 'pngjs';

import { baseURL } from '../builds';
import { expect, manifest, test } from '../fixtures';

// Share of pixels allowed to differ between the Angular and React screenshots, after
// pixelmatch's per-pixel colour threshold (anti-aliasing is ignored).
const MAX_DIFF_RATIO = 0.001;

const ROUTES: [string, string][] = [
  ['news-1', '/news/1'],
  ['news-2', '/news/2'],
  ['newest-1', '/newest/1'],
  ['show-1', '/show/1'],
  ['ask-1', '/ask/1'],
  ['ask-3-empty', '/ask/3'],
  ['jobs-1', '/jobs/1'],
  ['item-story', `/item/${manifest.storyId}`],
  ['item-poll', `/item/${manifest.pollId}`],
  ['item-ask', `/item/${manifest.askId}`],
  ['item-job', `/item/${manifest.jobId}`],
  ['user', `/user/${manifest.userId}`],
  ['error-feed', '/news/9'],
  ['error-user', '/user/nobody-here'],
];

// Text nodes and link/image/input attributes in document order. Angular merges
// `text {{ expr }} text` into one text node where JSX splits it (split runs are shaped separately,
// shifting glyphs by sub-pixels), and NavLink-style aria attributes change the accessibility tree.
// `scoped` marks elements carrying a component style scope (`_ngcontent-*` / `data-c-*`); inputs
// are compared by state, since Angular sets properties where React writes attributes.
const domSummary = (page: Page) =>
  page.evaluate(() => {
    const framework = /^(_ngcontent|_nghost|data-c-|data-h-|ng-reflect|routerlink)/;
    const scope = /^(_ngcontent|data-c-)/;
    const walker = document.createTreeWalker(document.querySelector('app-root')!, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT);
    const out: string[] = [];
    while (walker.nextNode()) {
      const node = walker.currentNode;
      if (node instanceof Text) out.push(JSON.stringify(node.textContent));
      else if (node instanceof Element && ['A', 'IMG', 'INPUT'].includes(node.tagName)) {
        const attrs = [...node.attributes]
          .filter(a => !framework.test(a.name) && !(node instanceof HTMLInputElement && ['checked', 'value'].includes(a.name)))
          .map(a => `${a.name}=${JSON.stringify(a.value)}`)
          .sort();
        if ([...node.attributes].some(a => scope.test(a.name))) attrs.push('scoped');
        if (node instanceof HTMLInputElement) attrs.push(`.checked=${node.checked}`, `.value=${JSON.stringify(node.value)}`);
        out.push(`<${node.tagName.toLowerCase()} ${attrs.join(' ')}>`);
      }
    }
    return out;
  });

async function shoot(page: Page, url: string, openSettings: boolean) {
  await page.goto(url);
  await page.waitForLoadState('networkidle');
  await expect(page.locator('app-loader')).toHaveCount(0);
  if (openSettings) await page.getByAltText('Settings').click();
  await page.evaluate(() => document.fonts.ready);
  const png = PNG.sync.read(await page.screenshot({ fullPage: true, animations: 'disabled', caret: 'hide' }));
  return { png, dom: await domSummary(page) };
}

function diff(a: PNG, b: PNG) {
  const width = Math.max(a.width, b.width);
  const height = Math.max(a.height, b.height);
  const pad = (img: PNG) => {
    if (img.width === width && img.height === height) return img;
    const out = new PNG({ width, height });
    PNG.bitblt(img, out, 0, 0, img.width, img.height, 0, 0);
    return out;
  };
  const out = new PNG({ width, height });
  const pixels = pixelmatch(pad(a).data, pad(b).data, out.data, width, height, { threshold: 0.1 });
  return { out, ratio: pixels / (width * height), sameSize: a.width === b.width && a.height === b.height };
}

for (const theme of ['default', 'night', 'amoledblack']) {
  test.describe(`${theme} theme`, () => {
    test.use({ theme });

    for (const [name, path] of [...ROUTES, ['settings-open', '/news/1'] as [string, string]]) {
      test(`${name} matches Angular`, async ({ context }, info) => {
        const [angular, react] = await Promise.all([context.newPage(), context.newPage()]);
        const settings = name === 'settings-open';
        const [{ png: a, dom: angularDom }, { png: r, dom: reactDom }] = await Promise.all([
          shoot(angular, baseURL('angular') + path, settings),
          shoot(react, baseURL('react') + path, settings),
        ]);
        const { out, ratio, sameSize } = diff(a, r);

        const dir = info.outputPath();
        mkdirSync(dir, { recursive: true });
        for (const [file, png] of [['angular.png', a], ['react.png', r], ['diff.png', out]] as const) {
          writeFileSync(`${dir}/${file}`, PNG.sync.write(png));
          await info.attach(file, { path: `${dir}/${file}`, contentType: 'image/png' });
        }
        info.annotations.push({ type: 'diff', description: `${(ratio * 100).toFixed(3)}% (${a.width}x${a.height} vs ${r.width}x${r.height})` });

        expect(reactDom).toEqual(angularDom);
        expect(sameSize, `screenshot size ${a.width}x${a.height} vs ${r.width}x${r.height}`).toBe(true);
        expect(ratio).toBeLessThanOrEqual(MAX_DIFF_RATIO);
      });
    }
  });
}
