export function formatCommentCount(comment: number): string {
  if (comment > 0) {
    const label = comment === 1 ? 'comment' : 'comments';
    return `${comment} ${label}`;
  }
  return 'discuss';
}
