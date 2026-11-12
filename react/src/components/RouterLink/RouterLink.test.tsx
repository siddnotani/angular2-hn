import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';

import { RouterLink } from './RouterLink';

const renderAt = (url: string, link: JSX.Element) => render(<MemoryRouter initialEntries={[url]}>{link}</MemoryRouter>);

describe('RouterLink', () => {
  it('adds active to the existing classes on a matching URL, without aria-current', () => {
    renderAt('/news/1', <RouterLink className="home-link" to="/news/1">home</RouterLink>);
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('class', 'home-link active');
    expect(link).toHaveAttribute('href', '/news/1');
    expect(link).not.toHaveAttribute('aria-current');
  });

  it('matches URLs below the link path, as routerLinkActive does by default', () => {
    renderAt('/item/1/extra', <RouterLink to="/item/1">item</RouterLink>);
    expect(screen.getByRole('link')).toHaveAttribute('class', 'active');
  });

  it('does not match a sibling path or a path that only shares a prefix', () => {
    renderAt('/news/10', <><RouterLink to="/news/1">one</RouterLink><RouterLink to="/news/2">two</RouterLink></>);
    for (const link of screen.getAllByRole('link')) expect(link).not.toHaveAttribute('class');
  });

  it('keeps the static class when inactive', () => {
    renderAt('/news/1', <RouterLink className="title" to="/item/5">t</RouterLink>);
    expect(screen.getByRole('link')).toHaveAttribute('class', 'title');
  });
});
