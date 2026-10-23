import type { User } from '../models/user';

export const HNAPI_BASE_URL = 'https://node-hnapi.herokuapp.com';
export const FIREBASE_BASE_URL = 'https://hacker-news.firebaseio.com/v0';

interface FirebaseUser {
  id: string;
  created: number;
  karma: number;
  about?: string;
}

const TIME_UNITS: [string, number][] = [
  ['year', 365 * 24 * 60 * 60],
  ['month', 30 * 24 * 60 * 60],
  ['day', 24 * 60 * 60],
  ['hour', 60 * 60],
  ['minute', 60],
];

export function timeAgo(unixSeconds: number, now: number = Date.now()): string {
  const elapsed = Math.max(0, Math.floor(now / 1000) - unixSeconds);
  for (const [unit, seconds] of TIME_UNITS) {
    const value = Math.floor(elapsed / seconds);
    if (value >= 1) {
      return `${value} ${unit}${value === 1 ? '' : 's'} ago`;
    }
  }
  return 'just now';
}

function isAbortError(error: unknown): boolean {
  return error instanceof DOMException && error.name === 'AbortError';
}

async function fetchJson<T>(url: string, signal?: AbortSignal): Promise<T> {
  const response = await fetch(url, { signal });
  if (!response.ok) {
    throw new Error(`Request to ${url} failed with status ${response.status}`);
  }
  return response.json() as Promise<T>;
}

async function getUserFromFirebase(id: string, signal?: AbortSignal): Promise<User> {
  const data = await fetchJson<FirebaseUser | null>(
    `${FIREBASE_BASE_URL}/user/${encodeURIComponent(id)}.json`,
    signal,
  );
  if (!data) {
    throw new Error(`User ${id} not found`);
  }
  return {
    id: data.id,
    crated_time: data.created,
    created: timeAgo(data.created),
    karma: data.karma,
    about: data.about,
  };
}

// Tries node-hnapi first (the Angular app's API) and falls back to the official
// Firebase HN API, since node-hnapi's /user endpoint currently returns 404.
export async function getUser(id: string, signal?: AbortSignal): Promise<User> {
  try {
    return await fetchJson<User>(`${HNAPI_BASE_URL}/user/${encodeURIComponent(id)}`, signal);
  } catch (error) {
    if (isAbortError(error)) {
      throw error;
    }
    return getUserFromFirebase(id, signal);
  }
}
