// Emulates Angular's default (Emulated) view encapsulation so the component SCSS can be
// ported verbatim and keep the exact same scoping and selector specificity.
//
// - Styles in `Name.ng.scss` get a `[data-c-<scope>]` attribute appended to every compound
//   selector, like Angular's `[_ngcontent-xxx]`. `:host` becomes `[data-h-<scope>]` and
//   anything after `::ng-deep` is left unscoped.
// - A Babel plugin adds `data-c-<scope>` to every intrinsic JSX element (and to `Link`/`NavLink`,
//   which forward props to `<a>`) in any file that imports `./Name.ng.scss`. A JSX attribute
//   `ngHost="<scope>"` becomes `data-h-<scope>`, marking a component's host element.
import type { PluginObj, types as BabelTypes } from '@babel/core';
import type { AtRule, Plugin as PostcssPlugin, Rule } from 'postcss';
import selectorParser from 'postcss-selector-parser';

export const NG_STYLE_SUFFIX = '.ng.scss';
const DOM_FORWARDING_COMPONENTS = new Set(['Link', 'NavLink']);

export function scopeFromFile(file: string): string | null {
  const clean = file.split('?')[0].replace(/\\/g, '/');
  if (!clean.endsWith(NG_STYLE_SUFFIX)) {
    return null;
  }
  const base = clean.slice(clean.lastIndexOf('/') + 1, -NG_STYLE_SUFFIX.length);
  return base.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
}

export const contentAttr = (scope: string) => `data-c-${scope}`;
export const hostAttr = (scope: string) => `data-h-${scope}`;

function scopeCompound(nodes: selectorParser.Node[], scope: string) {
  const firstPseudo = nodes.findIndex(n => n.type === 'pseudo');
  const insertBefore = firstPseudo === -1 ? null : nodes[firstPseudo];
  const attr = selectorParser.attribute({ attribute: contentAttr(scope), raws: {} } as never);
  if (insertBefore) {
    insertBefore.parent!.insertBefore(insertBefore, attr);
  } else {
    const last = nodes[nodes.length - 1];
    last.parent!.insertAfter(last, attr);
  }
}

export function scopeSelector(selector: string, scope: string): string {
  return selectorParser(selectors => {
    selectors.each(sel => {
      let compound: selectorParser.Node[] = [];
      let isHost = false;
      const flush = () => {
        if (compound.length && !isHost) {
          scopeCompound(compound, scope);
        }
        compound = [];
        isHost = false;
      };
      for (const node of [...sel.nodes]) {
        if (node.type === 'combinator') {
          flush();
          continue;
        }
        if (node.type === 'pseudo' && node.value === '::ng-deep') {
          const prev = node.prev();
          const next = node.next();
          node.remove();
          if (prev?.type === 'combinator' && next?.type === 'combinator') {
            next.remove();
          }
          flush();
          break;
        }
        if (node.type === 'pseudo' && node.value === ':host') {
          const host = selectorParser.attribute({ attribute: hostAttr(scope), raws: {} } as never);
          const inner = node.nodes[0]?.nodes ?? [];
          node.replaceWith(host);
          for (const innerNode of [...inner].reverse()) {
            host.parent!.insertBefore(host, innerNode.clone());
          }
          isHost = true;
          continue;
        }
        compound.push(node);
      }
      flush();
    });
  }).processSync(selector);
}

export function ngEncapsulationPostcss(): PostcssPlugin {
  return {
    postcssPlugin: 'ng-encapsulation',
    Once(root) {
      const scope = scopeFromFile(root.source?.input.file ?? '');
      if (!scope) {
        return;
      }
      root.walkRules((rule: Rule) => {
        const parent = rule.parent;
        if (parent?.type === 'atrule' && /keyframes$/i.test((parent as AtRule).name)) {
          return;
        }
        rule.selectors = rule.selectors.map(s => scopeSelector(s, scope));
      });
    },
  };
}

export function ngEncapsulationBabel({ types: t }: { types: typeof BabelTypes }): PluginObj<{
  scope?: string | null;
}> {
  return {
    name: 'ng-encapsulation',
    visitor: {
      Program(path, state) {
        state.scope = null;
        for (const stmt of path.node.body) {
          if (t.isImportDeclaration(stmt)) {
            const scope = scopeFromFile(stmt.source.value);
            if (scope) {
              state.scope = scope;
            }
          }
        }
      },
      JSXOpeningElement(path, state) {
        const { name } = path.node;
        for (const attr of path.node.attributes) {
          if (t.isJSXAttribute(attr) && attr.name.name === 'ngHost' && t.isStringLiteral(attr.value)) {
            attr.name = t.jsxIdentifier(hostAttr(attr.value.value));
            attr.value = t.stringLiteral('');
          }
        }
        if (!state.scope || !t.isJSXIdentifier(name)) {
          return;
        }
        const isIntrinsic = /^[a-z]/.test(name.name);
        if (!isIntrinsic && !DOM_FORWARDING_COMPONENTS.has(name.name)) {
          return;
        }
        path.node.attributes.push(t.jsxAttribute(t.jsxIdentifier(contentAttr(state.scope)), t.stringLiteral('')));
      },
    },
  };
}
