// @vitest-environment node
import { readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

import { isLazyAsset, pwaOptions } from './pwaOptions';

const ngsw = JSON.parse(readFileSync(new URL('../../ngsw-config.json', import.meta.url), 'utf8'));
const workbox = pwaOptions.workbox!;
const url = (path: string) => new URL(path, 'https://angular2-hn.firebaseapp.com');

describe('PWA options mirror ngsw-config.json', () => {
  it('precaches the "app" (prefetch) group: root index.html, favicon, css and js', () => {
    const app = ngsw.assetGroups.find((g: { name: string }) => g.name === 'app');
    expect(app.installMode).toBe('prefetch');
    expect(app.resources.files).toEqual(['/favicon.ico', '/index.html', '/*.css', '/*.js', '/manifest.webmanifest']);
    expect(workbox.globPatterns).toEqual(['index.html', 'favicon.ico', '*.css', '*.js']);
  });

  it('only treats Vite-hashed chunks as already versioned, so index.html and favicon get revisions', () => {
    const re = workbox.dontCacheBustURLsMatching!;
    for (const f of ['index-DQEXZGhs.js', 'User-CnoC976j.css']) expect(re.test(f)).toBe(true);
    for (const f of ['index.html', 'favicon.ico', 'registerSW.js']) expect(re.test(f)).toBe(false);
  });

  it('caches the "assets" (lazy) group on first request, same-origin only', () => {
    const assets = ngsw.assetGroups.find((g: { name: string }) => g.name === 'assets');
    expect(assets.installMode).toBe('lazy');
    expect(assets.resources.files).toEqual(['/assets/**', '/*.(eot|svg|cur|jpg|png|webp|gif|otf|ttf|woff|woff2|ani)']);
    expect(workbox.runtimeCaching).toHaveLength(1);
    expect(workbox.runtimeCaching![0].handler).toBe('StaleWhileRevalidate');
    for (const p of ['/assets/images/logo.svg', '/assets/icons/browserconfig.xml', '/font.woff2', '/x.png']) {
      expect(isLazyAsset(url(p), true)).toBe(true);
    }
    for (const p of ['/main.js', '/index.html', '/news/1', '/sub/x.png', '/x.pngx']) {
      expect(isLazyAsset(url(p), true)).toBe(false);
    }
    expect(isLazyAsset(new URL('https://node-hnapi.herokuapp.com/assets/x.png'), false)).toBe(false);
  });

  it('never caches API responses (no dataGroups)', () => {
    expect(ngsw.dataGroups).toBeUndefined();
    expect(isLazyAsset(new URL('https://node-hnapi.herokuapp.com/news?page=1'), false)).toBe(false);
  });

  it('serves index.html for navigations, excluding ngsw’s default navigationUrls exclusions', () => {
    expect(ngsw.index).toBe('/index.html');
    expect(workbox.navigateFallback).toBe('index.html');
    const denied = (p: string) => workbox.navigateFallbackDenylist!.some(re => re.test(p));
    for (const p of ['/news/1', '/item/126809', '/user/pg', '/']) expect(denied(p)).toBe(false);
    for (const p of ['/manifest.json', '/a/b.txt', '/__x', '/a/__b/c']) expect(denied(p)).toBe(true);
  });

  it('adds no web manifest of its own (the app ships src/manifest.json)', () => {
    expect(pwaOptions.manifest).toBe(false);
  });
});
