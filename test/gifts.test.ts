import { describe, expect, it } from 'vitest';
import { gifts } from '../src/data/gifts';
import { budgets, groups, tagSlugs } from '../src/data/taxonomy';
import { buyUrl, giftsFor, inBudget, relatedLists } from '../src/lib/gifts';

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
