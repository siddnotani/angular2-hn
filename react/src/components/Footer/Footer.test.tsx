import { render } from '@testing-library/react';

import { Footer } from './Footer';

describe('Footer', () => {
  it('renders the GitHub credit opening in a new tab', () => {
    const { container } = render(<Footer />);
    const footer = container.querySelector('app-footer > #footer')!;
    expect(footer).toHaveAttribute('data-c-footer');
    expect(footer.textContent).toBe('Show this project some ❤ on GitHub');
    const a = footer.querySelector('a')!;
    expect(a).toHaveAttribute('href', 'https://github.com/hdjirdeh/angular2-hn');
    expect(a).toHaveAttribute('target', '_blank');
    expect(a).toHaveAttribute('rel', 'noopener');
  });
});
