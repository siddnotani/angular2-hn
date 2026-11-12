import { render } from '@testing-library/react';
import { act } from 'react';

import type { Story } from '../../models/story';
import { useSettings, type SettingsContextValue } from '../../settings/SettingsContext';
import { fixture } from '../../test/fixtures';
import { mockColorScheme } from '../../test/matchMedia';
import { Providers } from '../../test/renderApp';
import { Item } from './Item';

const link = fixture<Story[]>('news/1')[0];
const job = fixture<Story[]>('jobs/1')[0];
const askHn = fixture<Story[]>('ask/1')[0];

let settings: SettingsContextValue;
function SettingsSpy() {
  settings = useSettings();
  return null;
}

function renderItem(item: Story) {
  mockColorScheme(false);
  return render(
    <Providers>
      <SettingsSpy />
      <Item item={item} />
    </Providers>,
  );
}

const titleLink = (container: HTMLElement) => container.querySelector('a.title')!;

describe('Item', () => {
  it('links external stories to their URL and shows the domain', () => {
    const { container } = renderItem(link);
    expect(titleLink(container)).toHaveAttribute('href', link.url);
    expect(titleLink(container).textContent).toBe(` ${link.title} `);
    expect(container.querySelector('.domain')!.textContent).toBe(`(${link.domain})`);
  });

  it('links stories without an http URL to their item page, with no domain', () => {
    expect(askHn.url.startsWith('http')).toBe(false);
    const { container } = renderItem(askHn);
    expect(titleLink(container)).toHaveAttribute('href', `/item/${askHn.id}`);
    expect(container.querySelector('.domain')).toBeNull();
  });

  it('omits the domain span when the story has none', () => {
    const { container } = renderItem({ ...link, domain: undefined });
    expect(container.querySelector('.domain')).toBeNull();
  });

  it('renders the laptop subtext: points, user, relative time and comment count', () => {
    const { container } = renderItem(link);
    const laptop = container.querySelector('.subtext-laptop')!;
    expect(laptop.textContent).toBe(` ${link.points} points by ${link.user} ${link.time_ago}  |  ${link.comments_count} comments `);
    expect(laptop.querySelector(`a[href="/user/${link.user}"]`)).not.toBeNull();
    expect(laptop.querySelector('.item-details a')).toHaveAttribute('href', `/item/${link.id}`);
  });

  it('renders the mobile subtext', () => {
    const { container } = renderItem(link);
    const palm = container.querySelector('.subtext-palm')!;
    expect(palm.querySelector('.name a')).toHaveAttribute('href', `/user/${link.user}`);
    expect(palm.querySelector('.right')!.textContent).toBe(`${link.points} ★`);
    expect(palm.querySelector('.comment-number')!.textContent).toBe(` • ${link.comments_count} comments `);
  });

  it.each([
    [0, 'discuss'],
    [1, '1 comment'],
    [7, '7 comments'],
  ])('formats %s comments as "%s"', (count, text) => {
    const { container } = renderItem({ ...link, comments_count: count });
    expect(container.querySelector('.comment-number')!.textContent).toBe(` • ${text} `);
    expect(container.querySelector('.item-details a')!.textContent).toBe(` ${text} `);
  });

  it('shows only the relative time for jobs', () => {
    const { container } = renderItem(job);
    expect(container.querySelector('.subtext-palm .name')).toBeNull();
    expect(container.querySelector('.comment-number')).toBeNull();
    const laptop = container.querySelector('.subtext-laptop')!;
    expect(laptop.children).toHaveLength(1);
    expect(laptop.children[0]).not.toHaveAttribute('class');
    expect(laptop.textContent).toBe(` ${job.time_ago} `);
  });

  it('applies title font size, list spacing and open-in-new-tab from settings', () => {
    const { container } = renderItem(link);
    expect(titleLink(container)).toHaveStyle({ fontSize: '16px' });
    expect(titleLink(container)).not.toHaveAttribute('target');
    expect(titleLink(container)).not.toHaveAttribute('rel');
    expect(container.firstElementChild).toHaveStyle({ marginBottom: '0px' });

    act(() => {
      settings.setFont('22');
      settings.setSpacing('12');
      settings.toggleOpenLinksInNewTab();
    });
    expect(titleLink(container)).toHaveStyle({ fontSize: '22px' });
    expect(container.firstElementChild).toHaveStyle({ marginBottom: '12px' });
    expect(titleLink(container)).toHaveAttribute('target', '_blank');
    expect(titleLink(container)).toHaveAttribute('rel', 'noopener');
  });

  it('never opens internal title links in a new tab', () => {
    localStorage.setItem('openLinkInNewTab', 'true');
    const { container } = renderItem(askHn);
    expect(titleLink(container)).not.toHaveAttribute('target');
  });

  it('carries the Angular-style scope attribute', () => {
    const { container } = renderItem(link);
    expect(titleLink(container)).toHaveAttribute('data-c-item');
  });
});
