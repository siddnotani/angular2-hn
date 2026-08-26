import { NavLink } from 'react-router-dom';
import { useSettings } from '../../context/SettingsContext';
import Settings from '../settings/Settings';
import './Header.scss';

export default function Header() {
    const { settings, toggleSettings } = useSettings();
    const scrollTop = () => window.scrollTo(0, 0);
    const navClass = ({ isActive }: { isActive: boolean }) => isActive ? 'active' : '';
    return (
        <header>
            <div id="header">
                <NavLink className={({ isActive }) => `home-link${isActive ? ' active' : ''}`} to="/news/1" onClick={scrollTop}>
                    <div className="logo-inner"></div>
                    <img className="logo" src="/assets/images/logo.svg" alt="Logo" />
                </NavLink>
                <div className="header-text"><div className="left"><span className="header-nav">
                    <NavLink to="/newest/1" className={navClass} onClick={scrollTop}>new</NavLink>{' | '}
                    <NavLink to="/show/1" className={navClass} onClick={scrollTop}>show</NavLink>{' | '}
                    <NavLink to="/ask/1" className={navClass} onClick={scrollTop}>ask</NavLink>{' | '}
                    <NavLink to="/jobs/1" className={navClass} onClick={scrollTop}>jobs</NavLink>
                </span></div></div>
                <div className="info"><img className="settings" src="/assets/images/cog.svg" alt="Settings" onClick={toggleSettings} /></div>
            </div>
            {settings.showSettings && <Settings />}
        </header>
    );
}
