import { transformSync } from '@babel/core';
import postcss from 'postcss';
import { describe, expect, it } from 'vitest';

import { ngEncapsulationBabel, ngEncapsulationPostcss, scopeFromFile, scopeSelector } from './ngEncapsulation';

describe('scopeFromFile', () => {
  it('derives a kebab-case scope from *.ng.scss files only', () => {
    expect(scopeFromFile('/src/components/ErrorMessage/ErrorMessage.ng.scss')).toBe('error-message');
    expect(scopeFromFile('./Item.ng.scss?inline')).toBe('item');
    expect(scopeFromFile('/src/styles/global.scss')).toBeNull();
  });
});

describe('scopeSelector', () => {
  it.each([
    ['a', 'a[data-c-x]'],
    ['.post .itemNum', '.post[data-c-x] .itemNum[data-c-x]'],
    ['a:hover', 'a[data-c-x]:hover'],
    ['.loader:before', '.loader[data-c-x]:before'],
    ['.nav > a.prev', '.nav[data-c-x] > a.prev[data-c-x]'],
    ['input[type=number]', 'input[type=number][data-c-x]'],
    ['*', '*[data-c-x]'],
    [':host', '[data-h-x]'],
    [':host(.on) a', '.on[data-h-x] a[data-c-x]'],
    [':host ::ng-deep a', '[data-h-x] a'],
    [':host ::ng-deep a:hover', '[data-h-x] a:hover'],
    ['.meta ::ng-deep p', '.meta[data-c-x] p'],
  ])('%s -> %s', (input, expected) => {
    expect(scopeSelector(input, 'x')).toBe(expected);
  });
});

describe('ngEncapsulationPostcss', () => {
  const run = (css: string, from: string) => postcss([ngEncapsulationPostcss()]).process(css, { from }).css;

  it('scopes rules in .ng.scss files but leaves keyframes and other files alone', () => {
    const css = '.a, p { color: red } @keyframes load1 { 0% { top: 0 } 100% { top: 1px } }';
    expect(run(css, '/x/Loader.ng.scss')).toBe(
      '.a[data-c-loader], p[data-c-loader] { color: red } @keyframes load1 { 0% { top: 0 } 100% { top: 1px } }',
    );
    expect(run(css, '/x/global.scss')).toBe(css);
  });

  it('scopes rules nested in media queries', () => {
    expect(run('@media (max-width: 1px) { .a { top: 0 } }', '/x/Feed.ng.scss')).toBe(
      '@media (max-width: 1px) { .a[data-c-feed] { top: 0 } }',
    );
  });
});

describe('ngEncapsulationBabel', () => {
  const run = (code: string) =>
    transformSync(code, {
      filename: 'Foo.tsx',
      babelrc: false,
      configFile: false,
      parserOpts: { plugins: ['jsx'] },
      plugins: [ngEncapsulationBabel],
    })!.code;

  it('adds the content attribute to intrinsic elements and Link/NavLink/RouterLink in files importing a .ng.scss', () => {
    const out = run(`import './Feed.ng.scss';\nconst x = <div className="a"><Link to="/"/><NavLink to="/"/><RouterLink to="/"/><Item/></div>;`);
    expect(out).toContain('<div className="a" data-c-feed="">');
    expect(out).toContain('<Link to="/" data-c-feed="" />');
    expect(out).toContain('<NavLink to="/" data-c-feed="" />');
    expect(out).toContain('<RouterLink to="/" data-c-feed="" />');
    expect(out).toContain('<Item />');
  });

  it('turns ngHost into the host attribute', () => {
    const out = run(`import './Feed.ng.scss';\nconst x = <app-comment ngHost="comment"/>;`);
    expect(out).toContain('<app-comment data-h-comment="" data-c-feed="" />');
  });

  it('leaves files without a .ng.scss import untouched', () => {
    expect(run('const x = <div/>;')).toBe('const x = <div />;');
  });
});
