// The filters the natural language search can choose from, for HQ's Haiku fallback (affiliate-hq
// src/core/find.ts reads this file and answers only with these slugs). Budgets are numbers, not slugs.
import { groups } from '../data/taxonomy';
import { SITE } from '../site';

const entries = (slug: string) =>
  groups.find((g) => g.slug === slug)!.categories.map(({ slug, name, blurb }) => ({ slug, name, blurb }));

export function GET() {
  const body = {
    store: '4gift',
    name: SITE.name,
    about: 'gift ideas sorted into lists by recipient, occasion, budget and interest',
    for: entries('for'),
    occasion: entries('occasion'),
    interest: entries('interest'),
  };
  return new Response(JSON.stringify(body), { headers: { 'content-type': 'application/json' } });
}
