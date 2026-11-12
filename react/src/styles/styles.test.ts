// @vitest-environment node
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import * as sass from 'sass';

const opts = { silenceDeprecations: ['import', 'slash-div', 'global-builtin', 'color-functions'] } as const;
const compile = (path: string) => sass.compile(fileURLToPath(new URL(path, import.meta.url)), opts as never).css;
// Dart Sass now drops rules using the old `>>>` combinator that Angular 9's Sass kept, so the
// React copies spell it `::ng-deep` (same meaning to Angular). Compare against that spelling.
const compileAngularDeep = (path: string) => {
  const url = new URL(path, import.meta.url);
  const source = readFileSync(url, 'utf8').replace(/>>>/g, '::ng-deep');
  return sass.compileString(source, { ...opts, url } as never).css;
};

// The SCSS is ported verbatim: only @import paths differ, so the compiled CSS must be identical.
describe('ported SCSS', () => {
  it('styles.scss (global, incl. the three themes) compiles to the same CSS as Angular', () => {
    expect(compile('../styles.scss')).toBe(compile('../../../src/styles.scss'));
  });

  it('Layout.ng.scss compiles to the same CSS as app.component.scss', () => {
    expect(compile('../components/Layout/Layout.ng.scss')).toBe(compile('../../../src/app/app.component.scss'));
  });

  it.each([
    ['components/Item/Item.ng.scss', 'feeds/item/item.component.scss'],
    ['pages/Feed/Feed.ng.scss', 'feeds/feed/feed.component.scss'],
    ['components/Loader/Loader.ng.scss', 'shared/components/loader/loader.component.scss'],
    ['components/ErrorMessage/ErrorMessage.ng.scss', 'shared/components/error-message/error-message.component.scss'],
    ['pages/ItemDetails/ItemDetails.ng.scss', 'item-details/item-details.component.scss'],
  ])('%s compiles to the same CSS as %s', (react, angular) => {
    expect(compile(`../${react}`)).toBe(compile(`../../../src/app/${angular}`));
  });

  it.each([
    ['components/Comment/Comment.ng.scss', 'item-details/comment/comment.component.scss'],
    ['pages/User/User.ng.scss', 'user/user.component.scss'],
  ])('%s matches %s with `>>>` written as ::ng-deep', (react, angular) => {
    const css = compile(`../${react}`);
    expect(css).toBe(compileAngularDeep(`../../../src/app/${angular}`));
    expect(css).toContain(':host ::ng-deep');
  });

  it('defines all three theme classes', () => {
    const css = compile('../styles.scss');
    for (const theme of ['default', 'night', 'amoledblack']) expect(css).toContain(`.${theme} .wrapper {`);
  });
});
