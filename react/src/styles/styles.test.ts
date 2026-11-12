// @vitest-environment node
import { fileURLToPath } from 'node:url';

import * as sass from 'sass';

const opts = { silenceDeprecations: ['import', 'slash-div', 'global-builtin', 'color-functions'] } as const;
const compile = (path: string) => sass.compile(fileURLToPath(new URL(path, import.meta.url)), opts as never).css;

// The SCSS is ported verbatim: only @import paths differ, so the compiled CSS must be identical.
describe('ported SCSS', () => {
  it('styles.scss (global, incl. the three themes) compiles to the same CSS as Angular', () => {
    expect(compile('../styles.scss')).toBe(compile('../../../src/styles.scss'));
  });

  it('Layout.ng.scss compiles to the same CSS as app.component.scss', () => {
    expect(compile('../components/Layout/Layout.ng.scss')).toBe(compile('../../../src/app/app.component.scss'));
  });

  it('defines all three theme classes', () => {
    const css = compile('../styles.scss');
    for (const theme of ['default', 'night', 'amoledblack']) expect(css).toContain(`.${theme} .wrapper {`);
  });
});
