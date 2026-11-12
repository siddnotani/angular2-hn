import type { Comment } from './comment';
import type { FeedType } from './feedType';
import type { PollResult } from './pollResult';

export interface Story {
  id: number;
  title: string;
  points: number | null;
  user: string | null;
  time: number;
  // Angular types this as a number, but node-hnapi returns a string like "2 hours ago".
  time_ago: string;
  type: FeedType;
  url: string;
  domain?: string;
  content?: string;
  comments?: Comment[];
  comments_count: number;
  poll?: PollResult[];
  poll_votes_count?: number;
  deleted?: boolean;
  dead?: boolean;
}
