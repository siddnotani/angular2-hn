import type { Feed } from '../models/feedType';
import type { PollResult } from '../models/pollResult';
import type { Story } from '../models/story';
import type { User } from '../models/user';
import { HNAPI_BASE_URL } from './baseUrl';

// Like Angular's lazyFetch: no `res.ok` check, so a node-hnapi HTML 404 fails in `res.json()`
// and a JSON error body (e.g. `{ error: 'Item 1 not found' }`) is returned as data.
async function lazyFetch<T>(url: string, signal?: AbortSignal): Promise<T> {
  const res = await fetch(url, { signal });
  return res.json() as Promise<T>;
}

export function fetchFeed(feedType: Feed, page: number, signal?: AbortSignal): Promise<Story[]> {
  return lazyFetch(`${HNAPI_BASE_URL}/${feedType}?page=${page}`, signal);
}

export function fetchPollContent(id: number, signal?: AbortSignal): Promise<PollResult> {
  return lazyFetch(`${HNAPI_BASE_URL}/item/${id}`, signal);
}

// For polls, option i (1-based) is fetched as item `story.id + i`, replaces `story.poll[i - 1]`
// and adds its points to `story.poll_votes_count`, as in the Angular service. Angular ignored
// failed option requests (the entry keeps its original value), so failures are ignored here too.
// Angular filled the options in after emitting the story; this resolves once they have all settled.
export async function fetchItemContent(id: number, signal?: AbortSignal): Promise<Story> {
  const story = await lazyFetch<Story>(`${HNAPI_BASE_URL}/item/${id}`, signal);
  if (story.type === 'poll') {
    const poll = story.poll!;
    const numberOfPollOptions = poll.length;
    story.poll_votes_count = 0;
    const requests: Promise<void>[] = [];
    for (let i = 1; i <= numberOfPollOptions; i++) {
      requests.push(
        fetchPollContent(story.id + i, signal).then(pollResults => {
          poll[i - 1] = pollResults;
          story.poll_votes_count! += pollResults.points;
        }),
      );
    }
    await Promise.allSettled(requests);
    signal?.throwIfAborted();
  }
  return story;
}

export function fetchUser(id: string, signal?: AbortSignal): Promise<User> {
  return lazyFetch(`${HNAPI_BASE_URL}/user/${id}`, signal);
}
