import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { fixtureManifest } from '../test/fixtures';
import { location, renderApp } from '../test/renderApp';

const pageviews = () =>
  vi.mocked(window.ga).mock.calls.filter(c => c[0] === 'set').map(c => c[2]);

describe('Google Analytics pageviews', () => {
  it('sends set page + pageview for the initial route', async () => {
    renderApp('/show/2');
    await waitFor(() => expect(pageviews()).toEqual(['/show/2']));
    expect(window.ga).toHaveBeenNthCalledWith(1, 'set', 'page', '/show/2');
    expect(window.ga).toHaveBeenNthCalledWith(2, 'send', 'pageview');
  });

  it('reports the URL after the root redirect only, with its query string', async () => {
    renderApp('/?ref=x');
    await waitFor(() => expect(location.current).toBe('/news/1?ref=x'));
    expect(pageviews()).toEqual(['/news/1?ref=x']);
  });

  it('sends one pageview per navigation, including lazy item and user pages', async () => {
    renderApp('/news/1');
    await waitFor(() => expect(document.querySelector('ol')).not.toBeNull());
    await userEvent.click(within(document.querySelector('header')!).getByRole('link', { name: 'ask' }));
    await waitFor(() => expect(location.current).toBe('/ask/1'));
    await userEvent.click(document.querySelector('li.post .item-details a')!);
    await waitFor(() => expect(location.current).toMatch(/^\/item\/\d+$/));
    expect(pageviews()).toEqual(['/news/1', '/ask/1', location.current]);
  });

  it('does not resend when the same link is clicked again', async () => {
    renderApp('/news/1');
    await waitFor(() => expect(pageviews()).toHaveLength(1));
    await userEvent.click(screen.getByAltText('Logo'));
    expect(pageviews()).toHaveLength(1);
  });

  it.each(['/news', '/top/1', `/USER/${fixtureManifest.userId}`])('sends nothing for the unmatched URL %s', async path => {
    renderApp(path);
    await new Promise(r => setTimeout(r, 20));
    expect(window.ga).not.toHaveBeenCalled();
  });
});
