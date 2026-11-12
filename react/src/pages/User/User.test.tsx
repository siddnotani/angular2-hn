import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { Link } from 'react-router-dom';

import { HNAPI_BASE_URL } from '../../api/baseUrl';
import type { User } from '../../models/user';
import { AppRoutes } from '../../routes';
import { fixture, fixtureManifest } from '../../test/fixtures';
import { mockColorScheme } from '../../test/matchMedia';
import { location, Providers, renderApp } from '../../test/renderApp';
import { server } from '../../test/server';

const { userId } = fixtureManifest;

describe('User', () => {
  it('shows the loader, then the profile', async () => {
    const user = fixture<User>(`user/${userId}`);
    const { container } = renderApp(`/user/${userId}`);
    await waitFor(() => expect(container.querySelector('app-user > app-loader')).not.toBeNull());
    await waitFor(() => expect(container.querySelector('.profile')).not.toBeNull());
    expect(container.querySelector('app-loader')).toBeNull();
    expect(container.querySelector('.title-block')!.textContent).toBe(` Profile: ${user.id} `);
    expect(container.querySelector('.name')!.textContent).toBe(user.id);
    expect(container.querySelector('.right')!.textContent).toBe(`${user.karma} ★`);
    expect(container.querySelector('.age')!.textContent).toBe(`Created ${user.created}`);
    expect(container.querySelector('.other-details p')!.innerHTML).toBe(user.about);
  });

  it('omits the about block when the user has none', async () => {
    const user: User = { ...fixture<User>(`user/${userId}`), about: undefined };
    server.use(http.get(`${HNAPI_BASE_URL}/user/${userId}`, () => HttpResponse.json(user)));
    const { container } = renderApp(`/user/${userId}`);
    await waitFor(() => expect(container.querySelector('.profile')).not.toBeNull());
    expect(container.querySelector('.other-details')).toBeNull();
  });

  it('sanitizes the about HTML', async () => {
    const user = { ...fixture<User>(`user/${userId}`), about: '<a href="javascript:alert(1)" style="x">hi</a>' };
    server.use(http.get(`${HNAPI_BASE_URL}/user/${userId}`, () => HttpResponse.json(user)));
    const { container } = renderApp(`/user/${userId}`);
    await waitFor(() => expect(container.querySelector('.profile')).not.toBeNull());
    expect(container.querySelector('.other-details p')!.innerHTML).toBe('<a>hi</a>');
  });

  it('shows "Could not load user <id>." on the live API’s HTML 404', async () => {
    const { container } = renderApp('/user/nobody');
    await waitFor(() => expect(container.querySelector('app-error-message')).not.toBeNull());
    expect(screen.getByText('Could not load user nobody.')).toBeInTheDocument();
  });

  it('goes back in history from the mobile back button', async () => {
    mockColorScheme(false);
    const { container } = render(
      <Providers path="/news/1">
        <Link to={`/user/${userId}`}>open</Link>
        <AppRoutes />
      </Providers>,
    );
    await waitFor(() => expect(container.querySelector('ol')).not.toBeNull());
    await userEvent.click(screen.getByRole('link', { name: 'open' }));
    await waitFor(() => expect(container.querySelector('.profile')).not.toBeNull());
    await userEvent.click(container.querySelector('.back-button')!);
    await waitFor(() => expect(location.current).toBe('/news/1'));
  });

  it('carries the Angular-style host attribute used by `:host ::ng-deep pre`', async () => {
    const { container } = renderApp(`/user/${userId}`);
    await waitFor(() => expect(container.querySelector('.profile')).not.toBeNull());
    expect(container.querySelector('app-user')).toHaveAttribute('data-h-user');
    expect(container.querySelector('.profile')).toHaveAttribute('data-c-user');
  });
});
