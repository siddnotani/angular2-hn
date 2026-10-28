import { describe, expect, it } from 'vitest';

import { formatCommentCount } from './formatCommentCount';

describe('formatCommentCount', () => {
  it('returns "discuss" for zero comments', () => {
    expect(formatCommentCount(0)).toBe('discuss');
  });

  it('uses the singular label for one comment', () => {
    expect(formatCommentCount(1)).toBe('1 comment');
  });

  it.each([
    [2, '2 comments'],
    [100, '100 comments'],
  ])('uses the plural label for %i comments', (count, expected) => {
    expect(formatCommentCount(count)).toBe(expected);
  });

  it.each([-1, Number.NaN])('returns "discuss" for non-positive input %s', (count) => {
    expect(formatCommentCount(count)).toBe('discuss');
  });
});
