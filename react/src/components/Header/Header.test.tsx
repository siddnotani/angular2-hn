import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { location, renderApp } from '../../test/renderApp';

const header = () => document.querySelector('app-header > header') as HTMLElement;

describe('Header', () => {
  it('renders the logo link, the nav with " | " separators and the settings cog', () => {
    renderApp('/news/1');
    expect(within(header()).getByAltText('Logo')).toHaveAttribute('src', 'assets/images/logo.svg');
    expect(within(header()).getByAltText('Settings')).toHaveAttribute('src', 'assets/images/cog.svg');
    expect(header().querySelector('.home-link')).toHaveAttribute('href', '/news/1');
    expect(header().querySelector('.header-nav')!.textContent).toBe('new | show | ask | jobs');
    const hrefs = [...header().querySelectorAll('.header-nav a')].map(a => a.getAttribute('href'));
    expect(hrefs).toEqual(['/newest/1', '/show/1', '/ask/1', '/jobs/1']);
  });

  it.each([
    ['/news/1', '.home-link'],
    ['/newest/1', 'a[href="/newest/1"]'],
    ['/jobs/1', 'a[href="/jobs/1"]'],
  ])('marks the link for %s active, like routerLinkActive', (path, selector) => {
    renderApp(path);
    const active = header().querySelectorAll('a.active');
    expect(active).toHaveLength(1);
    expect(active[0]).toBe(header().querySelector(selector));
  });

  it('marks nothing active on page 2 of a feed (only /<feed>/1 is linked)', () => {
    renderApp('/show/2');
    expect(header().querySelectorAll('a.active')).toHaveLength(0);
  });

  it('navigates and scrolls to the top when a nav link is clicked', async () => {
    renderApp('/news/1');
    await userEvent.click(within(header()).getByRole('link', { name: 'ask' }));
    await waitFor(() => expect(location.current).toBe('/ask/1'));
    expect(window.scrollTo).toHaveBeenCalledWith(0, 0);
  });

  it('opens and closes the settings panel from the cog, and closes it from ×', async () => {
    renderApp('/news/1');
    expect(document.querySelector('app-settings')).toBeNull();
    await userEvent.click(screen.getByAltText('Settings'));
    expect(header().querySelector('app-settings #popup1')).not.toBeNull();
    await userEvent.click(screen.getByAltText('Settings'));
    expect(document.querySelector('app-settings')).toBeNull();
    await userEvent.click(screen.getByAltText('Settings'));
    await userEvent.click(screen.getByText('×'));
    expect(document.querySelector('app-settings')).toBeNull();
  });

  it('carries Angular-style scope attributes', () => {
    renderApp('/news/1');
    expect(document.querySelector('#header')).toHaveAttribute('data-c-header');
  });
});
