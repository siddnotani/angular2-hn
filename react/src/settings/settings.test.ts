import { loadSettings, settingsReducer, systemTheme } from './settings';

const base = loadSettings(localStorage, false);

describe('loadSettings', () => {
  it('uses the SettingsService defaults when nothing is stored', () => {
    expect(loadSettings(localStorage, false)).toEqual({
      showSettings: false,
      openLinkInNewTab: false,
      theme: 'default',
      titleFontSize: '16',
      listSpacing: '0',
    });
  });

  it('picks night for a dark system scheme when no theme is stored', () => {
    expect(loadSettings(localStorage, true).theme).toBe('night');
  });

  it('reads every stored key, with the saved theme beating the system scheme', () => {
    localStorage.setItem('theme', 'amoledblack');
    localStorage.setItem('openLinkInNewTab', 'true');
    localStorage.setItem('titleFontSize', '20');
    localStorage.setItem('listSpacing', '10');
    expect(loadSettings(localStorage, false)).toEqual({
      showSettings: false,
      openLinkInNewTab: true,
      theme: 'amoledblack',
      titleFontSize: '20',
      listSpacing: '10',
    });
  });

  it('treats empty stored values as missing, like the Angular truthiness checks', () => {
    for (const key of ['theme', 'openLinkInNewTab', 'titleFontSize', 'listSpacing']) localStorage.setItem(key, '');
    expect(loadSettings(localStorage, true)).toMatchObject({
      openLinkInNewTab: false,
      theme: 'night',
      titleFontSize: '16',
      listSpacing: '0',
    });
  });

  it('JSON-parses openLinkInNewTab', () => {
    localStorage.setItem('openLinkInNewTab', 'false');
    expect(loadSettings(localStorage, false).openLinkInNewTab).toBe(false);
  });
});

describe('systemTheme', () => {
  it('maps dark to night and light to default', () => {
    expect(systemTheme(true)).toBe('night');
    expect(systemTheme(false)).toBe('default');
  });
});

describe('settingsReducer', () => {
  it('toggles showSettings', () => {
    const open = settingsReducer(base, { type: 'toggleSettings' });
    expect(open.showSettings).toBe(true);
    expect(settingsReducer(open, { type: 'toggleSettings' }).showSettings).toBe(false);
  });

  it('sets each value', () => {
    expect(settingsReducer(base, { type: 'setOpenLinkInNewTab', value: true }).openLinkInNewTab).toBe(true);
    expect(settingsReducer(base, { type: 'setTheme', theme: 'night' }).theme).toBe('night');
    expect(settingsReducer(base, { type: 'setFont', fontSize: '24' }).titleFontSize).toBe('24');
    expect(settingsReducer(base, { type: 'setSpacing', listSpace: '5' }).listSpacing).toBe('5');
  });
});
