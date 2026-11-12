import DOMPurify from 'dompurify';

// Angular's [innerHTML] sanitizer only keeps these attributes (VALID_ATTRS in
// @angular/core html_sanitizer); DOMPurify's defaults would also keep e.g. `style` and `id`.
const ANGULAR_VALID_ATTRS = [
  'abbr', 'accesskey', 'align', 'alt', 'autoplay', 'axis', 'bgcolor', 'border', 'cellpadding', 'cellspacing',
  'class', 'clear', 'color', 'cols', 'colspan', 'compact', 'controls', 'coords', 'datetime', 'default', 'dir',
  'download', 'face', 'headers', 'height', 'hidden', 'hreflang', 'hspace', 'ismap', 'itemscope', 'itemprop',
  'kind', 'label', 'lang', 'language', 'loop', 'media', 'muted', 'nohref', 'nowrap', 'open', 'preload', 'rel',
  'rev', 'role', 'rows', 'rowspan', 'rules', 'scope', 'scrolling', 'shape', 'size', 'sizes', 'span', 'srclang',
  'start', 'summary', 'tabindex', 'target', 'title', 'translate', 'type', 'usemap', 'valign', 'value', 'vspace',
  'width', 'background', 'cite', 'href', 'itemtype', 'longdesc', 'poster', 'src', 'xlink:href',
];

export function sanitizeHtml(html: string | null | undefined): { __html: string } {
  return { __html: html ? DOMPurify.sanitize(html, { ALLOWED_ATTR: ANGULAR_VALID_ATTRS }) : '' };
}
