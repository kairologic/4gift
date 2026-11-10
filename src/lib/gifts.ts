import { AMAZON_TAG } from '../data/affiliate';
import { gifts, type Gift } from '../data/gifts';
import picksFile from '../data/picks.json';
import { budgets, findCategory, groups, listUrl, type Budget, type Category, type Group } from '../data/taxonomy';

export type { Gift };

export const priceLabel = (g: Gift) => (g.from === g.to ? `About $${g.from}` : `$${g.from}–$${g.to}`);

export function inBudget(g: Gift, b: Budget): boolean {
  if (b.small) return g.small === true;
  return (b.max === undefined || g.from <= b.max) && (b.min === undefined || g.to > b.min);
}

// Every gift on a list, in editor's order. Budget lists sort cheapest first, since price is the point of them.
export function giftsFor(category: Category, all: Gift[] = gifts): Gift[] {
  const budget = budgets.find((b) => b.slug === category.slug);
  if (budget) return all.filter((g) => inBudget(g, budget)).sort((a, b) => a.from - b.from);
  return all.filter((g) => g.tags.includes(category.slug));
}

// The Amazon search the buy button opens. The Associates tracking id comes from src/data/affiliate.ts, which
// product-ops keeps in step with HQ (PUBLIC_AMAZON_TAG in the deploy workflow overrides it); until the account is
// approved the tag is empty and links still work, they just don't earn.
export function buyUrl(g: Gift, tag = import.meta.env.PUBLIC_AMAZON_TAG || AMAZON_TAG): string {
  const u = new URL('https://www.amazon.com/s');
  u.searchParams.set('k', g.search);
  if (tag) u.searchParams.set('tag', tag);
  return u.toString();
}

// The lists a gift appears on, as chips under its card.
export function listsOf(g: Gift): { name: string; href: string }[] {
  return g.tags.flatMap((t) => {
    const hit = findCategory(t);
    return hit ? [{ name: hit.category.name, href: listUrl(hit.group, hit.category) }] : [];
  });
}

// Other lists worth a look from this one: the categories its gifts share most often, plus the budget lists.
export function relatedLists(category: Category, max = 8): { name: string; href: string }[] {
  const counts = new Map<string, number>();
  for (const g of giftsFor(category)) for (const t of g.tags) if (t !== category.slug) counts.set(t, (counts.get(t) ?? 0) + 1);
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, max)
    .flatMap(([slug]) => {
      const hit = findCategory(slug);
      return hit ? [{ name: hit.category.name, href: listUrl(hit.group, hit.category) }] : [];
    });
}

export function allLists(): { group: Group; category: Category; url: string; count: number }[] {
  return groups.flatMap((group) =>
    group.categories.map((category) => ({ group, category, url: listUrl(group, category), count: giftsFor(category).length })),
  );
}

// Named products for a gift idea: the Amazon listings Jan or Ravi approved from product-ops' daily shortlist.
// src/data/picks.json is written by product-ops through a pull request (never by hand); each entry names the gift
// idea it belongs to, so a list shows the idea and, under it, the products we would buy.
export interface ProductPick {
  gift: string; // a gift slug from src/data/gifts.ts
  asin: string; // the amazon.com listing
  name: string;
  brand: string;
  note: string; // one line: why this one
  addedOn: string; // YYYY-MM-DD
  // What product-ops read when it shortlisted the product (2026-11-10 on). Older entries carry none of these.
  priceUsd?: number;
  stars?: number; // out of 5
  ratings?: number; // how many ratings stand behind the stars
  score?: number; // product-ops' 0-100 score; a list ranks by it
  unique?: boolean; // a unique find: a small maker, a design-led brand, personalized, or a new kind of product
}

export const isAsin = (v: string) => /^(B0[0-9A-Z]{8}|[0-9]{9}[0-9X])$/.test(v);

export function picksFor(g: Gift, all: ProductPick[] = picksFile.picks as ProductPick[]): ProductPick[] {
  return all.filter((p) => p.gift === g.slug);
}

// A named product's own Amazon page, with the same tracking id as the search button.
export function pickUrl(p: ProductPick, tag = import.meta.env.PUBLIC_AMAZON_TAG || AMAZON_TAG): string {
  const u = new URL(`https://www.amazon.com/dp/${p.asin}`);
  if (tag) u.searchParams.set('tag', tag);
  return u.toString();
}

export interface ListedProduct { pick: ProductPick; gift: Gift }

/** Every named product on a list, best first: by score, then in the list's own gift order (unscored entries keep it). */
export function productsFor(category: Category, all: ProductPick[] = picksFile.picks as ProductPick[], from: Gift[] = gifts): ListedProduct[] {
  return giftsFor(category, from)
    .flatMap((gift) => picksFor(gift, all).map((pick) => ({ pick, gift })))
    .map((p, i) => ({ p, i }))
    .sort((a, b) => (b.p.pick.score ?? -1) - (a.p.pick.score ?? -1) || a.i - b.i)
    .map((x) => x.p);
}

export const TOP = 5;

/**
 * A list's ranked Top 5 and the rest ("More we reviewed"). At least half of the Top (3 of 5) are unique finds when the
 * list has them, so a list never reads as five bestsellers (Ravi, 2026-11-10); the places left go by rank.
 */
export function topList(products: ListedProduct[], n = TOP): { top: ListedProduct[]; more: ListedProduct[] } {
  const held = products.filter((p) => p.pick.unique).slice(0, Math.ceil(n / 2));
  const rest = products.filter((p) => !held.includes(p)).slice(0, n - held.length);
  const top = products.filter((p) => held.includes(p) || rest.includes(p));
  return { top, more: products.filter((p) => !top.includes(p)) };
}

/** How many named products a list carries, for the lists page and the launch goal (6-10 per list on 10 lists). */
export const productCount = (category: Category) => giftsFor(category).reduce((n, g) => n + picksFor(g).length, 0);
