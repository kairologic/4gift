import { describe, expect, it } from 'vitest';
import { gifts } from '../src/data/gifts';
import { tagSlugs } from '../src/data/taxonomy';
import { filtersFromParams, filtersToParams, parseQuery, rankGifts } from '../src/lib/find';

describe('parseQuery', () => {
  it('reads occasion, a child by age and an "around" budget', () => {
    const p = parseQuery('I am looking for a birthday present for a 10 year girl around $50');
    expect(p).toMatchObject({ occasion: 'birthday', for: 'kids', age: 10, person: 'girl', around: 50 });
    expect(p.min).toBeLessThan(50);
    expect(p.max).toBeGreaterThan(50);
    expect(p.unsure).toBe(false);
  });

  it('reads graduation, a teenage boy and an "under" budget', () => {
    expect(parseQuery('graduation gift to a teenage boy under $100')).toMatchObject({ occasion: 'graduation', for: 'teens', max: 100, min: undefined, unsure: false });
  });

  it.each([
    ["mother's day gift for my mom under 40 dollars", { occasion: 'mothers-day', for: 'mom', max: 40 }],
    ['anniversary gift for my wife who loves coffee', { occasion: 'anniversary', for: 'her', interests: ['coffee-tea'] }],
    ['christmas present for a 15 yr old nephew into video games', { occasion: 'christmas', for: 'teens', interests: ['gamers'] }],
    ['something for my 6-year-old son', { for: 'kids', age: 6 }],
    ['thank you gift for a teacher, $20-$30', { occasion: 'thank-you', min: 20, max: 30 }],
    ['gift for my dad who likes to grill, over $100', { for: 'dad', interests: ['cooks'], min: 100 }],
    ['secret santa for a coworker under $25', { for: 'coworkers', max: 25 }],
    ['housewarming gift for a couple', { occasion: 'housewarming', for: 'couples' }],
    ['a present for my dog', { interests: ['pet-lovers'], pet: true }],
  ])('%s', (q, want) => {
    expect(parseQuery(q)).toMatchObject(want);
  });

  it('only ever returns real taxonomy slugs', () => {
    const qs = ['birthday gift for grandma who gardens', 'bday for my bf, gamer, about 60 bucks', 'gift for a 30 year old man who travels', 'xmas for niece 8'];
    for (const q of qs) {
      const p = parseQuery(q);
      for (const t of [p.for, p.occasion, ...p.interests].filter(Boolean)) expect(tagSlugs.has(t!), `${q}: ${t}`).toBe(true);
    }
  });

  it('flags requests it cannot read', () => {
    expect(parseQuery('something for a retired surgeon who collects vintage maps').unsure).toBe(true);
    expect(parseQuery('asdf').unsure).toBe(true);
  });

  it('does not read an adult age as a child', () => {
    expect(parseQuery('gift for a 40 year old woman').for).toBe('her');
  });
});

describe('rankGifts', () => {
  it('finds birthday gifts for kids around $50, all in budget', () => {
    const p = parseQuery('birthday present for a 10 year old girl around $50');
    const r = rankGifts(gifts, p);
    const exact = r.filter((x) => x.exact);
    expect(exact.length).toBeGreaterThanOrEqual(4);
    for (const x of exact) expect(x.gift.tags).toEqual(expect.arrayContaining(['kids', 'birthday']));
    for (const x of r) expect(x.gift.from).toBeLessThanOrEqual(p.max!);
  });

  it('finds graduation gifts for teens under $100', () => {
    const exact = rankGifts(gifts, parseQuery('graduation gift for a teenage boy under $100')).filter((x) => x.exact);
    expect(exact.length).toBeGreaterThanOrEqual(5);
    for (const x of exact) expect(x.gift.from).toBeLessThanOrEqual(100);
  });

  it('puts exact matches before partial ones', () => {
    const r = rankGifts(gifts, { for: 'kids', occasion: 'birthday', interests: [] });
    const firstPartial = r.findIndex((x) => !x.exact);
    expect(r.slice(firstPartial).every((x) => !x.exact)).toBe(true);
  });
});

describe('structured links', () => {
  it('round-trips filters through the URL', () => {
    const f = { for: 'kids', occasion: 'birthday', interests: ['gamers', 'tech'], min: 30, max: 60 };
    expect(filtersFromParams(filtersToParams(f))).toEqual(f);
    expect(filtersFromParams(new URLSearchParams('q=hello'))).toBeUndefined();
  });
});

describe('ambiguous family words', () => {
  it('reads a son or daughter without an age as an adult', () => {
    expect(parseQuery('gift for my son who is graduating college')).toMatchObject({ for: 'him', occasion: 'graduation', unsure: false });
    expect(parseQuery('gift for my sister, she loves tea').leftovers).toEqual([]);
  });
});
