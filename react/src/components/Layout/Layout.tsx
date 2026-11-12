import { Outlet } from 'react-router-dom';

import { useSettings } from '../../settings/SettingsContext';
import './Layout.ng.scss';

// Port of AppComponent's template: the theme class sits on the outermost element so the
// global `.default/.night/.amoledblack …` rules in _themes.scss apply to everything inside.
export function Layout() {
  const { settings } = useSettings();
  return (
    <div className={settings.theme}>
      <div className="body-cover"></div>
      <div className="wrapper">
        <Outlet />
      </div>
    </div>
  );
}
