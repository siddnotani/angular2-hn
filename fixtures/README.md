# API fixtures

Recorded responses from `https://node-hnapi.herokuapp.com`, used by the React unit tests (MSW) and by the Playwright parity suite (which serves them to both the Angular and React builds), so no test depends on the live API.

Layout mirrors the request URL:

| Request | Fixture |
|---|---|
| `/{feed}?page={n}` | `{feed}/{n}.json` |
| `/item/{id}` | `item/{id}.json` |
| `/user/{id}` | `user/{id}.json` |

`manifest.json` lists the recorded IDs: `storyId` (story with comment depth >= 3), `askId`, `jobId`, `pollId` (plus its options `pollId + 1..n`, which `fetchItemContent` requests) and `userId`. `ask/3.json` is an empty page and `ask/2.json` / `jobs/2.json` are short pages.

node-hnapi's `/user/{id}` endpoint returns 404, so `user/*.json` is built from the official Firebase API (`hacker-news.firebaseio.com/v0/user/{id}.json`) in node-hnapi's response shape.

Re-record with `node fixtures/capture.mjs` (same IDs) or `node fixtures/capture.mjs --repick` (fresh items). Requires Node 18+.
