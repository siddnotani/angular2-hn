import { expect, fixture, manifest, test } from '../fixtures';

interface Comment {
  id: number;
  deleted?: boolean;
  comments: Comment[];
}
interface Item {
  title: string;
  comments: Comment[];
  type: string;
}

const count = (cs: Comment[]): number => cs.reduce((n, c) => n + 1 + count(c.comments), 0);
const depth = (cs: Comment[]): number => (cs.length ? 1 + Math.max(...cs.map(c => depth(c.comments))) : 0);

test.describe('item details', () => {
  test('renders the full comment tree at the recorded depth', async ({ page }) => {
    const story = fixture<Item>(`item/${manifest.storyId}`);
    await page.goto(`/item/${manifest.storyId}`);
    await expect(page.locator('.laptop a.title, .mobile a.title').first()).toHaveText(story.title);
    await expect(page.locator('app-comment')).toHaveCount(count(story.comments));
    const deepest = 'app-comment' + ' ul.subtree app-comment'.repeat(depth(story.comments) - 1);
    await expect(page.locator(deepest).first()).toBeAttached();
    await expect(page.locator(deepest + ' ul.subtree app-comment')).toHaveCount(0);
  });

  test('collapsing a comment hides its subtree and toggles [-]/[+]', async ({ page }) => {
    await page.goto(`/item/${manifest.storyId}`);
    const first = page.locator('app-comment').first();
    const toggle = first.locator('.meta .collapse').first();
    await expect(toggle).toHaveText('[-]');
    await toggle.click();
    await expect(toggle).toHaveText('[+]');
    await expect(first.locator('.comment-tree > div').first()).toBeHidden();
    await expect(first.locator('.meta').first()).toHaveClass('meta meta-collapse');
    await toggle.click();
    await expect(first.locator('.comment-tree > div').first()).toBeVisible();
  });

  test('a poll fetches its options and sizes the bars by share of votes', async ({ page }) => {
    const options = [1, 2, 3].map(i => fixture<{ points: number }>(`item/${manifest.pollId + i}`));
    const total = options.reduce((n, o) => n + o.points, 0);
    await page.goto(`/item/${manifest.pollId}`);
    const rows = page.locator('.pollResults .pollContent');
    await expect(rows).toHaveCount(3);
    for (const [i, o] of options.entries()) {
      await expect(rows.nth(i).locator('.subtext')).toHaveText(`${o.points} points`);
      const width = await rows.nth(i).locator('.pollBar').evaluate(el => (el as HTMLElement).style.width);
      expect(parseFloat(width)).toBeCloseTo((o.points / total) * 100, 3);
    }
  });

  test('a job has no points/comments subtext', async ({ page }) => {
    await page.goto(`/item/${manifest.jobId}`);
    await expect(page.locator('.item').first()).toBeAttached();
    await expect(page.locator('app-comment')).toHaveCount(0);
  });

  test('an unknown item ({error} body) renders no item content', async ({ page }) => {
    await page.goto('/item/1');
    await expect(page.locator('app-header #header')).toBeVisible();
    await page.waitForLoadState('networkidle');
    await expect(page.locator('app-comment')).toHaveCount(0);
    await expect(page.locator('.error-section')).toHaveCount(0);
  });

  test('comment author links go to the user page', async ({ page }) => {
    await page.goto(`/item/${manifest.storyId}`);
    const link = page.locator('app-comment .meta a').first();
    const user = await link.textContent();
    await link.click();
    await expect(page).toHaveURL(`/user/${user}`);
  });
});

test.describe('user profile', () => {
  test('renders the recorded profile', async ({ page }) => {
    const user = fixture<{ id: string; karma: number; created: string }>(`user/${manifest.userId}`);
    await page.goto(`/user/${manifest.userId}`);
    await expect(page.locator('.main-details .name')).toHaveText(user.id);
    await expect(page.locator('.main-details .right')).toHaveText(`${user.karma} ★`);
    await expect(page.locator('.main-details .age')).toHaveText(`Created ${user.created}`);
  });

  test('an unknown user shows the user error', async ({ page }) => {
    await page.goto('/user/nobody-here');
    await expect(page.locator('.error-section .strong')).toHaveText('Could not load user nobody-here.');
  });
});
