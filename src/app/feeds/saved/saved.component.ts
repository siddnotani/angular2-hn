import { Component } from '@angular/core';

import { SavedStoriesService } from '../../shared/services/saved-stories.service';
import { Story } from '../../shared/models/story';

@Component({
  selector: 'app-saved',
  templateUrl: './saved.component.html',
  styleUrls: ['../feed/feed.component.scss', './saved.component.scss']
})
export class SavedComponent {
  constructor(private savedStoriesService: SavedStoriesService) { }

  get items(): Story[] {
    return this.savedStoriesService.savedStories;
  }
}
