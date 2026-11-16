import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';

import { SavedComponent } from './saved.component';
import { SavedPostsService } from '../../shared/services/saved-posts.service';
import { Story } from '../../shared/models/story';

describe('SavedComponent', () => {
  let fixture: ComponentFixture<SavedComponent>;
  let saved: Story[];

  beforeEach(() => {
    saved = [];
    TestBed.configureTestingModule({
      declarations: [SavedComponent],
      providers: [{ provide: SavedPostsService, useValue: { list: () => saved } }],
      schemas: [NO_ERRORS_SCHEMA]
    });
    fixture = TestBed.createComponent(SavedComponent);
  });

  it('shows an empty message when nothing is saved', () => {
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement;

    expect(el.querySelector('.empty-message')).not.toBeNull();
    expect(el.querySelectorAll('item').length).toBe(0);
  });

  it('renders one item per saved post', () => {
    saved = [{ id: 1 } as Story, { id: 2 } as Story];
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement;

    expect(el.querySelector('.empty-message')).toBeNull();
    expect(el.querySelectorAll('item').length).toBe(2);
  });
});
