import { renderHook, act } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { SettingsProvider, useSettings } from './SettingsContext';

describe('SettingsContext', () => {
    beforeEach(() => localStorage.clear());

    it('round trips the open-links preference through localStorage', () => {
        const { result } = renderHook(() => useSettings(), { wrapper: SettingsProvider });
        act(() => result.current.toggleOpenLinksInNewTab());
        expect(result.current.settings.openLinkInNewTab).toBe(true);
        expect(localStorage.getItem('openLinkInNewTab')).toBe('true');
        const second = renderHook(() => useSettings(), { wrapper: SettingsProvider });
        expect(second.result.current.settings.openLinkInNewTab).toBe(true);
    });
});
