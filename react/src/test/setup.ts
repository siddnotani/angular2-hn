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
  localStorage.clear();
});
afterAll(() => {
  globalThis.fetch = mswFetch;
  server.close();
});
