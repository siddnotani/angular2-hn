import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import Comment from './Comment';
import type { Comment as CommentType } from '../../types/comment';

const comment: CommentType = {
    id: 1, level: 0, user: 'parent', time: 1, time_ago: '1 hour ago',
    content: 'Parent text', deleted: false, comments: [{
        id: 2, level: 1, user: 'child', time: 2, time_ago: '30 minutes ago',
        content: 'Nested child text', deleted: false, comments: []
    }]
};

describe('Comment', () => {
    it('renders nested comments and collapses the subtree', () => {
        render(<MemoryRouter><Comment comment={comment} /></MemoryRouter>);
        expect(screen.getByText('Nested child text')).toBeInTheDocument();
        const toggle = screen.getAllByText('[-]')[0];
        fireEvent.click(toggle);
        expect(screen.getByText('[+]')).toBeInTheDocument();
        expect(screen.getByText('Nested child text').closest('div[hidden]')).toBeInTheDocument();
    });
});
