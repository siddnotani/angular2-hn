import { CommonModule } from '@angular/common';
import { Component, NgZone } from '@angular/core';
import { async, ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';

import { routing } from '../../app.routes';
import { SharedComponentsModule } from '../../shared/components/shared-components.module';
import { Story } from '../../shared/models/story';
import { PipesModule } from '../../shared/pipes/pipes.module';
import { HackerNewsAPIService } from '../../shared/services/hackernews-api.service';
import { ItemComponent } from '../item/item.component';
import { FeedComponent } from './feed.component';

@Component({ template: '<router-outlet></router-outlet>' })
class TestHostComponent {}

describe('feed routes', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let fetchFeed: jasmine.Spy;

  beforeEach(async(() => {
    fetchFeed = jasmine.createSpy('fetchFeed').and.returnValue(of([
      { id: 1, title: 'Test story', type: 'story', url: '/item/1' } as Story
    ]));
    return TestBed.configureTestingModule({
      declarations: [TestHostComponent, FeedComponent, ItemComponent],
      imports: [CommonModule, routing, RouterTestingModule, SharedComponentsModule, PipesModule],
      providers: [{ provide: HackerNewsAPIService, useValue: { fetchFeed } }]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TestHostComponent);
    fixture.detectChanges();
  });

  for (const feed of ['news', 'newest', 'show', 'ask', 'jobs']) {
    it(`renders the story list on /${feed}/2`, fakeAsync(() => {
      fixture.debugElement.injector.get(NgZone).run(() => {
        TestBed.inject(Router).navigateByUrl(`/${feed}/2`);
      });
      tick();
      fixture.detectChanges();

      const list = fixture.nativeElement.querySelector('app-feed ol') as HTMLOListElement;
      expect(fetchFeed).toHaveBeenCalledWith(feed, 2);
      expect(list.start).toBe(31);
      expect(list.textContent).toContain('Test story');
    }));
  }
});
