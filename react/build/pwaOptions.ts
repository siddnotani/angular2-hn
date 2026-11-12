import type { VitePWAOptions } from 'vite-plugin-pwa';

// Mirrors ../ngsw-config.json. Angular only registers its worker in production builds, which
// is also when vite-plugin-pwa emits one.
//
// "app" (installMode: prefetch): /favicon.ico, /index.html, /*.css, /*.js, /manifest.webmanifest
//   → precached. The build puts chunks at the root (assetsDir ''), like Angular's, so the same
//   root-only globs apply. There is no manifest.webmanifest in the app, so that entry never matched.
// "assets" (installMode: lazy, updateMode: prefetch): /assets/** and root font/image files
//   → cached on first request. StaleWhileRevalidate serves the cached copy like ngsw and picks
//   up changed files in the background (ngsw re-fetched changed ones on each app update).
// No dataGroups → API responses are never cached.
// "index": "/index.html" + ngsw's default navigationUrls → navigateFallback with the same exclusions.
export const HASHED_CHUNK = /-[A-Za-z0-9_-]{8}\.(js|css)$/;

export const NGSW_ASSET_FILE = /^\/[^/]*\.(eot|svg|cur|jpg|png|webp|gif|otf|ttf|woff|woff2|ani)$/;

export function isLazyAsset(url: URL, sameOrigin: boolean) {
  return sameOrigin && (url.pathname.startsWith('/assets/') || NGSW_ASSET_FILE.test(url.pathname));
}

export const pwaOptions: Partial<VitePWAOptions> = {
  registerType: 'autoUpdate',
  injectRegister: 'script',
  manifest: false,
  workbox: {
    globPatterns: ['index.html', 'favicon.ico', '*.css', '*.js'],
    // vite-plugin-pwa derives this from assetsDir; with '' it would skip revisions for index.html too.
    dontCacheBustURLsMatching: HASHED_CHUNK,
    navigateFallback: 'index.html',
    navigateFallbackDenylist: [/^\/(?:.+\/)?[^/]*\.[^/]*$/, /^\/(?:.+\/)?[^/]*__[^/]*$/, /^\/(?:.+\/)?[^/]*__[^/]*\/.*$/],
    cleanupOutdatedCaches: true,
    runtimeCaching: [
      {
        urlPattern: ({ url, sameOrigin }) => isLazyAsset(url, sameOrigin),
        handler: 'StaleWhileRevalidate',
        options: { cacheName: 'assets' },
      },
    ],
  },
};
