import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import App from './App';
import { SettingsProvider } from './context/SettingsContext';
import type { Story } from './types/story';
import { fetchFeed } from './api/hnApi';

vi.mock('./api/hnApi', () => ({
    fetchFeed: vi.fn(),
    fetchItemContent: vi.fn(),
    fetchUser: vi.fn()
}));

const story: Story = {
    id: 42, title: 'A rendered story', points: 10, user: 'reader', time: 1, time_ago: 2,
    type: 'story', comments_count: 2, url: 'https://example.com', domain: 'example.com'
};

function renderApp(initialEntry = '/') {
    return render(<MemoryRouter initialEntries={[initialEntry]}><SettingsProvider><App /></SettingsProvider></MemoryRouter>);
}

describe('application routing and feed states', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.clear();
    });

    it('redirects the root route to the news feed and renders stories', async () => {
        vi.mocked(fetchFeed).mockResolvedValue([story]);
        renderApp('/');
        expect(await screen.findByText('A rendered story')).toBeInTheDocument();
        expect(screen.getByRole('link', { name: 'A rendered story' })).toHaveAttribute('href', 'https://example.com');
    });

    it('shows the loader while a feed is loading', async () => {
        let resolve: (value: Story[]) => void = () => undefined;
        vi.mocked(fetchFeed).mockReturnValue(new Promise((done) => { resolve = (value) => done(value); }));
        renderApp('/news/1');
        expect(screen.getByText('Loading...')).toBeInTheDocument();
        resolve([story]);
        expect(await screen.findByText('A rendered story')).toBeInTheDocument();
    });

    it('shows an error when a feed cannot be loaded', async () => {
        vi.mocked(fetchFeed).mockRejectedValue(new Error('offline'));
        renderApp('/ask/1');
        await waitFor(() => expect(screen.getByText('Could not load ask stories.')).toBeInTheDocument());
    });
});
