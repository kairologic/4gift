import { AMAZON_TAG } from '../data/affiliate';
import { gifts, type Gift } from '../data/gifts';
import { budgets, findCategory, groups, listUrl, type Budget, type Category, type Group } from '../data/taxonomy';

export type { Gift };

export const priceLabel = (g: Gift) => (g.from === g.to ? `About $${g.from}` : `$${g.from}–$${g.to}`);

export function inBudget(g: Gift, b: Budget): boolean {
  return (b.max === undefined || g.from <= b.max) && (b.min === undefined || g.from >= b.min);
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
