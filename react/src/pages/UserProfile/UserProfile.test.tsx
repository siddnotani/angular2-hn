import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, useLocation, useNavigate, useRoutes } from 'react-router-dom';
import type { NavigateFunction } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { getUser } from '../../api/hackernews';
import type { User } from '../../models/user';
import { routes } from '../../router';

vi.mock('../../api/hackernews', () => ({ getUser: vi.fn() }));

const getUserMock = vi.mocked(getUser);

const user: User = {
  id: 'pg',
  crated_time: 1160418092,
  created: '20 years ago',
  karma: 157316,
  about: 'Bug fixer. <a href="https://example.com">link</a>',
};

// Uses MemoryRouter rather than a data router: jsdom's AbortSignal is rejected by Node's Request.
function renderAt(path: string, initialEntries: string[] = [path]) {
  const router: { navigate: NavigateFunction; pathname: string } = {
    navigate: () => {},
    pathname: '',
  };

  function TestRoutes() {
    router.navigate = useNavigate();
    router.pathname = useLocation().pathname;
    return useRoutes([...routes, { path: '/previous', element: <p>Previous page</p> }]);
  }

  render(
    <MemoryRouter initialEntries={initialEntries} initialIndex={initialEntries.length - 1}>
      <TestRoutes />
    </MemoryRouter>,
  );
  return router;
}

describe('UserProfile', () => {
  beforeEach(() => getUserMock.mockReset());
  afterEach(() => vi.restoreAllMocks());

  it('shows the loader while the user is loading', () => {
    getUserMock.mockReturnValue(new Promise(() => {}));

    renderAt('/user/pg');

    expect(screen.getByTestId('loader')).toBeInTheDocument();
    expect(getUserMock).toHaveBeenCalledWith('pg', expect.any(AbortSignal));
  });

  it('renders the profile with about as HTML once loaded', async () => {
    getUserMock.mockResolvedValue(user);

    renderAt('/user/pg');

    expect(await screen.findByText('Profile: pg')).toBeInTheDocument();
    expect(screen.getByText('157316 ★')).toBeInTheDocument();
    expect(screen.getByText('Created 20 years ago')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'link' })).toHaveAttribute('href', 'https://example.com');
    expect(screen.queryByTestId('loader')).not.toBeInTheDocument();
  });

  it('omits the about section when the user has none', async () => {
    getUserMock.mockResolvedValue({ ...user, about: undefined });

    renderAt('/user/pg');

    await screen.findByText('Profile: pg');
    expect(document.querySelector('.otherDetails')).toBeNull();
  });

  it('shows the error message when the user cannot be loaded', async () => {
    getUserMock.mockRejectedValue(new Error('User nope not found'));

    renderAt('/user/nope');

    expect(await screen.findByRole('alert')).toHaveTextContent('Could not load user nope.');
    expect(screen.queryByTestId('loader')).not.toBeInTheDocument();
  });

  it('aborts the in-flight request on unmount and ignores the resulting rejection', async () => {
    let signal: AbortSignal | undefined;
    let rejectRequest: (reason: unknown) => void = () => {};
    getUserMock.mockImplementation((_id, s) => {
      signal = s;
      return new Promise((_resolve, reject) => {
        rejectRequest = reject;
      });
    });

    const router = renderAt('/user/pg');
    expect(signal?.aborted).toBe(false);

    await act(async () => router.navigate('/previous'));
    expect(signal?.aborted).toBe(true);

    await act(async () => rejectRequest(new DOMException('Aborted', 'AbortError')));
    expect(screen.getByText('Previous page')).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('reloads when the id param changes', async () => {
    getUserMock.mockImplementation(async id => ({ ...user, id }));

    const router = renderAt('/user/pg');
    await screen.findByText('Profile: pg');

    await act(async () => router.navigate('/user/dang'));

    expect(await screen.findByText('Profile: dang')).toBeInTheDocument();
    expect(getUserMock).toHaveBeenLastCalledWith('dang', expect.any(AbortSignal));
  });

  it('goBack navigates to the previous history entry', async () => {
    getUserMock.mockResolvedValue(user);

    const router = renderAt('/user/pg', ['/previous', '/user/pg']);
    await screen.findByText('Profile: pg');

    await userEvent.click(screen.getByRole('button', { name: 'Go back' }));

    expect(router.pathname).toBe('/previous');
    expect(screen.getByText('Previous page')).toBeInTheDocument();
  });
});
