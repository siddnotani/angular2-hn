import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { ErrorMessage } from './ErrorMessage';

describe('ErrorMessage', () => {
  it('renders the given message and the offline hint', () => {
    render(<ErrorMessage message="Could not load user pg." />);

    expect(screen.getByRole('alert')).toHaveTextContent('Could not load user pg.');
    expect(screen.getByText(/visit this page with a network connection/)).toBeInTheDocument();
  });
});
