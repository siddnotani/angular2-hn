// Port of CommentPipe: anything not > 0 (0, negatives, NaN, undefined) is 'discuss'.
export function formatCommentCount(comment: number | undefined): string {
  if (comment! > 0) {
    const st = comment === 1 ? 'comment' : 'comments';
    return `${comment} ${st}`;
  }
  return 'discuss';
}
