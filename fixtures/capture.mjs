#!/usr/bin/env node
// Records node-hnapi responses into fixtures/ so tests never hit the live API.
// Usage: node fixtures/capture.mjs            (re-records the IDs in manifest.json, or picks new ones)
//        node fixtures/capture.mjs --repick   (ignores manifest.json and picks fresh items)
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const HNAPI = 'https://node-hnapi.herokuapp.com';
const FIREBASE = 'https://hacker-news.firebaseio.com/v0';
const ROOT = dirname(fileURLToPath(import.meta.url));
const FEEDS = ['news', 'newest', 'show', 'ask', 'jobs'];
const DEFAULT_MANIFEST = {
  feedPages: {
    news: [1, 2],
    newest: [1],
    show: [1],
    ask: [1, 2, 3],
    jobs: [1, 2],
  },
  pollId: 126809,
  storyId: null,
  askId: null,
  jobId: null,
  userId: 'pg',
};

async function getJson(url, attempts = 3) {
  for (let i = 1; ; i++) {
    const res = await fetch(url);
    if (res.ok) return res.json();
    if (i >= attempts) throw new Error(`${url} -> ${res.status}`);
    await new Promise(r => setTimeout(r, 1000 * i));
  }
}

async function save(relPath, data) {
  const file = join(ROOT, relPath);
  await mkdir(dirname(file), { recursive: true });
  await writeFile(file, JSON.stringify(data, null, 2) + '\n');
  console.log(`wrote ${relPath}`);
}

function depth(comments) {
  return comments.length ? 1 + Math.max(...comments.map(c => depth(c.comments || []))) : 0;
}

async function pickStory(feed) {
  for (const s of feed.filter(s => s.comments_count >= 15 && s.comments_count <= 120)) {
    const item = await getJson(`${HNAPI}/item/${s.id}`);
    if (depth(item.comments) >= 3) return s.id;
  }
  throw new Error('no story with comment depth >= 3 on news page 1');
}

async function loadManifest(repick) {
  if (repick) return { ...DEFAULT_MANIFEST };
  try {
    return JSON.parse(await readFile(join(ROOT, 'manifest.json'), 'utf8'));
  } catch {
    return { ...DEFAULT_MANIFEST };
  }
}

const manifest = await loadManifest(process.argv.includes('--repick'));
const feeds = {};
for (const feed of FEEDS) {
  for (const page of manifest.feedPages[feed]) {
    const data = await getJson(`${HNAPI}/${feed}?page=${page}`);
    if (page === 1) feeds[feed] = data;
    await save(`${feed}/${page}.json`, data);
  }
}

manifest.storyId ??= await pickStory(feeds.news);
manifest.askId ??= feeds.ask.find(s => s.comments_count > 0)?.id ?? feeds.ask[0].id;
manifest.jobId ??= feeds.jobs[0].id;

for (const id of [manifest.storyId, manifest.askId, manifest.jobId]) {
  await save(`item/${id}.json`, await getJson(`${HNAPI}/item/${id}`));
}

const poll = await getJson(`${HNAPI}/item/${manifest.pollId}`);
await save(`item/${manifest.pollId}.json`, poll);
for (let i = 1; i <= poll.poll.length; i++) {
  await save(`item/${manifest.pollId + i}.json`, await getJson(`${HNAPI}/item/${manifest.pollId + i}`));
}

// node-hnapi's /user endpoint currently 404s, so the user fixture is built from the
// official Firebase API in node-hnapi's response shape.
let user;
try {
  user = await getJson(`${HNAPI}/user/${manifest.userId}`, 1);
} catch {
  const fb = await getJson(`${FIREBASE}/user/${manifest.userId}.json`);
  const years = Math.floor((Date.now() / 1000 - fb.created) / (365 * 24 * 3600));
  user = {
    id: fb.id,
    created_time: fb.created,
    created: `${years} years ago`,
    karma: fb.karma,
    avg: null,
    about: fb.about ?? '',
  };
}
await save(`user/${manifest.userId}.json`, user);
await save('manifest.json', manifest);
