import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

createRoot(document.querySelector('app-root')!).render(
  <StrictMode>
    <p>Angular 2 HN (React port in progress)</p>
  </StrictMode>,
);
