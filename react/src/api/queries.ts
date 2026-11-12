import { QueryClient, useQuery } from '@tanstack/react-query';

import type { Feed } from '../models/feedType';
import { fetchFeed, fetchItemContent, fetchUser } from './hackernews';

// The Angular components fetched on every visit and had no retry or refetch-on-focus;
// gcTime 0 keeps that (loader on each visit, no stale data shown from a previous visit).
export function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false, refetchOnWindowFocus: false, gcTime: 0 },
    },
  });
}

export const queryKeys = {
  feed: (feedType: Feed, page: number) => ['feed', feedType, page] as const,
  item: (id: number) => ['item', id] as const,
  user: (id: string) => ['user', id] as const,
};

export function useFeed(feedType: Feed, page: number) {
  return useQuery({
    queryKey: queryKeys.feed(feedType, page),
    queryFn: ({ signal }) => fetchFeed(feedType, page, signal),
  });
}

export function useItem(id: number) {
  return useQuery({
    queryKey: queryKeys.item(id),
    queryFn: ({ signal }) => fetchItemContent(id, signal),
  });
}

export function useUser(id: string) {
  return useQuery({
    queryKey: queryKeys.user(id),
    queryFn: ({ signal }) => fetchUser(id, signal),
  });
}
