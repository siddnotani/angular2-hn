import { createBrowserRouter } from 'react-router-dom';

import { UserProfile } from './pages/UserProfile/UserProfile';

export const routes = [{ path: '/user/:id', element: <UserProfile /> }];

export const router = createBrowserRouter(routes);
