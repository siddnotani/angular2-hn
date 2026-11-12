import { Navigate, Route, Routes, useLocation } from 'react-router-dom';

import { Layout } from './components/Layout/Layout';
import { FEEDS } from './models/feedType';
import { Feed } from './pages/Feed/Feed';

// Angular redirects keep the query string.
function RedirectToNews() {
  const { search } = useLocation();
  return <Navigate to={{ pathname: '/news/1', search }} replace />;
}

// Port of app.routes.ts. Angular matches paths case-sensitively; anything unmatched
// (including `/news` with no page) renders nothing inside the layout.
export function AppRoutes() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<RedirectToNews />} />
        {FEEDS.map(feed => (
          <Route key={feed} path={`${feed}/:page`} caseSensitive element={<Feed key={feed} feedType={feed} />} />
        ))}
        <Route path="*" element={null} />
      </Route>
    </Routes>
  );
}
