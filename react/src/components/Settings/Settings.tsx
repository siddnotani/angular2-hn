import { useSettings } from '../../settings/SettingsContext';
import './Settings.ng.scss';

const THEMES = [
  ['default', 'Default'],
  ['night', 'Night'],
  ['amoledblack', 'Black (AMOLED)'],
] as const;

// Port of SettingsComponent. The number inputs are uncontrolled, like Angular's one-way
// `[value]` binding, and only save on keyup (so the spinner arrows alone don't save).
// The duplicate `name="theme"` on them is kept from the Angular template.
export function Settings() {
  const { settings, toggleSettings, toggleOpenLinksInNewTab, setTheme, setFont, setSpacing } = useSettings();

  return (
    <app-settings>
      <div id="popup1" className="overlay">
        <div className="popup">
          <h1>Settings</h1>
          <hr />
          <span className="close" onClick={toggleSettings}>
            &times;
          </span>
          <div className="content">
            <div className="control-section">
              <h2>Links</h2>
              <input type="checkbox" checked={settings.openLinkInNewTab} onChange={toggleOpenLinksInNewTab} /> Open
              links in a new tab{' '}
            </div>
            <div className="theme-controls">
              <div className="control-section">
                <h2>Select a theme</h2>
                {THEMES.map(([value, label]) => (
                  <div key={value}>
                    <label>
                      <input
                        name="theme"
                        type="radio"
                        value={value}
                        checked={settings.theme === value}
                        onChange={() => setTheme(value)}
                      />{' '}
                      {label}{' '}
                    </label>
                  </div>
                ))}
              </div>
              <div className="control-section">
                <h2>Change Font</h2>
                <div>
                  <label>
                    {' '}Font size:{' '}
                    <input
                      min="1"
                      defaultValue={settings.titleFontSize}
                      name="theme"
                      type="number"
                      onKeyUp={e => setFont(e.currentTarget.value)}
                    />
                  </label>
                </div>
                <div>
                  <label>
                    {' '}List spacing:{' '}
                    <input
                      min="0"
                      defaultValue={settings.listSpacing}
                      name="theme"
                      type="number"
                      onKeyUp={e => setSpacing(e.currentTarget.value)}
                    />
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </app-settings>
  );
}
