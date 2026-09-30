import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { ItemComponent } from './item.component';
import { PipesModule } from '../../shared/pipes/pipes.module';
import { SavedStoriesService } from '../../shared/services/saved-stories.service';
import { Story } from '../../shared/models/story';

describe('ItemComponent', () => {
  let fixture: ComponentFixture<ItemComponent>;
  let savedStoriesService: SavedStoriesService;

  const story = {
    id: 42,
    title: 'A story',
    points: 5,
    user: 'bob',
    time_ago: 1,
    type: 'story',
    url: 'https://example.com',
    domain: 'example.com',
    comments_count: 0,
  } as Story;

  function saveToggles(): HTMLElement[] {
    return Array.from(fixture.nativeElement.querySelectorAll('.save-toggle'));
  }

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      imports: [RouterTestingModule, PipesModule],
      declarations: [ItemComponent],
    });
    fixture = TestBed.createComponent(ItemComponent);
    savedStoriesService = TestBed.inject(SavedStoriesService);
    fixture.componentInstance.item = story;
    fixture.detectChanges();
  });

  afterEach(() => localStorage.clear());

  it('shows a save control for an unsaved story', () => {
    expect(saveToggles().length).toBe(2);
    saveToggles().forEach(el => expect(el.textContent.trim()).toBe('save'));
  });

  it('saves the story when the save control is clicked', () => {
    saveToggles()[0].click();
    fixture.detectChanges();

    expect(savedStoriesService.isSaved(42)).toBe(true);
    saveToggles().forEach(el => expect(el.textContent.trim()).toBe('unsave'));
  });

  it('unsaves an already saved story when clicked', () => {
    savedStoriesService.save(story);
    fixture.detectChanges();
    saveToggles()[1].click();
    fixture.detectChanges();

    expect(savedStoriesService.isSaved(42)).toBe(false);
    saveToggles().forEach(el => expect(el.textContent.trim()).toBe('save'));
  });
});
