import { HackerNewsAPIService } from './hackernews-api.service';

describe('HackerNewsAPIService', () => {
  let service: HackerNewsAPIService;
  let openSpy: jasmine.Spy;

  beforeEach(() => {
    service = new HackerNewsAPIService();
    openSpy = spyOn(XMLHttpRequest.prototype, 'open');
    spyOn(XMLHttpRequest.prototype, 'send');
  });

  function requestedUrl(): string {
    return openSpy.calls.mostRecent().args[1];
  }

  describe('fetchUser', () => {
    it('requests the user endpoint for a normal username', () => {
      service.fetchUser('pg').subscribe();
      expect(requestedUrl()).toBe('https://node-hnapi.herokuapp.com/user/pg');
    });

    it('keeps usernames with - and _ unchanged', () => {
      service.fetchUser('some_user-1').subscribe();
      expect(requestedUrl()).toBe('https://node-hnapi.herokuapp.com/user/some_user-1');
    });

    it('encodes path traversal so the id stays a single path segment', () => {
      service.fetchUser('../item/1').subscribe();
      expect(requestedUrl()).toBe('https://node-hnapi.herokuapp.com/user/..%2Fitem%2F1');
    });

    it('encodes query and fragment characters so the id cannot add a query', () => {
      service.fetchUser('x?foo=bar&baz=1#frag').subscribe();
      expect(requestedUrl()).toBe('https://node-hnapi.herokuapp.com/user/x%3Ffoo%3Dbar%26baz%3D1%23frag');
    });
  });
});
