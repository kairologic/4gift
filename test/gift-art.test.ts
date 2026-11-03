import { describe, expect, it } from 'vitest';
import { gifts } from '../src/data/gifts';
import { giftArtPath, giftArtSlugs, giftArtSvg } from '../src/lib/gift-art';

describe('gift-type art', () => {
  it('has a drawing for every gift idea and none for a gift that is gone', () => {
    const slugs = gifts.map((g) => g.slug);
    expect(slugs.filter((s) => !giftArtSlugs().includes(s))).toEqual([]);
    expect(giftArtSlugs().filter((s) => !slugs.includes(s))).toEqual([]);
  });

  it('draws a 320x200 tile with no outside images', () => {
    for (const [i, g] of gifts.entries()) {
      const svg = giftArtSvg(g.slug, i)!;
      expect(svg).toMatch(/^<svg xmlns="http:\/\/www.w3.org\/2000\/svg" viewBox="0 0 320 200"/);
      expect(svg).not.toMatch(/<image|href=|NaN|undefined/);
    }
  });

  it('serves each drawing at /gift-art/<slug>.svg', () => {
    expect(giftArtPath('soy-candle')).toBe('/gift-art/soy-candle.svg');
    expect(giftArtSvg('no-such-gift', 0)).toBeUndefined();
  });
});
