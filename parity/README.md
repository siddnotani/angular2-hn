# Angular ↔ React parity suite

The same Playwright specs run against the production Angular build (`dist/angular-hnpwa`, port 4201)
and the React build (`react/dist`, port 4202). All API calls are answered from `../fixtures`, with
the live API's failure modes (unknown item → 200 `{error}`, unknown feed/user → HTML 404).

```bash
# builds; Angular 9 needs Node 16 (e.g. `nvm use 16`)
yarn && npx ng build --prod              # repo root → dist/angular-hnpwa
(cd react && npm ci && npm run build)

cd parity && npm ci && npx playwright install chromium
npm test                                              # functional + visual (desktop/mobile, 3 themes)
npx playwright test --project=visual-desktop --project=visual-mobile   # visual diff only
npm run lighthouse                                    # median of LH_RUNS (default 3) → lighthouse-report/summary.md
npm run typecheck
```

Visual specs fail when screenshot sizes differ, more than 0.1% of pixels differ, or the text/link
DOM summary differs. Diff images (`angular.png`, `react.png`, `diff.png`) are attached to each test.
