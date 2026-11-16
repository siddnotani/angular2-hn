import { Story } from '../models/story';
import { SAVED_POSTS_KEY, SavedPostsService } from './saved-posts.service';

function story(id: number, extra: Partial<Story> = {}): Story {
  return { id, title: `Story ${id}`, ...extra } as Story;
}

describe('SavedPostsService', () => {
  beforeEach(() => localStorage.removeItem(SAVED_POSTS_KEY));
  afterAll(() => localStorage.removeItem(SAVED_POSTS_KEY));

  it('starts empty when nothing is stored', () => {
    const service = new SavedPostsService();
    expect(service.list()).toEqual([]);
    expect(service.isSaved(1)).toBe(false);
  });

  it('saves a story, newest first, and persists it to localStorage', () => {
    const service = new SavedPostsService();
    service.toggle(story(1));
    service.toggle(story(2));

    expect(service.isSaved(1)).toBe(true);
    expect(service.list().map(s => s.id)).toEqual([2, 1]);
    expect(JSON.parse(localStorage.getItem(SAVED_POSTS_KEY)).map(s => s.id)).toEqual([2, 1]);
  });

  it('unsaves a story that is already saved', () => {
    const service = new SavedPostsService();
    service.toggle(story(1));
    service.toggle(story(1));

    expect(service.isSaved(1)).toBe(false);
    expect(service.list()).toEqual([]);
    expect(JSON.parse(localStorage.getItem(SAVED_POSTS_KEY))).toEqual([]);
  });

  it('does not store comments in the snapshot', () => {
    const service = new SavedPostsService();
    service.toggle(story(1, { comments: [{} as any] }));

    expect('comments' in service.list()[0]).toBe(false);
  });

  it('loads saved posts from a previous session', () => {
    localStorage.setItem(SAVED_POSTS_KEY, JSON.stringify([story(5)]));
    const service = new SavedPostsService();

    expect(service.isSaved(5)).toBe(true);
    expect(service.list().length).toBe(1);
  });

  it('ignores corrupt or non-array stored data', () => {
    localStorage.setItem(SAVED_POSTS_KEY, '{not json');
    expect(new SavedPostsService().list()).toEqual([]);

    localStorage.setItem(SAVED_POSTS_KEY, '{"id": 1}');
    expect(new SavedPostsService().list()).toEqual([]);
  });
});
