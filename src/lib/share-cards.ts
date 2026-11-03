import { getCollection } from 'astro:content';
import { groups, listUrl } from '../data/taxonomy';
import { giftsFor } from './gifts';
import { guideUrl } from './guides';
import { shareName, type ShareCard } from './share';
import { SITE } from '../site';

// Every page that gets its own link-preview card. Any other page (about, contact, legal) shares the home card.
export async function allShareCards(): Promise<ShareCard[]> {
  const cards: ShareCard[] = [
    { path: '/', kicker: 'Gift ideas', title: 'Gift ideas for every person, occasion and budget', cta: 'Find a gift' },
    { path: '/lists/', kicker: `${SITE.name} lists`, title: 'Every gift list in one place', cta: 'See the lists' },
    { path: '/guides/', kicker: 'Gift guides', title: 'How to choose a gift in a few minutes', cta: 'Read the guides' },
  ];
  for (const g of groups) {
    cards.push({ path: `/${g.slug}/`, kicker: g.name, title: g.blurb.replace(/\.$/, ''), cta: 'See the lists' });
    for (const c of g.categories) cards.push({ path: listUrl(g, c), kicker: `${giftsFor(c).length} gift ideas`, title: c.title, cta: 'See the list' });
  }
  for (const guide of await getCollection('guides', (x) => !x.data.draft)) {
    cards.push({ path: guideUrl(guide.id), kicker: guide.data.topic || 'Gift guide', title: guide.data.title, cta: 'Read the guide' });
  }
  return cards;
}

/** The card a page shares: its own, else the home card. */
export async function shareCardFor(path: string): Promise<ShareCard> {
  const cards = await allShareCards();
  const name = shareName(path);
  return cards.find((c) => shareName(c.path) === name) ?? cards[0];
}
