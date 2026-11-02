import { describe, expect, it } from 'vitest';
import { guideSchema, guideUrl, listsFor } from '../src/lib/guides';

// The front matter Masthead's publish step writes (kairologic/Masthead-Main, src/content/markdown.ts) must parse here,
// so a guide PR from Masthead builds the first time.
const fromMasthead = {
  title: 'Gifts for a dad who says he needs nothing',
  description: 'Twelve ideas sorted by what he actually does on a Saturday.',
  kind: 'guide',
  topic: 'for dad',
  published: '2026-11-10',
  affiliate: true,
  aiAssisted: true,
  byline: 'The 4Gift team',
  sources: [{ title: 'Wirecutter: gifts for dad', url: 'https://www.nytimes.com/wirecutter/' }],
  faq: [{ q: 'What if he returns it?', a: 'Pick from the lists with a gift receipt.' }],
};

describe('guide front matter', () => {
  it('accepts what Masthead writes', () => {
    const g = guideSchema.parse(fromMasthead);
    expect(g.published.toISOString().slice(0, 10)).toBe('2026-11-10');
    expect(g.kind).toBe('guide');
    expect(g.faq).toHaveLength(1);
    expect(g.lists).toEqual([]);
    expect(g.draft).toBe(false);
  });
  it('needs only a title and a date, and rejects a kind it does not render', () => {
    expect(guideSchema.parse({ title: 'x', published: '2026-11-12' }).affiliate).toBe(false);
    expect(() => guideSchema.parse({ title: 'x', published: '2026-11-12', kind: 'podcast' })).toThrow();
  });
  it('resolves list slugs to their pages and skips unknown ones', () => {
    const lists = listsFor(['dad', 'no-such-list']);
    expect(lists).toHaveLength(1);
    expect(lists[0].href).toBe('/for/dad/');
    expect(guideUrl('gifts-for-dad')).toBe('/guides/gifts-for-dad/');
  });
});
