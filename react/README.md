# angular2-hn — React port

The first step of migrating the Angular app in this repo to React. So far only the user profile page (`/user/:id`) is ported, from `src/app/user/`, along with the shared `Loader` and `ErrorMessage` components and the `media` and `theme_variables` SCSS partials.

`getUser` tries `node-hnapi.herokuapp.com/user/:id` first, the same endpoint the Angular app uses. If that request fails, it falls back to the official Firebase HN API.

```bash
npm install
npm run dev        # http://localhost:5173/user/pg
npm run lint
npm run typecheck
npm test -- --run
npm run build
```
