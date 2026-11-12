import { HNAPI_BASE_URL } from '../api/baseUrl';
import { fixture, fixtureManifest } from './fixtures';

describe('fixture server', () => {
  it('serves recorded feed pages by feed type and page', async () => {
    const res = await fetch(`${HNAPI_BASE_URL}/news?page=1`);
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual(fixture('news/1'));
  });

  it('serves an empty recorded page', async () => {
    const res = await fetch(`${HNAPI_BASE_URL}/ask?page=3`);
    expect(await res.json()).toEqual([]);
  });

  it('serves items and users', async () => {
    const item = await (await fetch(`${HNAPI_BASE_URL}/item/${fixtureManifest.pollId}`)).json();
    expect(item.type).toBe('poll');
    const user = await (await fetch(`${HNAPI_BASE_URL}/user/${fixtureManifest.userId}`)).json();
    expect(user.id).toBe(fixtureManifest.userId);
  });

  it('answers unknown items like node-hnapi: 200 with an error body', async () => {
    const res = await fetch(`${HNAPI_BASE_URL}/item/1`);
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ error: 'Item 1 not found' });
  });

  it('answers unrecorded feed pages and users with an HTML 404', async () => {
    for (const url of [`${HNAPI_BASE_URL}/news?page=99`, `${HNAPI_BASE_URL}/user/nobody`]) {
      const res = await fetch(url);
      expect(res.status).toBe(404);
      expect(res.headers.get('content-type')).toContain('text/html');
      await expect(res.json()).rejects.toThrow();
    }
  });
});
