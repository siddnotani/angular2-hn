import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Loader } from './Loader';

describe('Loader', () => {
  it('renders the loading indicator', () => {
    render(<Loader />);

    expect(screen.getByTestId('loader')).toHaveTextContent('Loading...');
  });
});
