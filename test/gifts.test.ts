import { describe, expect, it } from 'vitest';
import { gifts } from '../src/data/gifts';
import { budgets, groups, tagSlugs } from '../src/data/taxonomy';
import picksFile from '../src/data/picks.json';
import { buyUrl, giftsFor, inBudget, isAsin, pickUrl, picksFor, productCount, relatedLists, type ProductPick } from '../src/lib/gifts';

const MIN_PER_LIST = 6;

describe('gift data', () => {
  it('has unique slugs and sane prices', () => {
    expect(new Set(gifts.map((g) => g.slug)).size).toBe(gifts.length);
    for (const g of gifts) {
      expect(g.from, g.slug).toBeGreaterThan(0);
      expect(g.to, g.slug).toBeGreaterThanOrEqual(g.from);
    }
  });

  it('only uses tags that are list categories, never budget slugs', () => {
    for (const g of gifts) for (const t of g.tags) expect(tagSlugs.has(t), `${g.slug}: ${t}`).toBe(true);
  });

  it('category slugs are unique across groups', () => {
    const all = groups.flatMap((g) => g.categories.map((c) => c.slug));
    expect(new Set(all).size).toBe(all.length);
  });

  it(`fills every list with at least ${MIN_PER_LIST} gifts`, () => {
    for (const g of groups) for (const c of g.categories) expect(giftsFor(c).length, `${g.slug}/${c.slug}`).toBeGreaterThanOrEqual(MIN_PER_LIST);
  });
});

describe('lists', () => {
  it('budget lists use the starting price and sort cheapest first', () => {
    const under25 = budgets.find((b) => b.slug === 'under-25')!;
    const list = giftsFor(under25);
    expect(list.every((g) => g.from <= 25)).toBe(true);
    expect(list.map((g) => g.from)).toEqual([...list.map((g) => g.from)].sort((a, b) => a - b));
    const splurge = budgets.find((b) => b.slug === 'splurge')!;
    expect(inBudget({ ...gifts[0], from: 100 }, splurge)).toBe(true);
    expect(inBudget({ ...gifts[0], from: 99 }, splurge)).toBe(false);
  });

  it('tag lists keep the editor order', () => {
    const her = groups[0].categories.find((c) => c.slug === 'her')!;
    const list = giftsFor(her);
    const order = gifts.filter((g) => g.tags.includes('her'));
    expect(list).toEqual(order);
  });

  it('related lists never include the list itself', () => {
    const mom = groups[0].categories.find((c) => c.slug === 'mom')!;
    expect(relatedLists(mom).some((l) => l.href === '/for/mom/')).toBe(false);
  });
});

describe('buy links', () => {
  it('search Amazon and add the tracking tag only when set', () => {
    const g = gifts[0];
    expect(buyUrl(g, '')).toBe('https://www.amazon.com/s?k=weighted+blanket');
    expect(new URL(buyUrl(g, 'gift-20')).searchParams.get('tag')).toBe('gift-20');
  });
});

describe('pins', async () => {
  const { allPins, pinBatches, pinsCsv, pinSvg, PINS_PER_WEEK } = await import('../src/lib/pins');
  const pins = allPins();

  it('has one pin per list and per gift, with unique names', () => {
    const lists = groups.reduce((n, g) => n + g.categories.length, 0);
    expect(new Set(pins.map((p) => p.name)).size).toBe(pins.length);
    expect(pins.filter((p) => p.name.startsWith('gift-')).length).toBe(gifts.length);
    expect(pins.filter((p) => !p.name.startsWith('gift-') && !/^(for|occasion|interest)-.+-under-\d+$/.test(p.name)).length).toBe(lists);
  });

  it('budget pins link to the list with that budget preselected', () => {
    const p = pins.find((x) => x.name === 'for-mom-under-50')!;
    expect(p.link).toBe('/for/mom/?max=50');
  });

  it('writes valid SVG and weekly CSV batches', () => {
    expect(pinSvg(pins[0])).toMatch(/^<svg[^>]+width="1000" height="1500"/);
    const batches = pinBatches(pins);
    expect(batches.every((b) => b.length <= PINS_PER_WEEK)).toBe(true);
    const csv = pinsCsv(batches[0], new URL('https://4gift.store'));
    expect(csv.split('\n')[1]).toContain('"https://4gift.store/pins/for-her.png"');
  });
});

describe('the tracking id file', () => {
  it('is the default tag and stays empty until HQ fills it through product-ops', async () => {
    const { AMAZON_TAG } = await import('../src/data/affiliate');
    expect(typeof AMAZON_TAG).toBe('string');
    expect(AMAZON_TAG).toMatch(/^([a-z0-9-]+-2[0-9])?$/); // an Associates tag ends in -20, -21, ... or is not set
  });
});

