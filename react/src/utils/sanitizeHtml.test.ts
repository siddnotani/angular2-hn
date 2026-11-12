import { sanitizeHtml } from './sanitizeHtml';

describe('sanitizeHtml', () => {
  it('keeps the HTML HN sends', () => {
    const html = '<p>See <a href="https://example.com" rel="nofollow">this</a></p><pre><code>x &gt; 1</code></pre><i>y</i>';
    expect(sanitizeHtml(html).__html).toBe(html);
  });

  it('removes scripts, event handlers and javascript: URLs', () => {
    const out = sanitizeHtml('<img src="x" onerror="alert(1)"><script>alert(2)</script><a href="javascript:alert(3)">z</a>').__html;
    expect(out).toBe('<img src="x"><a>z</a>');
  });

  it('drops attributes Angular does not allow, like style and id', () => {
    expect(sanitizeHtml('<p style="color:red" id="a" class="c">t</p>').__html).toBe('<p class="c">t</p>');
  });

  it.each([undefined, null, ''])('renders %s as empty', html => {
    expect(sanitizeHtml(html).__html).toBe('');
  });
});
