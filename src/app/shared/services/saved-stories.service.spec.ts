import { SavedStoriesService, SAVED_STORIES_KEY } from './saved-stories.service';
import { Story } from '../models/story';

function makeStory(id: number, extra: Partial<Story> = {}): Story {
  return {
    id,
    title: `Story ${id}`,
    points: 10,
    user: 'alice',
    time: 1600000000,
    time_ago: 3,
    type: 'story',
    url: `https://example.com/${id}`,
    domain: 'example.com',
    comments_count: 2,
    ...extra,
  } as Story;
}

describe('SavedStoriesService', () => {
  let service: SavedStoriesService;

  beforeEach(() => {
    localStorage.clear();
    service = new SavedStoriesService();
  });

  afterEach(() => localStorage.clear());

  it('starts empty when nothing is stored', () => {
    expect(service.savedStories).toEqual([]);
    expect(service.isSaved(1)).toBe(false);
  });

  it('saves a story, newest first, and persists it to localStorage', () => {
    service.save(makeStory(1));
    service.save(makeStory(2));

    expect(service.savedStories.map(s => s.id)).toEqual([2, 1]);
    expect(service.isSaved(1)).toBe(true);
    expect(JSON.parse(localStorage.getItem(SAVED_STORIES_KEY)).map(s => s.id)).toEqual([2, 1]);
  });

  it('does not duplicate an already saved story', () => {
    service.save(makeStory(1));
    service.save(makeStory(1));

    expect(service.savedStories.length).toBe(1);
  });

  it('removes a story and persists the removal', () => {
    service.save(makeStory(1));
    service.save(makeStory(2));
    service.remove(1);

    expect(service.savedStories.map(s => s.id)).toEqual([2]);
    expect(JSON.parse(localStorage.getItem(SAVED_STORIES_KEY)).map(s => s.id)).toEqual([2]);
  });

  it('toggle saves an unsaved story and unsaves a saved one', () => {
    expect(service.toggle(makeStory(1))).toBe(true);
    expect(service.isSaved(1)).toBe(true);

    expect(service.toggle(makeStory(1))).toBe(false);
    expect(service.isSaved(1)).toBe(false);
  });

  it('restores saved stories from localStorage on construction', () => {
    service.save(makeStory(7));

    const reloaded = new SavedStoriesService();
    expect(reloaded.isSaved(7)).toBe(true);
    expect(reloaded.savedStories[0].title).toBe('Story 7');
  });

  it('falls back to empty when stored data is malformed', () => {
    localStorage.setItem(SAVED_STORIES_KEY, '{not json');
    expect(new SavedStoriesService().savedStories).toEqual([]);

    localStorage.setItem(SAVED_STORIES_KEY, '{"id": 1}');
    expect(new SavedStoriesService().savedStories).toEqual([]);
  });

  it('stores only list fields, not comments or poll data', () => {
    service.save(makeStory(3, { comments: [], poll: [] }));

    const stored = JSON.parse(localStorage.getItem(SAVED_STORIES_KEY))[0];
    expect(stored.comments).toBeUndefined();
    expect(stored.poll).toBeUndefined();
    expect(stored.title).toBe('Story 3');
  });
});
