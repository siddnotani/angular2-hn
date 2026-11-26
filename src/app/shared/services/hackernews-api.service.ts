import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import fetch from 'unfetch';
import {map } from 'rxjs/operators';

import { Story } from '../models/story';
import { User } from '../models/user';
import { PollResult } from '../models/poll-result';

interface FirebaseUser {
  id: string;
  created: number;
  karma: number;
  about?: string;
}

// wrap fetch in observable so we can keep it chill
@Injectable()
export class HackerNewsAPIService {
  baseUrl: string;

  constructor() {
    this.baseUrl = 'https://node-hnapi.herokuapp.com';
  }

  fetchFeed(feedType: string, page: number): Observable<Story[]> {
    return lazyFetch(`${this.baseUrl}/${feedType}?page=${page}`);
  }

  fetchItemContent(id: number): Observable<Story> {
    return lazyFetch(`${this.baseUrl}/item/${id}`).pipe(map((story: Story) => {
      if (story.type === 'poll') {
        let numberOfPollOptions = story.poll.length;
        story.poll_votes_count = 0;
        for (let i = 1; i <= numberOfPollOptions; i++) {
          this.fetchPollContent(story.id + i).subscribe(pollResults => {
            story.poll[i - 1] = pollResults;
            story.poll_votes_count += pollResults.points;
          });
        }
      }
      return story;
    }));
  }

  fetchPollContent(id: number): Observable<PollResult> {
    return lazyFetch(`${this.baseUrl}/item/${id}`);
  }

  fetchUser(id: string): Observable<User> {
    return lazyFetch<FirebaseUser | null>(
      `https://hacker-news.firebaseio.com/v0/user/${encodeURIComponent(id)}.json`
    ).pipe(map(user => {
      if (!user) {
        throw new Error('User not found');
      }

      return {
        id: user.id,
        created: new Date(user.created * 1000).toISOString().slice(0, 10),
        karma: user.karma,
        about: user.about
      };
    }));
  }
}

function lazyFetch<T>(url, options?) {
  return new Observable<T>(fetchObserver => {
    let cancelToken = false;
    fetch(url, options)
      .then(res => {
        if (!cancelToken) {
          return res.json()
            .then(data => {
              fetchObserver.next(data);
              fetchObserver.complete();
            });
        }
      }).catch(err => fetchObserver.error(err));
    return () => {
      cancelToken = true;
    };
  });
}

