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

  it('returns 404 for anything not recorded', async () => {
    expect((await fetch(`${HNAPI_BASE_URL}/item/1`)).status).toBe(404);
    expect((await fetch(`${HNAPI_BASE_URL}/news?page=99`)).status).toBe(404);
  });
});
