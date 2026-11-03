import { describe, expect, it } from 'vitest';
import { shareName, sharePath, shareSvg, shareTitle } from '../src/lib/share';

describe('link-preview cards', () => {
  it('names a card after its page path', () => {
    expect(shareName('/')).toBe('home');
    expect(shareName('/occasion/christmas/')).toBe('occasion-christmas');
    expect(sharePath('/guides/gifts-for-dad/')).toBe('/share/guides-gifts-for-dad.png');
  });

  it('keeps a long title to the text column', () => {
    expect(shareTitle('Christmas gifts').lines).toHaveLength(1);
    const long = shareTitle('Gifts for a dad who says he needs nothing, sorted by what he actually does on a Saturday');
    expect(long.lines.length).toBeLessThanOrEqual(4);
    for (const l of long.lines) expect(l.length * long.size * 0.44).toBeLessThanOrEqual(600 + long.size);
  });

  it('escapes the text it draws', () => {
    const svg = shareSvg({ path: '/x/', kicker: 'A & B', title: 'Gifts <under> $25', cta: 'See the list' });
    expect(svg).toContain('>A &amp; B<');
    expect(svg).toContain('Gifts &lt;under&gt; $25');
    expect(svg).toMatch(/^<svg [^>]*width="1200" height="630"/);
  });
});
