import { Injectable } from '@angular/core';

import { Story } from '../models/story';

export const SAVED_STORIES_KEY = 'savedStories';

@Injectable({
  providedIn: 'root'
})
export class SavedStoriesService {
  private stories: Story[] = readSavedStories();

  get savedStories(): Story[] {
    return this.stories;
  }

  isSaved(id: number): boolean {
    return this.stories.some(story => story.id === id);
  }

  save(story: Story) {
    if (this.isSaved(story.id)) {
      return;
    }
    this.stories = [toSnapshot(story), ...this.stories];
    this.persist();
  }

  remove(id: number) {
    this.stories = this.stories.filter(story => story.id !== id);
    this.persist();
  }

  toggle(story: Story): boolean {
    if (this.isSaved(story.id)) {
      this.remove(story.id);
      return false;
    }
    this.save(story);
    return true;
  }

  private persist() {
    localStorage.setItem(SAVED_STORIES_KEY, JSON.stringify(this.stories));
  }
}

function readSavedStories(): Story[] {
  try {
    const parsed = JSON.parse(localStorage.getItem(SAVED_STORIES_KEY));
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function toSnapshot(story: Story): Story {
  return {
    id: story.id,
    title: story.title,
    points: story.points,
    user: story.user,
    time: story.time,
    time_ago: story.time_ago,
    type: story.type,
    url: story.url,
    domain: story.domain,
    comments_count: story.comments_count,
  } as Story;
}
