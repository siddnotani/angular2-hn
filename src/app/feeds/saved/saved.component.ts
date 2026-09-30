import { Component, OnInit } from '@angular/core';

import { SavedPostsService } from '../../shared/services/saved-posts.service';
import { Story } from '../../shared/models/story';

@Component({
  selector: 'app-saved',
  templateUrl: './saved.component.html',
  styleUrls: ['../feed/feed.component.scss']
})
export class SavedComponent implements OnInit {
  constructor(private savedPostsService: SavedPostsService) {}

  get items(): Story[] {
    return this.savedPostsService.savedPosts;
  }

  ngOnInit() {
    window.scrollTo(0, 0);
  }
}
