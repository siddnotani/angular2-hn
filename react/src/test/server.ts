import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

import { HNAPI_BASE_URL } from '../api/baseUrl';
import { fixture, hasFixture } from './fixtures';

// node-hnapi answers unknown routes (including every /user/* today) with an Express HTML 404.
export function cannotGet(pathname: string) {
  return HttpResponse.html(`<!DOCTYPE html><html><body><pre>Cannot GET ${pathname}</pre></body></html>`, {
    status: 404,
  });
}

function serve(path: string, pathname: string) {
  return hasFixture(path) ? HttpResponse.json(fixture(path)) : cannotGet(pathname);
}

// Serves node-hnapi URLs from the recorded fixtures, mirroring the live API's failure modes:
// unknown items are a 200 with an `error` body, anything else not recorded is an HTML 404.
export const handlers = [
  http.get(`${HNAPI_BASE_URL}/item/:id`, ({ params }) =>
    hasFixture(`item/${params.id}`)
      ? HttpResponse.json(fixture(`item/${params.id}`))
      : HttpResponse.json({ error: `Item ${params.id} not found` }),
  ),
  http.get(`${HNAPI_BASE_URL}/user/:id`, ({ params, request }) =>
    serve(`user/${params.id}`, new URL(request.url).pathname),
  ),
  http.get(`${HNAPI_BASE_URL}/:feed`, ({ params, request }) => {
    const url = new URL(request.url);
    return serve(`${params.feed}/${url.searchParams.get('page')}`, url.pathname);
  }),
];

export const server = setupServer(...handlers);
