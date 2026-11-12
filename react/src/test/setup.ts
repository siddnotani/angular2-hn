import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';

import { server } from './server';

// Node's fetch/Request reject jsdom's AbortSignal, so strip it and honour it here instead.
// Installed after server.listen() so it wraps MSW's patched fetch.
function signalSafe(fetchFn: typeof fetch): typeof fetch {
  return (input, init) => {
    const signal = init?.signal;
    if (!signal) return fetchFn(input, init);
    signal.throwIfAborted();
    return new Promise((resolve, reject) => {
      const onAbort = () => reject(signal.reason);
      signal.addEventListener('abort', onAbort, { once: true });
      fetchFn(input, { ...init, signal: undefined })
        .then(resolve, reject)
        .finally(() => signal.removeEventListener('abort', onAbort));
    });
  };
}

// jsdom doesn't implement scrolling.
if (typeof window !== 'undefined') window.scrollTo = vi.fn() as typeof window.scrollTo;

// index.html defines the GA `ga()` queue; tests get a fresh spy each.
beforeEach(() => {
  if (typeof window !== 'undefined') window.ga = vi.fn();
});

let mswFetch: typeof fetch;
beforeAll(() => {
  server.listen({ onUnhandledRequest: 'error' });
  mswFetch = globalThis.fetch;
  globalThis.fetch = signalSafe(mswFetch);
});
afterEach(() => {
  cleanup();
  server.resetHandlers();
  server.events.removeAllListeners();
  globalThis.localStorage?.clear();
});
afterAll(() => {
  globalThis.fetch = mswFetch;
  server.close();
});
