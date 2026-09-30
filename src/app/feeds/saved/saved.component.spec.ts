import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';

import { SavedComponent } from './saved.component';
import { SavedPostsService } from '../../shared/services/saved-posts.service';
import { Story } from '../../shared/models/story';

describe('SavedComponent', () => {
  let fixture: ComponentFixture<SavedComponent>;
  let service: SavedPostsService;

  beforeEach(() => {
    localStorage.removeItem('savedPosts');
    spyOn(window, 'scrollTo');
    TestBed.configureTestingModule({
      declarations: [SavedComponent],
      schemas: [NO_ERRORS_SCHEMA]
    });
    service = TestBed.inject(SavedPostsService);
    fixture = TestBed.createComponent(SavedComponent);
  });

  afterEach(() => localStorage.removeItem('savedPosts'));

  it('shows an empty state when nothing is saved', () => {
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector('.empty-message')).not.toBeNull();
    expect(el.querySelectorAll('item').length).toBe(0);
  });

  it('renders saved posts and updates when one is removed', () => {
    service.toggle({ id: 1, title: 'One' } as Story);
    service.toggle({ id: 2, title: 'Two' } as Story);
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelectorAll('item').length).toBe(2);

    service.remove(1);
    fixture.detectChanges();
    expect(el.querySelectorAll('item').length).toBe(1);
    expect(el.querySelector('.empty-message')).toBeNull();
  });
});
