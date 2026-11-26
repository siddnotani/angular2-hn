import { HackerNewsAPIService } from './hackernews-api.service';

describe('HackerNewsAPIService.fetchUser', () => {
  let service: HackerNewsAPIService;
  let openSpy: jasmine.Spy;
  let response: string;

  beforeEach(() => {
    service = new HackerNewsAPIService();
    openSpy = spyOn(XMLHttpRequest.prototype, 'open');
    spyOnProperty(XMLHttpRequest.prototype, 'status', 'get').and.returnValue(200);
    spyOnProperty(XMLHttpRequest.prototype, 'responseText', 'get').and.callFake(() => response);
    spyOn(XMLHttpRequest.prototype, 'send').and.callFake(function(this: XMLHttpRequest) {
      this.dispatchEvent(new Event('load'));
    });
  });

  it('fetches the Firebase profile and maps it to the displayed fields', async () => {
    response = JSON.stringify({
      id: 'pg',
      created: 1160418092,
      karma: 157316,
      about: 'Bug fixer.',
      submitted: [39667625]
    });

    const user = await service.fetchUser('pg').toPromise();

    expect(openSpy.calls.mostRecent().args[1]).toBe('https://hacker-news.firebaseio.com/v0/user/pg.json');
    expect(user).toEqual({ id: 'pg', created: '2006-10-09', karma: 157316, about: 'Bug fixer.' });
  });

  it('encodes the username as a single URL path segment', async () => {
    response = JSON.stringify({ id: 'some_user-1', created: 1160418092, karma: 0 });

    await service.fetchUser('some_user-1/?#').toPromise();

    expect(openSpy.calls.mostRecent().args[1]).toBe(
      'https://hacker-news.firebaseio.com/v0/user/some_user-1%2F%3F%23.json'
    );
  });

  it('reports a missing profile as an error', done => {
    response = 'null';

    service.fetchUser('missing-user').subscribe(
      () => done.fail('Expected a missing profile to fail'),
      error => {
        expect(error.message).toBe('User not found');
        done();
      },
      () => done.fail('Expected a missing profile to fail')
    );
  });
});
