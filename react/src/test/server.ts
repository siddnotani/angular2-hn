import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

import { HNAPI_BASE_URL } from '../api/baseUrl';
import { fixture, hasFixture } from './fixtures';

function serve(path: string) {
  return hasFixture(path) ? HttpResponse.json(fixture(path)) : HttpResponse.json({ error: 'Not found' }, { status: 404 });
}

// Serves node-hnapi URLs from the recorded fixtures; anything not recorded is a 404.
export const handlers = [
  http.get(`${HNAPI_BASE_URL}/item/:id`, ({ params }) => serve(`item/${params.id}`)),
  http.get(`${HNAPI_BASE_URL}/user/:id`, ({ params }) => serve(`user/${params.id}`)),
  http.get(`${HNAPI_BASE_URL}/:feed`, ({ params, request }) => {
    const page = new URL(request.url).searchParams.get('page');
    return serve(`${params.feed}/${page}`);
  }),
];

export const server = setupServer(...handlers);
