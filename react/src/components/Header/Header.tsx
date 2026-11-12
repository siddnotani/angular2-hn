import { useSettings } from '../../settings/SettingsContext';
import { RouterLink } from '../RouterLink/RouterLink';
import { Settings } from '../Settings/Settings';
import './Header.ng.scss';

const scrollTop = () => window.scrollTo(0, 0);

// Port of HeaderComponent. Image paths stay relative to <base href="/"> as in Angular.
export function Header() {
  const { settings, toggleSettings } = useSettings();

  return (
    <app-header>
      <header>
        <div id="header">
          <RouterLink className="home-link" to="/news/1" onClick={scrollTop}>
            <div className="logo-inner"></div>
            <img className="logo" src="assets/images/logo.svg" alt="Logo" />
          </RouterLink>
          <div className="header-text">
            <div className="left">
              <span className="header-nav">
                <RouterLink to="/newest/1" onClick={scrollTop}>new</RouterLink>{' | '}
                <RouterLink to="/show/1" onClick={scrollTop}>show</RouterLink>{' | '}
                <RouterLink to="/ask/1" onClick={scrollTop}>ask</RouterLink>{' | '}
                <RouterLink to="/jobs/1" onClick={scrollTop}>jobs</RouterLink>
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
