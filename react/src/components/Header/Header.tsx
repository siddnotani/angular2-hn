import { NavLink } from 'react-router-dom';

import { useSettings } from '../../settings/SettingsContext';
import { Settings } from '../Settings/Settings';
import './Header.ng.scss';

const scrollTop = () => window.scrollTo(0, 0);

// Port of HeaderComponent. NavLink stands in for `routerLinkActive="active"`; image paths stay
// relative to <base href="/"> as in Angular.
export function Header() {
  const { settings, toggleSettings } = useSettings();

  return (
    <app-header>
      <header>
        <div id="header">
          <NavLink className="home-link" to="/news/1" onClick={scrollTop}>
            <div className="logo-inner"></div>
            <img className="logo" src="assets/images/logo.svg" alt="Logo" />
          </NavLink>
          <div className="header-text">
            <div className="left">
              <span className="header-nav">
                <NavLink to="/newest/1" onClick={scrollTop}>new</NavLink> |{' '}
                <NavLink to="/show/1" onClick={scrollTop}>show</NavLink> |{' '}
                <NavLink to="/ask/1" onClick={scrollTop}>ask</NavLink> |{' '}
                <NavLink to="/jobs/1" onClick={scrollTop}>jobs</NavLink>
              </span>
            </div>
          </div>
          <div className="info">
            <img className="settings" src="assets/images/cog.svg" alt="Settings" onClick={toggleSettings} />
          </div>
        </div>
        {settings.showSettings && <Settings />}
      </header>
    </app-header>
  );
}
