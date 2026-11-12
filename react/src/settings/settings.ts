import type { Settings } from '../models/settings';

export const STORAGE_KEYS = {
  theme: 'theme',
  openLinkInNewTab: 'openLinkInNewTab',
  titleFontSize: 'titleFontSize',
  listSpacing: 'listSpacing',
} as const;

export const DARK_COLOR_SCHEME_QUERY = '(prefers-color-scheme: dark)';

export function systemTheme(prefersDark: boolean) {
  return prefersDark ? 'night' : 'default';
}

// Same reads as SettingsService's field initialisers and initTheme(): falsy stored values
// (missing or '') fall back to the defaults, and openLinkInNewTab goes through JSON.parse.
export function loadSettings(storage: Storage, prefersDark: boolean): Settings {
  const openLinkInNewTab = storage.getItem(STORAGE_KEYS.openLinkInNewTab);
  return {
    showSettings: false,
    openLinkInNewTab: openLinkInNewTab ? JSON.parse(openLinkInNewTab) : false,
    theme: storage.getItem(STORAGE_KEYS.theme) || systemTheme(prefersDark),
    titleFontSize: storage.getItem(STORAGE_KEYS.titleFontSize) || '16',
    listSpacing: storage.getItem(STORAGE_KEYS.listSpacing) || '0',
  };
}

export type SettingsAction =
  | { type: 'toggleSettings' }
  | { type: 'setOpenLinkInNewTab'; value: boolean }
  | { type: 'setTheme'; theme: string }
  | { type: 'setFont'; fontSize: string }
  | { type: 'setSpacing'; listSpace: string };

export function settingsReducer(state: Settings, action: SettingsAction): Settings {
  switch (action.type) {
    case 'toggleSettings':
      return { ...state, showSettings: !state.showSettings };
    case 'setOpenLinkInNewTab':
      return { ...state, openLinkInNewTab: action.value };
    case 'setTheme':
      return { ...state, theme: action.theme };
    case 'setFont':
      return { ...state, titleFontSize: action.fontSize };
    case 'setSpacing':
      return { ...state, listSpacing: action.listSpace };
  }
}
