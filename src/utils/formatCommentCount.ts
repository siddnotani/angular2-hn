export function formatCommentCount(n: number): string {
    return n > 0 ? `${n} ${n === 1 ? 'comment' : 'comments'}` : 'discuss';
}
