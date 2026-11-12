// Angular's FeedType omits 'link', which node-hnapi returns for most stories on /news.
export type FeedType = 'poll' | 'story' | 'job' | 'link';

// The feeds the router serves, passed to the API as `/${feed}?page=n`.
export type Feed = 'news' | 'newest' | 'show' | 'ask' | 'jobs';
