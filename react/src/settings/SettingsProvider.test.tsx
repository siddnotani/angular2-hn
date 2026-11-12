import { act, renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';

import { mockColorScheme } from '../test/matchMedia';
import { useSettings } from './SettingsContext';
import { SettingsProvider } from './SettingsProvider';

const wrapper = ({ children }: { children: ReactNode }) => <SettingsProvider>{children}</SettingsProvider>;
const renderSettings = () => renderHook(() => useSettings(), { wrapper });

describe('SettingsProvider', () => {
  it('applies and saves the system theme when none is saved', () => {
    mockColorScheme(true);
    const { result } = renderSettings();
    expect(result.current.settings.theme).toBe('night');
    expect(localStorage.getItem('theme')).toBe('night');
  });

  it('saves default for a light system scheme', () => {
    mockColorScheme(false);
    renderSettings();
    expect(localStorage.getItem('theme')).toBe('default');
  });

  it('keeps a saved theme and writes nothing else on load', () => {
    mockColorScheme(true);
    localStorage.setItem('theme', 'amoledblack');
    const { result } = renderSettings();
    expect(result.current.settings.theme).toBe('amoledblack');
    expect(Object.keys(localStorage)).toEqual(['theme']);
  });

  it('follows system scheme changes, overriding and saving over a manual choice', () => {
    const scheme = mockColorScheme(false);
    const { result } = renderSettings();
    act(() => result.current.setTheme('amoledblack'));
    act(() => scheme.change(true));
    expect(result.current.settings.theme).toBe('night');
    expect(localStorage.getItem('theme')).toBe('night');
    act(() => scheme.change(false));
    expect(result.current.settings.theme).toBe('default');
  });

  it('removes the color-scheme listener on unmount', () => {
    const scheme = mockColorScheme(false);
    const { unmount } = renderSettings();
    expect(scheme.listenerCount()).toBe(1);
    unmount();
    expect(scheme.listenerCount()).toBe(0);
  });

  it('setTheme, setFont and setSpacing update state and localStorage', () => {
    mockColorScheme(false);
    const { result } = renderSettings();
    act(() => result.current.setTheme('night'));
    act(() => result.current.setFont('22'));
    act(() => result.current.setSpacing('8'));
    expect(result.current.settings).toMatchObject({ theme: 'night', titleFontSize: '22', listSpacing: '8' });
    expect(localStorage.getItem('theme')).toBe('night');
    expect(localStorage.getItem('titleFontSize')).toBe('22');
    expect(localStorage.getItem('listSpacing')).toBe('8');
  });

  it('toggleOpenLinksInNewTab flips the flag and saves it as JSON', () => {
    mockColorScheme(false);
    const { result } = renderSettings();
    act(() => result.current.toggleOpenLinksInNewTab());
    expect(result.current.settings.openLinkInNewTab).toBe(true);
    expect(localStorage.getItem('openLinkInNewTab')).toBe('true');
    act(() => result.current.toggleOpenLinksInNewTab());
    expect(result.current.settings.openLinkInNewTab).toBe(false);
    expect(localStorage.getItem('openLinkInNewTab')).toBe('false');
  });

  it('toggleSettings is not persisted', () => {
    mockColorScheme(false);
    const { result } = renderSettings();
    act(() => result.current.toggleSettings());
    expect(result.current.settings.showSettings).toBe(true);
    expect(Object.keys(localStorage)).toEqual(['theme']);
  });

  it('restores saved settings on the next mount', () => {
    mockColorScheme(false);
    const first = renderSettings();
    act(() => first.result.current.setFont('30'));
    act(() => first.result.current.toggleOpenLinksInNewTab());
    first.unmount();
    expect(renderSettings().result.current.settings).toMatchObject({ titleFontSize: '30', openLinkInNewTab: true });
  });

  it('useSettings throws outside the provider', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => renderHook(() => useSettings())).toThrow('useSettings must be used inside <SettingsProvider>');
  });
});
