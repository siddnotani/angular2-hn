import { QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';

import { fixture } from '../test/fixtures';
import { createQueryClient, queryKeys, useFeed, useItem, useUser } from './queries';

function wrapper({ children }: { children: ReactNode }) {
  return <QueryClientProvider client={createQueryClient()}>{children}</QueryClientProvider>;
}

describe('query hooks', () => {
  it('useFeed loads a feed page', async () => {
    const { result } = renderHook(() => useFeed('show', 1), { wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(fixture('show/1'));
  });

  it('useItem resolves polls with their options filled in', async () => {
    const { result } = renderHook(() => useItem(126809), { wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data!.poll_votes_count).toBe(301);
  });

  it('useUser surfaces the error without retrying', async () => {
    const { result } = renderHook(() => useUser('nobody'), { wrapper });
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.failureCount).toBe(1);
  });

  it('useUser loads a recorded user', async () => {
    const { result } = renderHook(() => useUser('pg'), { wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data!.id).toBe('pg');
  });

  it('keys queries by feed and page', () => {
    expect(queryKeys.feed('news', 2)).toEqual(['feed', 'news', 2]);
    expect(queryKeys.item(1)).toEqual(['item', 1]);
    expect(queryKeys.user('pg')).toEqual(['user', 'pg']);
  });
});
