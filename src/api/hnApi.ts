import type { PollResult } from '../types/poll-result';
import type { Story } from '../types/story';
import type { User } from '../types/user';

const baseUrl = 'https://node-hnapi.herokuapp.com';

async function get<T>(url: string): Promise<T> {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Request failed with status ${res.status}`);
    return res.json() as Promise<T>;
}

export function fetchFeed(feedType: string, page: number): Promise<Story[]> {
    return get<Story[]>(`${baseUrl}/${feedType}?page=${page}`);
}

export function fetchPollContent(id: number): Promise<PollResult> {
    return get<PollResult>(`${baseUrl}/item/${id}`);
}

export async function fetchItemContent(id: number): Promise<Story> {
    const story = await get<Story>(`${baseUrl}/item/${id}`);
    if (story.type === 'poll' && story.poll) {
        const pollResults = await Promise.all(story.poll.map((_, index) => fetchPollContent(story.id + index + 1)));
        story.poll = pollResults;
        story.poll_votes_count = pollResults.reduce((total, result) => total + result.points, 0);
    }
    return story;
}

export function fetchUser(id: string): Promise<User> {
    return get<User>(`${baseUrl}/user/${id}`);
}
