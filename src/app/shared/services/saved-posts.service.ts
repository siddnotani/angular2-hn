import { Injectable } from '@angular/core';

import { Story } from '../models/story';

export const SAVED_POSTS_KEY = 'savedPosts';

@Injectable({
  providedIn: 'root'
})
export class SavedPostsService {
  private posts: Story[] = this.load();

  list(): Story[] {
    return this.posts;
  }

  isSaved(id: number): boolean {
    return this.posts.some(post => post.id === id);
  }

  toggle(story: Story): void {
    if (this.isSaved(story.id)) {
      this.posts = this.posts.filter(post => post.id !== story.id);
    } else {
      const { comments, ...snapshot } = story;
      this.posts = [snapshot as Story, ...this.posts];
    }
    localStorage.setItem(SAVED_POSTS_KEY, JSON.stringify(this.posts));
  }

  private load(): Story[] {
    try {
      const parsed = JSON.parse(localStorage.getItem(SAVED_POSTS_KEY));
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
}
