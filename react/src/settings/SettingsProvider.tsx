import { type ReactNode, useCallback, useEffect, useMemo, useReducer } from 'react';

import { DARK_COLOR_SCHEME_QUERY, loadSettings, settingsReducer, STORAGE_KEYS, systemTheme } from './settings';
import { SettingsContext, type SettingsContextValue } from './SettingsContext';

// Port of SettingsService. Like Angular: with no saved theme the system theme is applied and
// saved; a prefers-color-scheme change always applies and saves, overriding a manual choice;
// showSettings is never persisted.
export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, dispatch] = useReducer(settingsReducer, undefined, () =>
    loadSettings(localStorage, window.matchMedia(DARK_COLOR_SCHEME_QUERY).matches),
  );

  const setTheme = useCallback((theme: string) => {
    localStorage.setItem(STORAGE_KEYS.theme, theme);
    dispatch({ type: 'setTheme', theme });
  }, []);

  useEffect(() => {
    if (!localStorage.getItem(STORAGE_KEYS.theme)) {
      setTheme(systemTheme(window.matchMedia(DARK_COLOR_SCHEME_QUERY).matches));
    }
    const media = window.matchMedia(DARK_COLOR_SCHEME_QUERY);
    const onChange = (event: MediaQueryListEvent) => setTheme(systemTheme(event.matches));
    media.addEventListener('change', onChange);
    return () => media.removeEventListener('change', onChange);
  }, [setTheme]);

  const { openLinkInNewTab } = settings;
  const toggleOpenLinksInNewTab = useCallback(() => {
    const value = !openLinkInNewTab;
    localStorage.setItem(STORAGE_KEYS.openLinkInNewTab, JSON.stringify(value));
    dispatch({ type: 'setOpenLinkInNewTab', value });
  }, [openLinkInNewTab]);

  const value = useMemo<SettingsContextValue>(
    () => ({
      settings,
      setTheme,
      toggleOpenLinksInNewTab,
      toggleSettings: () => dispatch({ type: 'toggleSettings' }),
      setFont: fontSize => {
        localStorage.setItem(STORAGE_KEYS.titleFontSize, fontSize);
        dispatch({ type: 'setFont', fontSize });
      },
      setSpacing: listSpace => {
        localStorage.setItem(STORAGE_KEYS.listSpacing, listSpace);
        dispatch({ type: 'setSpacing', listSpace });
      },
    }),
    [settings, setTheme, toggleOpenLinksInNewTab],
  );

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}
