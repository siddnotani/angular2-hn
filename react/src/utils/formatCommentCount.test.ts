import { formatCommentCount } from './formatCommentCount';

describe('formatCommentCount', () => {
  it.each([
    [1, '1 comment'],
    [2, '2 comments'],
    [1623, '1623 comments'],
    [0, 'discuss'],
    [-3, 'discuss'],
    [NaN, 'discuss'],
    [undefined, 'discuss'],
  ])('%s → %s', (count, expected) => {
    expect(formatCommentCount(count)).toBe(expected);
  });
});
