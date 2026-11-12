const files = import.meta.glob<unknown>('../../../fixtures/**/*.json', { eager: true, import: 'default' });

const byPath = new Map(
  Object.entries(files).map(([file, data]) => [file.replace(/^.*\/fixtures\//, '').replace(/\.json$/, ''), data]),
);

// Looks up a recorded API response by its fixture path, e.g. `news/1`, `item/126809`, `user/pg`.
export function fixture<T = unknown>(path: string): T {
  if (!byPath.has(path)) {
    throw new Error(`No fixture recorded at fixtures/${path}.json`);
  }
  return structuredClone(byPath.get(path)) as T;
}

export function hasFixture(path: string): boolean {
  return byPath.has(path);
}

export const fixtureManifest = fixture<{
  pollId: number;
  storyId: number;
  askId: number;
  jobId: number;
  userId: string;
}>('manifest');
