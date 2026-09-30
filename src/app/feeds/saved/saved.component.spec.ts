import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { SavedComponent } from './saved.component';
import { ItemComponent } from '../item/item.component';
import { PipesModule } from '../../shared/pipes/pipes.module';
import { SavedStoriesService } from '../../shared/services/saved-stories.service';
import { Story } from '../../shared/models/story';

describe('SavedComponent', () => {
  let fixture: ComponentFixture<SavedComponent>;
  let savedStoriesService: SavedStoriesService;

  function makeStory(id: number): Story {
    return { id, title: `Saved ${id}`, url: `https://example.com/${id}`, type: 'story', comments_count: 0 } as Story;
  }

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      imports: [RouterTestingModule, PipesModule],
      declarations: [SavedComponent, ItemComponent],
    });
    fixture = TestBed.createComponent(SavedComponent);
    savedStoriesService = TestBed.inject(SavedStoriesService);
  });

  afterEach(() => localStorage.clear());

  it('shows an empty message when nothing is saved', () => {
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.empty-message')).not.toBeNull();
    expect(fixture.nativeElement.querySelectorAll('item').length).toBe(0);
  });

  it('lists saved stories, most recently saved first', () => {
    savedStoriesService.save(makeStory(1));
    savedStoriesService.save(makeStory(2));
    fixture.detectChanges();

    const titles = Array.from(fixture.nativeElement.querySelectorAll('.title')).map((el: HTMLElement) => el.textContent.trim());
    expect(titles).toEqual(['Saved 2', 'Saved 1']);
    expect(fixture.nativeElement.querySelector('.empty-message')).toBeNull();
  });

  it('drops a story from the list when it is unsaved', () => {
    savedStoriesService.save(makeStory(1));
    fixture.detectChanges();

    (fixture.nativeElement.querySelector('.save-toggle') as HTMLElement).click();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelectorAll('item').length).toBe(0);
    expect(fixture.nativeElement.querySelector('.empty-message')).not.toBeNull();
  });
});
