// The recorded API, answered the way node-hnapi answers: unknown items are a 200 `{error}`,
// anything else without a fixture an HTML 404. react/src/test/server.ts (MSW) does the same.
import { readFileSync } from 'node:fs';

export const API_ORIGIN = 'https://node-hnapi.herokuapp.com';

const FIXTURES = new URL('../fixtures/', import.meta.url);

/** @param {string} path */
const read = path => {
  try {
    return readFileSync(new URL(`${path}.json`, FIXTURES), 'utf8');
  } catch {
    return undefined;
  }
};

/**
 * @template [T=unknown]
 * @param {string} path
 * @returns {T}
 */
export const fixture = path => JSON.parse(read(path) ?? 'null');

/** @param {string} url */
export function apiResponse(url) {
  const { pathname, searchParams } = new URL(url);
  const [, kind, id, ...rest] = pathname.split('/');
  /** @param {string} body */
  const json = body => ({ status: 200, contentType: 'application/json', body });
  const notFound = {
    status: 404,
    contentType: 'text/html; charset=utf-8',
    body: `<!DOCTYPE html><html><body><pre>Cannot GET ${pathname}</pre></body></html>`,
  };
  if (rest.length) return notFound;
  if (kind === 'item' && id) return json(read(`item/${id}`) ?? JSON.stringify({ error: `Item ${id} not found` }));
  const path = kind === 'user' && id ? `user/${id}` : id === undefined ? `${kind}/${searchParams.get('page')}` : null;
  const body = path && read(path);
  return body ? json(body) : notFound;
}
