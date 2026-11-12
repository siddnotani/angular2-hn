import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { Link } from 'react-router-dom';

import { HNAPI_BASE_URL } from '../../api/baseUrl';
import type { Comment } from '../../models/comment';
import type { Story } from '../../models/story';
import { AppRoutes } from '../../routes';
import { fixture, fixtureManifest } from '../../test/fixtures';
import { mockColorScheme } from '../../test/matchMedia';
import { location, pageContent, Providers, renderApp } from '../../test/renderApp';
import { server } from '../../test/server';

const { storyId, pollId, askId, jobId } = fixtureManifest;

async function renderItem(id: number | string) {
  const view = renderApp(`/item/${id}`);
  await waitFor(() => expect(view.container.querySelector('.item')).not.toBeNull());
  return view;
}

const countComments = (comments: Comment[]): number =>
  comments.reduce((n, c) => n + 1 + countComments(c.comments), 0);

describe('ItemDetails', () => {
  it('shows the loader inside .main-content until the item arrives, scrolling to the top once', async () => {
    const { container } = renderApp(`/item/${storyId}`);
    await waitFor(() => expect(container.querySelector('app-item-details .main-content app-loader')).not.toBeNull());
    await waitFor(() => expect(container.querySelector('.item')).not.toBeNull());
    expect(container.querySelector('app-loader')).toBeNull();
    expect(window.scrollTo).toHaveBeenCalledWith(0, 0);
  });

  it('renders a link story: title, domain, subtext and every comment of the tree', async () => {
    const story = fixture<Story>(`item/${storyId}`);
    const { container } = await renderItem(storyId);
    const titles = container.querySelectorAll('a.title');
    expect(titles).toHaveLength(2);
    for (const a of titles) {
      expect(a).toHaveAttribute('href', story.url);
      expect(a.textContent).toBe(` ${story.title} `);
    }
    expect(container.querySelector('.laptop .domain')!.textContent).toBe(`(${story.domain})`);
    expect(container.querySelector('.laptop .subtext')!.textContent).toBe(
      ` ${story.points} points by ${story.user} ${story.time_ago}  |  ${story.comments_count} comments `,
    );
    expect(container.querySelector('.laptop')!.className).toBe('laptop item-header');
    expect(container.querySelectorAll('app-comment')).toHaveLength(countComments(story.comments!));
    expect(container.querySelectorAll('ul.comment-list > li')).toHaveLength(story.comments!.length);
  });

  it('marks links to the current item active, like routerLinkActive', async () => {
    const { container } = await renderItem(storyId);
    const count = container.querySelector('.item-details a')!;
    expect(count).toHaveAttribute('href', `/item/${storyId}`);
    expect(count).toHaveClass('active');
    expect(screen.getAllByRole('link', { name: fixture<Story>(`item/${storyId}`).user! })[0]).not.toHaveClass('active');
  });

  it('opens the external title in a new tab when the setting is on', async () => {
    localStorage.setItem('openLinkInNewTab', 'true');
    const { container } = await renderItem(storyId);
    for (const a of container.querySelectorAll('a.title')) {
      expect(a).toHaveAttribute('target', '_blank');
      expect(a).toHaveAttribute('rel', 'noopener');
    }
  });

  it('renders an Ask HN post with an internal (active) title link and its HTML body', async () => {
    const ask = fixture<Story>(`item/${askId}`);
    const { container } = await renderItem(askId);
    for (const a of container.querySelectorAll('a.title')) {
      expect(a).toHaveAttribute('href', `/item/${askId}`);
      expect(a).toHaveClass('title', 'active');
      expect(a).not.toHaveAttribute('target');
    }
    expect(container.querySelector('.domain')).toBeNull();
    expect(container.querySelector('p.subject')!.innerHTML.length).toBeGreaterThan(0);
    expect(container.querySelector('p.subject')!.textContent).toBe(
      new DOMParser().parseFromString(ask.content!, 'text/html').body.textContent,
    );
  });

  it('renders a poll with each option, its points and a bar sized by points / poll_votes_count', async () => {
    const { container } = await renderItem(pollId);
    const options = container.querySelectorAll('.pollResults .pollContent');
    expect(options).toHaveLength(3);
    const expected = [73, 49, 179];
    options.forEach((opt, i) => {
      expect(opt.querySelector('.subtext')!.textContent).toBe(`${expected[i]} points`);
      expect((opt.querySelector('.pollBar') as HTMLElement).style.width).toBe(`${(expected[i] / 301) * 100}%`);
      const content = document.createElement('div');
      content.innerHTML = fixture<Story>(`item/${pollId + i + 1}`).content!;
      expect(opt.firstElementChild!.innerHTML).toBe(content.innerHTML);
    });
  });

  it('renders a job with only its time and no comment link', async () => {
    const job = fixture<Story>(`item/${jobId}`);
    const { container } = await renderItem(jobId);
    expect(container.querySelector('.laptop .subtext')!.textContent).toBe(` ${job.time_ago} `);
    expect(container.querySelector('.laptop')!.className).toBe('laptop item-header');
    expect(container.querySelector('.item-details')).toBeNull();
    expect(container.querySelector('.pollResults')).toBeNull();
  });

  it('omits item-header on the laptop block when a story has no comments', async () => {
    const story = { ...fixture<Story>(`item/${storyId}`), comments_count: 0, comments: [] };
    server.use(http.get(`${HNAPI_BASE_URL}/item/${storyId}`, () => HttpResponse.json(story)));
    const { container } = await renderItem(storyId);
    expect(container.querySelector('.laptop')!.className).toBe('laptop');
    expect(container.querySelector('.item-details a')!.textContent).toBe(' discuss ');
  });

  it('shows the error message when the item request fails', async () => {
    server.use(http.get(`${HNAPI_BASE_URL}/item/${storyId}`, () => HttpResponse.error()));
    const { container } = renderApp(`/item/${storyId}`);
    await waitFor(() => expect(container.querySelector('app-error-message')).not.toBeNull());
    expect(screen.getByText('Could not load item comments.')).toBeInTheDocument();
    expect(container.querySelector('app-loader')).toBeNull();
  });

  it('contains the render error for an unknown item ({error} body) to the page', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const { container } = renderApp('/item/99999999999');
    await waitFor(() => expect(container.querySelector('app-loader')).toBeNull());
    expect(pageContent(container)).toBe('');
  });

  it('keeps the current item (no loader) while navigating to another item, then swaps it', async () => {
    mockColorScheme(false);
    const { container } = render(
      <Providers path={`/item/${storyId}`}>
        <Link to={`/item/${askId}`}>next</Link>
        <AppRoutes />
      </Providers>,
    );
    await waitFor(() => expect(container.querySelector('.item')).not.toBeNull());
    server.use(
      http.get(`${HNAPI_BASE_URL}/item/${askId}`, async () => {
        await new Promise(r => setTimeout(r, 50));
        return HttpResponse.json(fixture(`item/${askId}`));
      }),
    );
    await userEvent.click(screen.getByRole('link', { name: 'next' }));
    expect(container.querySelector('app-loader')).toBeNull();
    expect(container.querySelector('a.title')).toHaveAttribute('href', fixture<Story>(`item/${storyId}`).url);
    await waitFor(() => expect(container.querySelector('a.title')).toHaveAttribute('href', `/item/${askId}`));
    expect(location.current).toBe(`/item/${askId}`);
  });

  it('goes back in history from the mobile back button', async () => {
    mockColorScheme(false);
    const { container } = render(
      <Providers path="/news/1">
        <Link to={`/item/${storyId}`}>open</Link>
        <AppRoutes />
      </Providers>,
    );
    await waitFor(() => expect(container.querySelector('ol')).not.toBeNull());
    await userEvent.click(screen.getByRole('link', { name: 'open' }));
    await waitFor(() => expect(container.querySelector('.item')).not.toBeNull());
    await userEvent.click(container.querySelector('.back-button')!);
    await waitFor(() => expect(location.current).toBe('/news/1'));
  });

  it.each(['/item', '/item/', `/ITEM/${storyId}`])('renders nothing for %s', async path => {
    const { container } = renderApp(path);
    await new Promise(r => setTimeout(r, 20));
    expect(pageContent(container)).toBe('');
  });

  it('carries Angular-style scope attributes', async () => {
    const { container } = await renderItem(storyId);
    expect(container.querySelector('.item')).toHaveAttribute('data-c-item-details');
  });
});
