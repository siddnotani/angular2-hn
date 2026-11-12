// Lighthouse on the Angular and React builds with the recorded API, on the same machine and
// Chrome, interleaved so both see the same conditions. Writes lighthouse-report/ and exits 1 if
// React scores below Angular: by more than PERF_TOLERANCE for performance (run-to-run noise),
// at all for the other categories.
import { mkdirSync, writeFileSync } from 'node:fs';

import { chromium } from '@playwright/test';
import lighthouse from 'lighthouse';
import desktopConfig from 'lighthouse/core/config/desktop-config.js';
import puppeteer from 'puppeteer-core';

import { API_ORIGIN, apiResponse, fixture } from './api.mjs';
import { serve } from './serve.mjs';

/** @type {Record<string, [string, number]>} */
const BUILDS = { angular: ['../dist/angular-hnpwa', 4211], react: ['../react/dist', 4212] };
const ROUTES = ['/news/1', `/item/${/** @type {{ storyId: number }} */ (fixture('manifest')).storyId}`];
const FORM_FACTORS = { mobile: undefined, desktop: desktopConfig };
const CATEGORIES = ['performance', 'accessibility', 'best-practices', 'seo'];
const METRICS = ['first-contentful-paint', 'largest-contentful-paint', 'total-blocking-time', 'cumulative-layout-shift', 'speed-index'];
const RUNS = Number(process.env.LH_RUNS ?? 3);
const PERF_TOLERANCE = 0.05;
const OUT = 'lighthouse-report';

const GA_STUB = 'window.ga = function () {};';

const servers = Object.values(BUILDS).map(([dir, port]) => serve(dir, port));
const browser = await puppeteer.launch({ executablePath: chromium.executablePath(), headless: true, args: ['--no-sandbox'] });

/**
 * @param {string} url
 * @param {object | undefined} config
 */
async function audit(url, config) {
  const page = await browser.newPage();
  await page.setRequestInterception(true);
  page.on('request', request => {
    const target = request.url();
    if (target.startsWith(API_ORIGIN)) {
      const { status, contentType, body } = apiResponse(target);
      return request.respond({ status, contentType, body, headers: { 'Access-Control-Allow-Origin': '*' } });
    }
    if (target.startsWith('https://www.google-analytics.com/')) {
      return request.respond({ status: 200, contentType: 'text/javascript', body: GA_STUB });
    }
    return request.continue();
  });
  const result = await lighthouse(url, { output: 'json', logLevel: 'error', onlyCategories: CATEGORIES }, config, page);
  await page.close();
  if (!result) throw new Error(`no Lighthouse result for ${url}`);
  return result.lhr;
}

/** @param {number[]} values */
const median = values => [...values].sort((a, b) => a - b)[Math.floor(values.length / 2)];

mkdirSync(OUT, { recursive: true });
/** @typedef {Record<string, Record<string, number>>} ByBuild */
/** @type {{ formFactor: string; route: string; scores: ByBuild; metrics: ByBuild }[]} */
const summary = [];
let failed = false;
try {
  for (const [formFactor, config] of Object.entries(FORM_FACTORS)) {
    for (const route of ROUTES) {
      /** @type {Record<string, any[]>} */
      const runs = { angular: [], react: [] };
      for (let i = 0; i < RUNS; i++) {
        for (const [build, [, port]] of Object.entries(BUILDS)) {
          runs[build].push(await audit(`http://localhost:${port}${route}`, config));
        }
      }
      /** @type {(typeof summary)[number]} */
      const row = { formFactor, route, scores: {}, metrics: {} };
      for (const build of Object.keys(BUILDS)) {
        const lhrs = runs[build];
        row.scores[build] = Object.fromEntries(CATEGORIES.map(c => [c, median(lhrs.map(l => l.categories[c].score))]));
        row.metrics[build] = Object.fromEntries(METRICS.map(m => [m, median(lhrs.map(l => l.audits[m].numericValue))]));
        const best = lhrs.find(l => l.categories.performance.score === row.scores[build].performance);
        writeFileSync(`${OUT}/${build}-${formFactor}${route.replaceAll('/', '-')}.json`, JSON.stringify(best));
      }
      for (const c of CATEGORIES) {
        const gap = row.scores.angular[c] - row.scores.react[c];
        if (gap > (c === 'performance' ? PERF_TOLERANCE : 0)) failed = true;
      }
      summary.push(row);
      console.log(formFactor, route, JSON.stringify(row.scores));
    }
  }
} finally {
  await browser.close();
  servers.forEach(s => s.close());
}

const pct = /** @param {number} s */ s => Math.round(s * 100);
const fmt = /** @param {string} m @param {number} v */ (m, v) => (m === 'cumulative-layout-shift' ? v.toFixed(3) : `${Math.round(v)} ms`);
const lines = [
  `# Lighthouse: Angular vs React (median of ${RUNS} runs)`,
  '',
  `| Form factor | Route | ${CATEGORIES.map(c => `${c} (A / R)`).join(' | ')} |`,
  `|---|---|${CATEGORIES.map(() => '---').join('|')}|`,
  ...summary.map(r => `| ${r.formFactor} | \`${r.route}\` | ${CATEGORIES.map(c => `${pct(r.scores.angular[c])} / ${pct(r.scores.react[c])}`).join(' | ')} |`),
  '',
  `| Form factor | Route | ${METRICS.map(m => `${m} (A / R)`).join(' | ')} |`,
  `|---|---|${METRICS.map(() => '---').join('|')}|`,
  ...summary.map(r => `| ${r.formFactor} | \`${r.route}\` | ${METRICS.map(m => `${fmt(m, r.metrics.angular[m])} / ${fmt(m, r.metrics.react[m])}`).join(' | ')} |`),
  '',
];
writeFileSync(`${OUT}/summary.md`, lines.join('\n'));
writeFileSync(`${OUT}/summary.json`, JSON.stringify(summary, null, 2));
console.log(lines.join('\n'));
if (failed) {
  console.error('React scores below the Angular baseline');
  process.exit(1);
}
