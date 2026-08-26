import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
    await page.route('**/node-hnapi.herokuapp.com/**', async (route) => {
        const url = route.request().url();
        const body = url.includes('/item/') ? {
            id: 42, title: 'Mock story', points: 10, user: 'reader', time: 1, time_ago: 2,
            type: 'story', comments_count: 0
        } : [{
            id: 42, title: 'Mock story', points: 10, user: 'reader', time: 1, time_ago: 2,
            type: 'story', comments_count: 0
        }];
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(body) });
    });
});

test('feed renders, story navigates, and settings opens', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText('Mock story')).toBeVisible();
    await page.getByText('Mock story').click();
    await expect(page).toHaveURL(/\/item\/42$/);
    await page.getByRole('img', { name: 'Settings' }).click();
    await expect(page.getByRole('heading', { name: 'Settings' })).toBeVisible();
});
