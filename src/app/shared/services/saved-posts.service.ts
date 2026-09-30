import { Injectable } from '@angular/core';

import { Story } from '../models/story';

const STORAGE_KEY = 'savedPosts';

@Injectable({
  providedIn: 'root'
})
export class SavedPostsService {
  savedPosts: Story[] = this.load();

  isSaved(id: number): boolean {
    return this.savedPosts.some(post => post.id === id);
  }

  toggle(story: Story) {
    if (this.isSaved(story.id)) {
      this.remove(story.id);
    } else {
      this.savedPosts.unshift(story);
      this.persist();
    }
  }

  remove(id: number) {
    const index = this.savedPosts.findIndex(post => post.id === id);
    if (index !== -1) {
      this.savedPosts.splice(index, 1);
      this.persist();
    }
  }

  private load(): Story[] {
    try {
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY));
      return Array.isArray(stored) ? stored : [];
    } catch {
      return [];
    }
  }

  private persist() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.savedPosts));
  }
}