describe('named product picks', () => {
  const pick = (gift: string, asin = 'B0ABCD1234'): ProductPick => ({ gift, asin, name: 'Acme blanket', brand: 'Acme', note: 'Soft.', addedOn: '2026-11-03' });

  it('every pick in the file names a real gift and a real ASIN, once', () => {
    const all = picksFile.picks as ProductPick[];
    const slugs = new Set(gifts.map((g) => g.slug));
    for (const p of all) {
      expect(slugs.has(p.gift), p.asin).toBe(true);
      expect(isAsin(p.asin), p.asin).toBe(true);
      expect(p.name.trim() && p.brand.trim(), p.asin).toBeTruthy();
    }
    const keys = all.map((p) => `${p.gift}|${p.asin}`);
    expect(new Set(keys).size).toBe(keys.length);
  });

  it('link to the listing with the tag and sit under their gift', () => {
    expect(pickUrl(pick('weighted-blanket'), '4-gift-20')).toBe('https://www.amazon.com/dp/B0ABCD1234?tag=4-gift-20');
    expect(pickUrl(pick('weighted-blanket'), '')).toBe('https://www.amazon.com/dp/B0ABCD1234');
    const all = [pick('weighted-blanket'), pick('cast-iron-skillet', 'B0ZZZZ9999')];
    expect(picksFor(gifts[0], all).map((p) => p.asin)).toEqual(['B0ABCD1234']);
    expect(isAsin('B0abc')).toBe(false);
  });

  it('counts the named products a list carries', () => {
    const her = groups[0].categories.find((c) => c.slug === 'her')!;
    expect(productCount(her)).toBe(giftsFor(her).reduce((n, g) => n + picksFor(g).length, 0));
  });
});

// The revamp (Ravi, 2026-11-10): each list leads with a ranked Top 5 of named products, at least 3 of them unique.
import { productsFor as listed, topList as topOf, type ListedProduct as LP } from '../src/lib/gifts';
import { findCategory as find } from '../src/data/taxonomy';

describe('a list\'s Top 5', () => {
  const g = { slug: 'x', name: 'X', why: '', from: 50, to: 90, search: 'x', tags: ['mom'] };
  const p = (asin: string, score?: number, unique = false): LP => ({ gift: g, pick: { gift: 'x', asin, name: asin, brand: 'B', note: '', addedOn: '2026-11-10', score, unique } });

  it('ranks by score and holds three places for unique finds', () => {
    const all = [p('M1', 95), p('M2', 94), p('M3', 93), p('M4', 92), p('U1', 80, true), p('U2', 70, true), p('U3', 60, true), p('U4', 50, true)];
    const { top, more } = topOf(all);
    expect(top.map((x) => x.pick.asin)).toEqual(['M1', 'M2', 'U1', 'U2', 'U3']);
    expect(more.map((x) => x.pick.asin)).toEqual(['M3', 'M4', 'U4']);
  });
  it('fills with the best of the rest when a list has few unique finds, and never pads', () => {
    expect(topOf([p('M1', 90), p('U1', 40, true), p('M2', 80), p('M3', 70), p('M4', 60), p('M5', 50)]).top.map((x) => x.pick.asin)).toEqual(['M1', 'U1', 'M2', 'M3', 'M4']);
    expect(topOf([p('M1', 90), p('M2', 80)])).toEqual({ top: [p('M1', 90), p('M2', 80)], more: [] });
  });
  it('lists scored products first and keeps the old, unscored ones in their order', () => {
    const mom = find('mom')!.category;
    const picks = [{ gift: 'x', asin: 'OLD1', name: 'a', brand: 'B', note: '', addedOn: '2026-11-03' }, { gift: 'x', asin: 'OLD2', name: 'b', brand: 'B', note: '', addedOn: '2026-11-03' }, { gift: 'x', asin: 'NEW1', name: 'c', brand: 'B', note: '', addedOn: '2026-11-10', score: 71 }];
    expect(listed(mom, picks, [g]).map((x) => x.pick.asin)).toEqual(['NEW1', 'OLD1', 'OLD2']);
  });
  it('gives every list, the two new ones included, something to show', () => {
    for (const slug of ['seniors', 'new-parents']) expect(listed(find(slug)!.category).length + gifts.filter((x) => x.tags.includes(slug)).length, slug).toBeGreaterThanOrEqual(8);
  });
});
