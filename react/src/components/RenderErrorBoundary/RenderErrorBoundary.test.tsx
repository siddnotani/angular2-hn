import { render, screen } from '@testing-library/react';

import { RenderErrorBoundary } from './RenderErrorBoundary';

function Boom({ explode }: { explode: boolean }) {
  if (explode) {
    throw new Error('boom');
  }
  return <p>ok</p>;
}

describe('RenderErrorBoundary', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('renders children when they do not throw', () => {
    render(<RenderErrorBoundary resetKey="a"><Boom explode={false} /></RenderErrorBoundary>);
    expect(screen.getByText('ok')).toBeInTheDocument();
  });

  it('renders nothing in place of a subtree that throws, and keeps siblings', () => {
    const { container } = render(
      <div>
        <span>sibling</span>
        <RenderErrorBoundary resetKey="a"><Boom explode /></RenderErrorBoundary>
      </div>,
    );
    expect(container.innerHTML).toBe('<div><span>sibling</span></div>');
  });

  it('stays empty for the same key and recovers when the key changes', () => {
    const { rerender, container } = render(<RenderErrorBoundary resetKey="a"><Boom explode /></RenderErrorBoundary>);
    rerender(<RenderErrorBoundary resetKey="a"><Boom explode={false} /></RenderErrorBoundary>);
    expect(container.innerHTML).toBe('');
    rerender(<RenderErrorBoundary resetKey="b"><Boom explode={false} /></RenderErrorBoundary>);
    expect(screen.getByText('ok')).toBeInTheDocument();
  });
});
