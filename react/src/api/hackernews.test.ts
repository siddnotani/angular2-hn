import { http, HttpResponse } from 'msw';

import type { Story } from '../models/story';
import { fixture } from '../test/fixtures';
import { server } from '../test/server';
import { HNAPI_BASE_URL } from './baseUrl';
import { fetchFeed, fetchItemContent, fetchPollContent, fetchUser } from './hackernews';

const POLL_ID = 126809;

describe('fetchFeed', () => {
  it.each(['news', 'newest', 'show', 'ask', 'jobs'] as const)('requests /%s?page=n', async feed => {
    const urls: string[] = [];
    server.events.on('request:start', ({ request }) => urls.push(request.url));
    const stories = await fetchFeed(feed, 1);
    expect(urls).toEqual([`${HNAPI_BASE_URL}/${feed}?page=1`]);
    expect(stories).toEqual(fixture(`${feed}/1`));
    expect(stories.length).toBeGreaterThan(0);
  });

  it('returns an empty list past the last page', async () => {
    expect(await fetchFeed('ask', 3)).toEqual([]);
  });

  it('rejects when node-hnapi answers with its HTML 404', async () => {
    await expect(fetchFeed('news', 99)).rejects.toThrow();
  });
});

describe('fetchItemContent', () => {
  it('returns a story with its nested comments', async () => {
    const story = await fetchItemContent(50467618);
    expect(story).toEqual(fixture('item/50467618'));
    expect(story.comments!.length).toBeGreaterThan(0);
  });

  it('returns the error body for an unknown item, like Angular did', async () => {
    expect(await fetchItemContent(1)).toEqual({ error: 'Item 1 not found' });
  });

  it('fetches poll option id+i for each option, replaces poll[i-1] and sums poll_votes_count', async () => {
    const urls: string[] = [];
    server.events.on('request:start', ({ request }) => urls.push(request.url));

    const poll = await fetchItemContent(POLL_ID);

    expect(urls.sort()).toEqual(
      [POLL_ID, POLL_ID + 1, POLL_ID + 2, POLL_ID + 3].map(id => `${HNAPI_BASE_URL}/item/${id}`),
    );
    const options = [1, 2, 3].map(i => fixture<Story>(`item/${POLL_ID + i}`));
    expect(poll.poll).toEqual(options);
    expect(poll.poll_votes_count).toBe(73 + 49 + 179);
    expect(poll.poll_votes_count).toBe(options.reduce((sum, o) => sum + o.points!, 0));
  });

  it('keeps option order even when responses arrive out of order', async () => {
    server.use(
      http.get(`${HNAPI_BASE_URL}/item/${POLL_ID + 1}`, async () => {
        await new Promise(r => setTimeout(r, 30));
        return HttpResponse.json(fixture(`item/${POLL_ID + 1}`));
      }),
    );
    const poll = await fetchItemContent(POLL_ID);
    expect(poll.poll!.map(o => o.points)).toEqual([73, 49, 179]);
  });

  it('uses id+i even when that is not the real option id', async () => {
    server.use(
      http.get(`${HNAPI_BASE_URL}/item/:id`, ({ params }) => {
        const id = Number(params.id);
        if (id === 500) return HttpResponse.json({ id, type: 'poll', poll: [{ item: 'a', points: 1 }, { item: 'b', points: 2 }] });
        return HttpResponse.json({ id, type: 'pollopt', points: id, content: `opt ${id}` });
      }),
    );
    const poll = await fetchItemContent(500);
    expect(poll.poll).toEqual([
      { id: 501, type: 'pollopt', points: 501, content: 'opt 501' },
      { id: 502, type: 'pollopt', points: 502, content: 'opt 502' },
    ]);
    expect(poll.poll_votes_count).toBe(1003);
  });

  it('leaves a failed option as returned and excludes it from the count, like Angular', async () => {
    server.use(http.get(`${HNAPI_BASE_URL}/item/${POLL_ID + 2}`, () => HttpResponse.html('nope', { status: 500 })));
    const poll = await fetchItemContent(POLL_ID);
    const original = fixture<Story>(`item/${POLL_ID}`).poll!;
    expect(poll.poll![0]).toEqual(fixture(`item/${POLL_ID + 1}`));
    expect(poll.poll![1]).toEqual(original[1]);
    expect(poll.poll![2]).toEqual(fixture(`item/${POLL_ID + 3}`));
    expect(poll.poll_votes_count).toBe(73 + 179);
  });

  it('sets poll_votes_count to 0 for a poll with no options', async () => {
    server.use(http.get(`${HNAPI_BASE_URL}/item/7`, () => HttpResponse.json({ id: 7, type: 'poll', poll: [] })));
    expect((await fetchItemContent(7)).poll_votes_count).toBe(0);
  });

  it('does not touch non-poll items', async () => {
    const urls: string[] = [];
    server.events.on('request:start', ({ request }) => urls.push(request.url));
    const job = await fetchItemContent(50452404);
    expect(urls).toHaveLength(1);
    expect(job).not.toHaveProperty('poll_votes_count');
  });

  it('rejects when aborted', async () => {
    const controller = new AbortController();
    const pending = fetchItemContent(POLL_ID, controller.signal);
    controller.abort();
    await expect(pending).rejects.toMatchObject({ name: 'AbortError' });
  });
});

it('passes the abort signal through on success', async () => {
  const stories = await fetchFeed('news', 1, new AbortController().signal);
  expect(stories).toEqual(fixture('news/1'));
});

describe('fetchPollContent', () => {
  it('returns the poll option item', async () => {
    expect(await fetchPollContent(POLL_ID + 1)).toEqual(fixture(`item/${POLL_ID + 1}`));
  });
});

describe('fetchUser', () => {
  it('returns the recorded user', async () => {
    const user = await fetchUser('pg');
    expect(user).toEqual(fixture('user/pg'));
    expect(user.id).toBe('pg');
  });

  it('rejects when node-hnapi answers with its HTML 404 (the live /user/* behaviour)', async () => {
    await expect(fetchUser('nobody')).rejects.toThrow();
  });
});
