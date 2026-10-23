import { afterEach, describe, expect, it, vi } from 'vitest';

import { FIREBASE_BASE_URL, HNAPI_BASE_URL, getUser, timeAgo } from './hackernews';

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
}

describe('getUser', () => {
  afterEach(() => vi.restoreAllMocks());

  it('returns the node-hnapi user when that request succeeds', async () => {
    const user = { id: 'alice', crated_time: 1, created: '1 year ago', karma: 10, avg: 1, about: 'hi' };
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(jsonResponse(user));

    await expect(getUser('alice')).resolves.toEqual(user);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0][0]).toBe(`${HNAPI_BASE_URL}/user/alice`);
  });

  it('falls back to the Firebase API and maps its fields when node-hnapi returns an error status', async () => {
    const fetchMock = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(jsonResponse({ error: 'not found' }, 404))
      .mockResolvedValueOnce(jsonResponse({ id: 'alice', created: 1_000_000, karma: 42, about: '<i>x</i>' }));

    const user = await getUser('alice');

    expect(fetchMock.mock.calls[1][0]).toBe(`${FIREBASE_BASE_URL}/user/alice.json`);
    expect(user).toMatchObject({ id: 'alice', crated_time: 1_000_000, karma: 42, about: '<i>x</i>' });
    expect(user.created).toMatch(/ago$/);
  });

  it('falls back to the Firebase API when node-hnapi has a network error', async () => {
    vi.spyOn(globalThis, 'fetch')
      .mockRejectedValueOnce(new TypeError('Failed to fetch'))
      .mockResolvedValueOnce(jsonResponse({ id: 'alice', created: 1_000_000, karma: 1 }));

    await expect(getUser('alice')).resolves.toMatchObject({ id: 'alice', karma: 1 });
  });

  it('rejects when Firebase returns null for an unknown user', async () => {
    vi.spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(jsonResponse({}, 404))
      .mockResolvedValueOnce(jsonResponse(null));

    await expect(getUser('nobody')).rejects.toThrow('User nobody not found');
  });

  it('rejects when both APIs fail', async () => {
    vi.spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(jsonResponse({}, 404))
      .mockResolvedValueOnce(jsonResponse({}, 500));

    await expect(getUser('alice')).rejects.toThrow(/status 500/);
  });

  it('does not fall back when the request is aborted', async () => {
    const fetchMock = vi
      .spyOn(globalThis, 'fetch')
      .mockRejectedValue(new DOMException('The operation was aborted.', 'AbortError'));
    const controller = new AbortController();

    await expect(getUser('alice', controller.signal)).rejects.toMatchObject({ name: 'AbortError' });
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0][1]).toEqual({ signal: controller.signal });
  });

  it('URL-encodes the user id', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(jsonResponse({ id: 'a b' }));

    await getUser('a b');

    expect(fetchMock.mock.calls[0][0]).toBe(`${HNAPI_BASE_URL}/user/a%20b`);
  });
});

describe('timeAgo', () => {
  const now = 1_700_000_000_000;
  const nowSeconds = now / 1000;

  it.each([
    [nowSeconds - 2 * 365 * 24 * 3600, '2 years ago'],
    [nowSeconds - 365 * 24 * 3600, '1 year ago'],
    [nowSeconds - 3 * 30 * 24 * 3600, '3 months ago'],
    [nowSeconds - 5 * 24 * 3600, '5 days ago'],
    [nowSeconds - 3600, '1 hour ago'],
    [nowSeconds - 120, '2 minutes ago'],
    [nowSeconds - 10, 'just now'],
    [nowSeconds + 100, 'just now'],
  ])('formats %d as %s', (created, expected) => {
    expect(timeAgo(created, now)).toBe(expected);
  });
});
