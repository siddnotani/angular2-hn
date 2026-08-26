import { describe, expect, it } from 'vitest';
import { formatCommentCount } from './formatCommentCount';

describe('formatCommentCount', () => {
    it('formats zero as discuss', () => expect(formatCommentCount(0)).toBe('discuss'));
    it('uses the singular label for one', () => expect(formatCommentCount(1)).toBe('1 comment'));
    it('uses the plural label for multiple comments', () => expect(formatCommentCount(2)).toBe('2 comments'));
});
