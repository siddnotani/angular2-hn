import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';

import { HNAPI_BASE_URL } from '../../api/baseUrl';
import { FEEDS } from '../../models/feedType';
import type { Story } from '../../models/story';
import { fixture } from '../../test/fixtures';
import { mockColorScheme } from '../../test/matchMedia';
import { location, pageContent, Providers, renderApp } from '../../test/renderApp';
import { AppRoutes } from '../../routes';
import { server } from '../../test/server';

async function renderFeed(path: string) {
  const view = renderApp(path);
  await waitFor(() => expect(view.container.querySelector('ol')).not.toBeNull());
  return view;
}

const nav = (c: HTMLElement) => c.querySelector('.nav')!;

describe('Feed routes', () => {
  it('redirects / to /news/1', async () => {
    await renderFeed('/');
    expect(location.current).toBe('/news/1');
  });

  it('keeps the query string on the redirect', async () => {
    await renderFeed('/?utm=x');
    expect(location.current).toBe('/news/1?utm=x');
  });

  it.each(FEEDS)('/%s/1 lists page 1 with a More link to /%s/2 and no Prev', async feed => {
    const { container } = await renderFeed(`/${feed}/1`);
    const stories = fixture<Story[]>(`${feed}/1`);
    expect(container.querySelectorAll('li.post')).toHaveLength(stories.length);
    expect(container.querySelector('ol')).toHaveAttribute('start', '1');
    expect(container.querySelector('li.post a.title')!.textContent).toBe(` ${stories[0].title} `);
    expect(nav(container).querySelector('.prev')).toBeNull();
    expect(nav(container).querySelector('.more')).toHaveAttribute('href', `/${feed}/2`);
  });

  it('numbers page 2 from 31 and links Prev/More to the neighbouring pages', async () => {
    const { container } = await renderFeed('/news/2');
    expect(container.querySelector('ol')).toHaveAttribute('start', '31');
    expect(nav(container).querySelector('.prev')).toHaveAttribute('href', '/news/1');
    expect(nav(container).querySelector('.prev')!.textContent).toBe(' ‹ Prev ');
    expect(nav(container).querySelector('.more')).toHaveAttribute('href', '/news/3');
    expect(nav(container).querySelector('.more')!.textContent).toBe(' More › ');
  });

  it('hides More on a short last page', async () => {
    const { container } = await renderFeed('/ask/2');
    expect(container.querySelectorAll('li.post')).toHaveLength(1);
    expect(nav(container).querySelector('.more')).toBeNull();
    expect(nav(container).querySelector('.prev')).toHaveAttribute('href', '/ask/1');
  });

  it('renders an empty list with only Prev past the last page', async () => {
    const { container } = await renderFeed('/ask/3');
    expect(container.querySelector('ol')!.children).toHaveLength(0);
    expect(container.querySelector('ol')).toHaveAttribute('start', '61');
    expect(nav(container).querySelector('.more')).toBeNull();
    expect(nav(container).querySelector('.prev')).toHaveAttribute('href', '/ask/2');
  });

  it('shows the YC jobs header and no list-margin on jobs only', async () => {
    const jobs = await renderFeed('/jobs/1');
    expect(jobs.container.querySelector('.job-header')!.textContent).toBe(
      ' These are jobs at startups that were funded by Y Combinator. You can also get a job at a YC startup through Triplebyte. ',
    );
    expect(jobs.container.querySelector('.job-header a')).toHaveAttribute('href', 'https://triplebyte.com/?ref=yc_jobs');
    expect(jobs.container.querySelector('ol')).not.toHaveClass('list-margin');
    jobs.unmount();

    const news = await renderFeed('/news/1');
    expect(news.container.querySelector('.job-header')).toBeNull();
    expect(news.container.querySelector('ol')).toHaveClass('list-margin');
  });

  it('shows the loader until the page arrives, then scrolls to the top', async () => {
    const { container } = renderApp('/news/1');
    expect(container.querySelector('app-loader .loader')!.textContent).toBe(' Loading... ');
    await waitFor(() => expect(container.querySelector('ol')).not.toBeNull());
    expect(container.querySelector('app-loader')).toBeNull();
    expect(window.scrollTo).toHaveBeenCalledWith(0, 0);
  });

  it('shows the error message when the first load fails', async () => {
    server.use(http.get(`${HNAPI_BASE_URL}/show`, () => HttpResponse.error()));
    const { container } = renderApp('/show/1');
    await waitFor(() => expect(container.querySelector('app-error-message')).not.toBeNull());
    expect(container.querySelector('.error-section .strong')!.textContent).toBe('Could not load show stories.');
    expect(container.querySelector('app-loader')).toBeNull();
    expect(container.querySelector('ol')).toBeNull();
  });

  it('keeps the current list (no loader) while the next page of the same feed loads', async () => {
    const { container } = await renderFeed('/news/1');
    let release!: () => void;
    server.use(
      http.get(`${HNAPI_BASE_URL}/news`, async () => {
        await new Promise<void>(r => (release = r));
        return HttpResponse.json(fixture('news/2'));
      }),
    );
    await userEvent.click(nav(container).querySelector('.more')!);
    expect(location.current).toBe('/news/2');
    expect(container.querySelector('app-loader')).toBeNull();
    expect(container.querySelector('ol')).toHaveAttribute('start', '1');
    await waitFor(() => expect(release).toBeDefined());
    act(() => release());
    await waitFor(() => expect(container.querySelector('ol')).toHaveAttribute('start', '31'));
    expect(container.querySelector('li.post a.title')!.textContent).toBe(` ${fixture<Story[]>('news/2')[0].title} `);
  });

  it('keeps the current list instead of the error when a later page fails', async () => {
    const { container } = await renderFeed('/news/1');
    server.use(http.get(`${HNAPI_BASE_URL}/news`, () => HttpResponse.error()));
    await userEvent.click(nav(container).querySelector('.more')!);
    await new Promise(r => setTimeout(r, 50));
    expect(container.querySelector('app-error-message')).toBeNull();
    expect(container.querySelectorAll('li.post')).toHaveLength(30);
  });

  it('remounts with a loader when switching feeds', async () => {
    mockColorScheme(false);
    const { container } = render(
      <Providers path="/news/1">
        <AppRoutes />
      </Providers>,
    );
    await waitFor(() => expect(container.querySelector('ol')).not.toBeNull());
    server.use(
      http.get(`${HNAPI_BASE_URL}/show`, async () => {
        await new Promise(r => setTimeout(r, 50));
        return HttpResponse.json(fixture('show/1'));
      }),
    );
    await userEvent.click(screen.getByRole('link', { name: 'show' }));
    expect(container.querySelector('app-loader')).not.toBeNull();
    expect(container.querySelector('ol')).toBeNull();
    const show = fixture<Story[]>('show/1');
    await waitFor(() => expect(container.querySelector('li.post a.title')!.textContent).toBe(` ${show[0].title} `));
  });

  it.each(['/news', '/news/', '/NEWS/1', '/top/1', '/news/1/extra'])('renders nothing inside the layout for %s', path => {
    const { container } = renderApp(path);
    expect(pageContent(container)).toBe('');
  });

  it('uses NaN for a non-numeric page, like +params.page', async () => {
    const urls: string[] = [];
    server.use(http.get(`${HNAPI_BASE_URL}/news`, ({ request }) => {
      urls.push(request.url);
      return HttpResponse.json(fixture('news/1'));
    }));
    const { container } = await renderFeed('/news/abc');
    expect(container.querySelector('ol')).toHaveAttribute('start', 'NaN');
    expect(urls).toEqual([`${HNAPI_BASE_URL}/news?page=NaN`]);
    expect(nav(container).querySelector('.prev')).toHaveAttribute('href', '/news/NaN');
  });
});
