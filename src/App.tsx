import { lazy, Suspense, useEffect } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import Header from './components/header/Header';
import Footer from './components/footer/Footer';
import Loader from './components/loader/Loader';
import { useSettings } from './context/SettingsContext';
import Feed from './pages/Feed';
import './App.scss';

const ItemDetails = lazy(() => import('./pages/ItemDetails'));
const User = lazy(() => import('./pages/User'));
type GoogleAnalytics = (command: string, ...args: unknown[]) => void;
declare global { interface Window { ga?: GoogleAnalytics; } }

function Analytics() {
    const { pathname, search } = useLocation();
    useEffect(() => {
        if (typeof window.ga === 'function') {
            window.ga('set', 'page', pathname + search);
            window.ga('send', 'pageview');
        }
    }, [pathname, search]);
    return null;
}

export default function App() {
    const { settings } = useSettings();
    return <div className={settings.theme}>
        <div className="body-cover"></div>
        <div className="wrapper">
            <Header />
            <Analytics />
            <Suspense fallback={<Loader />}>
                <Routes>
                    <Route path="/" element={<Navigate to="/news/1" replace />} />
                    <Route path="/news/:page" element={<Feed />} />
                    <Route path="/newest/:page" element={<Feed />} />
                    <Route path="/show/:page" element={<Feed />} />
                    <Route path="/ask/:page" element={<Feed />} />
                    <Route path="/jobs/:page" element={<Feed />} />
                    <Route path="/item/:id" element={<ItemDetails />} />
                    <Route path="/user/:id" element={<User />} />
                </Routes>
            </Suspense>
            <Footer />
        </div>
    </div>;
}
