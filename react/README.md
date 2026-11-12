# angular2-hn — React port

Greenfield React port of the Angular 9 app in `../src`, kept side by side until the parity suite passes.

Stack: Vite 6, React 18, TypeScript, React Router v6, TanStack Query v5, Sass, Vitest + Testing Library + MSW. Node 20+.

```bash
npm ci
npm run dev        # http://localhost:5173
npm run lint
npm run typecheck
npm test -- --run
npm run build      # -> react/dist
```

## Styles

Component SCSS is ported verbatim from Angular into `Name.ng.scss` files. `build/ngEncapsulation.ts` emulates Angular's Emulated view encapsulation (scoped `[data-c-*]` attributes, `:host`, `::ng-deep`), so selectors keep the same scope and specificity as in the Angular build. Global styles (`styles.scss`, `_themes.scss`) stay global.

## Tests

Unit and component tests never hit the network: MSW (`src/test/server.ts`) serves the recorded responses in `../fixtures`. See `../fixtures/README.md` for how to re-record them.
