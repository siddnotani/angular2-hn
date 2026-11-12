import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';

import type { Comment as CommentModel } from '../../models/comment';
import { routerFuture } from '../../routerFuture';
import { Comment } from './Comment';

const leaf = (id: number, user: string, extra: Partial<CommentModel> = {}): CommentModel => ({
  id,
  level: 0,
  user,
  time: 0,
  time_ago: '1 hour ago',
  content: `<p>text by ${user}</p>`,
  comments: [],
  ...extra,
});

const tree = leaf(1, 'alice', {
  comments: [leaf(2, 'bob', { comments: [leaf(3, 'carol', { comments: [leaf(4, 'dave')] })] }), leaf(5, 'erin')],
});

function renderComment(comment: CommentModel) {
  return render(
    <MemoryRouter future={routerFuture}>
      <Comment comment={comment} />
    </MemoryRouter>,
  );
}

const metaOf = (user: string) => screen.getByRole('link', { name: user }).closest('.meta') as HTMLElement;
const subtreeOf = (user: string) => metaOf(user).nextElementSibling!.firstElementChild as HTMLElement;
const toggle = (user: string) => within(metaOf(user)).getByText(/^\[[+-]\]$/);

describe('Comment', () => {
  it('renders the meta row: collapse toggle, user link and relative time', () => {
    renderComment(leaf(1, 'alice'));
    const meta = metaOf('alice');
    expect(meta.className).toBe('meta');
    expect(meta.textContent).toBe('[-]alice1 hour ago');
    expect(screen.getByRole('link', { name: 'alice' })).toHaveAttribute('href', '/user/alice');
  });

  it('recurses through every level of the tree inside nested .subtree lists', () => {
    const { container } = renderComment(tree);
    expect(container.querySelectorAll('app-comment')).toHaveLength(5);
    const dave = screen.getByRole('link', { name: 'dave' });
    expect(dave.closest('app-comment')!.parentElement!.closest('ul.subtree')).not.toBeNull();
    let depth = 0;
    for (let el: Element | null = dave; el; el = el.parentElement) {
      if (el.matches('ul.subtree')) depth++;
    }
    expect(depth).toBe(3);
  });

  it('renders sanitized comment HTML', () => {
    const { container } = renderComment(leaf(1, 'x', { content: '<p>hi <a href="https://e.com">l</a></p><img src=x onerror="alert(1)">' }));
    expect(container.querySelector('.comment-text')!.innerHTML).toBe('<p>hi <a href="https://e.com">l</a></p><img src="x">');
  });

  it('collapses with [-] → [+], hiding the text and replies, and expands again', async () => {
    renderComment(tree);
    await userEvent.click(toggle('alice'));
    expect(toggle('alice').textContent).toBe('[+]');
    expect(metaOf('alice')).toHaveClass('meta', 'meta-collapse');
    expect(subtreeOf('alice')).toHaveAttribute('hidden');
    expect(screen.queryByText('text by bob')).not.toBeVisible();

    await userEvent.click(toggle('alice'));
    expect(toggle('alice').textContent).toBe('[-]');
    expect(metaOf('alice')).not.toHaveClass('meta-collapse');
    expect(subtreeOf('alice')).not.toHaveAttribute('hidden');
  });

  it('keeps each reply’s own collapse state while a parent is collapsed and reopened', async () => {
    renderComment(tree);
    await userEvent.click(toggle('carol'));
    await userEvent.click(toggle('alice'));
    await userEvent.click(toggle('alice'));
    expect(toggle('carol').textContent).toBe('[+]');
    expect(subtreeOf('carol')).toHaveAttribute('hidden');
    expect(toggle('bob').textContent).toBe('[-]');
    expect(subtreeOf('erin')).not.toHaveAttribute('hidden');
  });

  it('collapsing one sibling does not affect the other', async () => {
    renderComment(tree);
    await userEvent.click(toggle('bob'));
    expect(subtreeOf('bob')).toHaveAttribute('hidden');
    expect(subtreeOf('erin')).not.toHaveAttribute('hidden');
  });

  it('renders a deleted comment as a placeholder without content, toggle or replies', () => {
    const { container } = renderComment(leaf(1, 'gone', { deleted: true, comments: [leaf(2, 'child')] }));
    expect(container.querySelector('.deleted-meta')!.textContent).toBe('[deleted] | Comment Deleted ');
    expect(container.querySelector('.meta')).toBeNull();
    expect(screen.queryByRole('link')).toBeNull();
  });

  it('shows a deleted reply inside a live parent', () => {
    const { container } = renderComment(leaf(1, 'alive', { comments: [leaf(2, '', { deleted: true })] }));
    expect(container.querySelectorAll('.subtree .deleted-meta')).toHaveLength(1);
  });

  it('carries the Angular-style host and scope attributes', () => {
    const { container } = renderComment(leaf(1, 'alice'));
    expect(container.querySelector('app-comment')).toHaveAttribute('data-h-comment');
    expect(metaOf('alice')).toHaveAttribute('data-c-comment');
  });
});
