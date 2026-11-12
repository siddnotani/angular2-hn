import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';

import { Layout } from './components/Layout/Layout';
import { FEEDS } from './models/feedType';
import { RenderErrorBoundary } from './components/RenderErrorBoundary/RenderErrorBoundary';
import { Feed } from './pages/Feed/Feed';

const ItemDetails = lazy(() => import('./pages/ItemDetails/ItemDetails'));
const User = lazy(() => import('./pages/User/User'));

// Angular redirects keep the query string.
function RedirectToNews() {
  const { search } = useLocation();
  return <Navigate to={{ pathname: '/news/1', search }} replace />;
}

// Lazy pages, like Angular's loadChildren. Navigations run in a transition (routerFuture),
// so like the Angular router the old page stays up while a chunk loads; the fallback only
// shows on a cold start. Unknown items come back as `{error}` and throw while rendering;
// the boundary contains that to the page as Angular's template error was.
function LazyPage({ page: Page }: { page: typeof ItemDetails }) {
  const { pathname } = useLocation();
  return (
    <RenderErrorBoundary resetKey={pathname}>
      <Suspense fallback={null}>
        <Page />
      </Suspense>
    </RenderErrorBoundary>
  );
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
        <Route path="item/:id" caseSensitive element={<LazyPage page={ItemDetails} />} />
        <Route path="user/:id" caseSensitive element={<LazyPage page={User} />} />
        <Route path="*" element={null} />
      </Route>
    </Routes>
  );
}
