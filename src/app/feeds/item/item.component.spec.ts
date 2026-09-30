import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA, Pipe, PipeTransform } from '@angular/core';

import { ItemComponent } from './item.component';
import { SavedPostsService } from '../../shared/services/saved-posts.service';
import { Story } from '../../shared/models/story';

@Pipe({ name: 'comment' })
class CommentPipeStub implements PipeTransform {
  transform(value: number): string {
    return String(value);
  }
}

describe('ItemComponent save toggle', () => {
  let fixture: ComponentFixture<ItemComponent>;
  let service: SavedPostsService;
  const story = { id: 7, title: 'Seven', url: 'https://example.com', type: 'story' } as Story;

  beforeEach(() => {
    localStorage.removeItem('savedPosts');
    TestBed.configureTestingModule({
      declarations: [ItemComponent, CommentPipeStub],
      schemas: [NO_ERRORS_SCHEMA]
    });
    service = TestBed.inject(SavedPostsService);
    fixture = TestBed.createComponent(ItemComponent);
    fixture.componentInstance.item = story;
    fixture.detectChanges();
  });

  afterEach(() => localStorage.removeItem('savedPosts'));

  function toggleLinks(): HTMLElement[] {
    return Array.from(fixture.nativeElement.querySelectorAll('.save-toggle'));
  }

  it('shows "save" when the post is not saved', () => {
    expect(toggleLinks().map(a => a.textContent.trim())).toEqual(['save', 'save']);
  });

  it('saves and unsaves the post on click', () => {
    toggleLinks()[0].click();
    fixture.detectChanges();
    expect(service.isSaved(7)).toBe(true);
    expect(toggleLinks().map(a => a.textContent.trim())).toEqual(['unsave', 'unsave']);

    toggleLinks()[1].click();
    fixture.detectChanges();
    expect(service.isSaved(7)).toBe(false);
  });
});
