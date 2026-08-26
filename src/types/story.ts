import type { Comment } from './comment';
import type { FeedType } from './feed-type';
import type { PollResult } from './poll-result';

export interface Story {
    id: number;
    title: string;
    points: number;
    user: string;
    time: number;
    time_ago: number;
    type: FeedType;
    url?: string;
    domain?: string;
    comments?: Comment[];
    comments_count: number;
    poll?: PollResult[];
    poll_votes_count?: number;
    deleted?: boolean;
    dead?: boolean;
    text?: string;
    content?: string;
}
