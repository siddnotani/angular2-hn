import { SavedPostsService } from './saved-posts.service';
import { Story } from '../models/story';

function story(id: number): Story {
  return { id, title: 'Story ' + id } as Story;
}

describe('SavedPostsService', () => {
  beforeEach(() => localStorage.removeItem('savedPosts'));
  afterEach(() => localStorage.removeItem('savedPosts'));

  it('starts empty when nothing is stored', () => {
    expect(new SavedPostsService().savedPosts).toEqual([]);
  });

  it('hydrates saved posts from localStorage', () => {
    localStorage.setItem('savedPosts', JSON.stringify([story(1)]));
    const service = new SavedPostsService();
    expect(service.isSaved(1)).toBe(true);
    expect(service.savedPosts.length).toBe(1);
  });

  it('ignores corrupt or non-array stored values', () => {
    localStorage.setItem('savedPosts', '{not json');
    expect(new SavedPostsService().savedPosts).toEqual([]);
    localStorage.setItem('savedPosts', '{"id":1}');
    expect(new SavedPostsService().savedPosts).toEqual([]);
  });

  it('toggle saves newest first and persists', () => {
    const service = new SavedPostsService();
    service.toggle(story(1));
    service.toggle(story(2));
    expect(service.savedPosts.map(p => p.id)).toEqual([2, 1]);
    expect(JSON.parse(localStorage.getItem('savedPosts')).map(p => p.id)).toEqual([2, 1]);
  });

  it('toggle removes an already-saved post and persists', () => {
    const service = new SavedPostsService();
    service.toggle(story(1));
    service.toggle(story(1));
    expect(service.isSaved(1)).toBe(false);
    expect(JSON.parse(localStorage.getItem('savedPosts'))).toEqual([]);
  });

  it('remove is a no-op for unknown ids', () => {
    const service = new SavedPostsService();
    service.toggle(story(1));
    service.remove(99);
    expect(service.savedPosts.map(p => p.id)).toEqual([1]);
  });
});
