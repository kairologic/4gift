// How the lists are organised. Each group is a top-bar menu item and a URL prefix; each category is one gift list
// at /<group>/<category>/. Recipient, occasion and interest lists are picked by tag in gifts.ts; budget lists are
// worked out from each gift's starting price, so gifts never carry budget tags.

export type GroupSlug = 'for' | 'occasion' | 'budget' | 'interest';

export interface Category {
  slug: string; // unique across all groups; gifts tag themselves with it
  name: string; // menu label
  title: string; // the list page's H1
  blurb: string;
}

export interface Group {
  slug: GroupSlug;
  name: string;
  blurb: string;
  categories: Category[];
}

export interface Budget extends Category {
  max?: number; // inclusive upper bound on a gift's starting price
  min?: number; // inclusive lower bound
}

const recipients: Category[] = [
  { slug: 'her', name: 'For her', title: 'Gift ideas for her', blurb: 'Thoughtful picks for wives, girlfriends, sisters and friends.' },
  { slug: 'him', name: 'For him', title: 'Gift ideas for him', blurb: 'Useful, good-looking gifts for husbands, boyfriends, brothers and friends.' },
  { slug: 'mom', name: 'For mom', title: 'Gifts for mom', blurb: 'Comfort, keepsakes and little luxuries she would not buy herself.' },
  { slug: 'dad', name: 'For dad', title: 'Gifts for dad', blurb: 'Grill gear, gadgets and everyday upgrades for the man who says he needs nothing.' },
  { slug: 'kids', name: 'For kids', title: 'Gifts for kids', blurb: 'Building sets, art and science kits that get used long after the wrapping is gone.' },
  { slug: 'teens', name: 'For teens', title: 'Gifts for teens', blurb: 'Tech, games and room upgrades teens actually ask for.' },
  { slug: 'couples', name: 'For couples', title: 'Gifts for couples', blurb: 'Things two people can share: date nights, games and keepsakes.' },
  { slug: 'coworkers', name: 'For coworkers', title: 'Gifts for coworkers', blurb: 'Small, useful gifts that suit the office and any budget.' },
];

const occasions: Category[] = [
  { slug: 'birthday', name: 'Birthday', title: 'Birthday gift ideas', blurb: 'Crowd-pleasers for any age, from kids to grandparents.' },
  { slug: 'christmas', name: 'Christmas', title: 'Christmas gift ideas', blurb: 'Cozy, fun and practical gifts for everyone on your holiday list.' },
  { slug: 'anniversary', name: 'Anniversary', title: 'Anniversary gift ideas', blurb: 'Personal, romantic gifts that mark the years together.' },
  { slug: 'wedding', name: 'Wedding', title: 'Wedding gift ideas', blurb: 'Off-registry gifts newlyweds will use for years.' },
  { slug: 'housewarming', name: 'Housewarming', title: 'Housewarming gift ideas', blurb: 'For a new home: kitchen upgrades, plants and things to share.' },
  { slug: 'mothers-day', name: "Mother's Day", title: "Mother's Day gift ideas", blurb: 'Ways to say thanks, from keepsakes to a proper day off.' },
  { slug: 'fathers-day', name: "Father's Day", title: "Father's Day gift ideas", blurb: 'Gifts for the grill, the garage, the desk and the armchair.' },
  { slug: 'thank-you', name: 'Thank you', title: 'Thank-you gift ideas', blurb: 'Small gifts for teachers, hosts, neighbours and helpers.' },
];

export const budgets: Budget[] = [
  { slug: 'under-25', name: 'Under $25', title: 'Gifts under $25', blurb: 'Good gifts that start at $25 or less.', max: 25 },
  { slug: 'under-50', name: 'Under $50', title: 'Gifts under $50', blurb: 'The sweet spot: plenty of choice that starts at $50 or less.', max: 50 },
  { slug: 'under-100', name: 'Under $100', title: 'Gifts under $100', blurb: 'Bigger gifts that start at $100 or less.', max: 100 },
  { slug: 'splurge', name: '$100 and up', title: 'Splurge-worthy gifts', blurb: 'For a big birthday, a milestone or someone you share a home with.', min: 100 },
];

const interests: Category[] = [
  { slug: 'cooks', name: 'Home cooks', title: 'Gifts for home cooks', blurb: 'Kitchen tools that earn their counter space.' },
  { slug: 'coffee-tea', name: 'Coffee and tea lovers', title: 'Gifts for coffee and tea lovers', blurb: 'Brewers, beans and the small things that make the first cup better.' },
  { slug: 'gardeners', name: 'Gardeners', title: 'Gifts for gardeners', blurb: 'Tools, kits and indoor gardens for every season.' },
  { slug: 'readers', name: 'Readers', title: 'Gifts for readers', blurb: 'For people who always have a book on the go.' },
  { slug: 'travelers', name: 'Travelers', title: 'Gifts for travelers', blurb: 'Packing, comfort and gear for the next trip.' },
  { slug: 'fitness', name: 'Fitness fans', title: 'Gifts for fitness fans', blurb: 'Recovery, tracking and workout gear.' },
  { slug: 'gamers', name: 'Gamers', title: 'Gifts for gamers', blurb: 'Board games, controllers and headsets.' },
  { slug: 'tech', name: 'Tech lovers', title: 'Gifts for tech lovers', blurb: 'Gadgets that are useful every day, not just on day one.' },
  { slug: 'self-care', name: 'Self-care', title: 'Self-care gift ideas', blurb: 'Comfort, calm and a little pampering.' },
  { slug: 'pet-lovers', name: 'Pet lovers', title: 'Gifts for pet lovers', blurb: 'For the people whose pets are family.' },
];

export const groups: Group[] = [
  { slug: 'for', name: 'Who it is for', blurb: 'Lists by the person you are buying for.', categories: recipients },
  { slug: 'occasion', name: 'Occasions', blurb: 'Lists for birthdays, holidays and milestones.', categories: occasions },
  { slug: 'budget', name: 'By budget', blurb: 'Lists by how much you want to spend.', categories: budgets },
  { slug: 'interest', name: 'By interest', blurb: 'Lists by what they love doing.', categories: interests },
];

// Short top-bar labels; the group name above is used on hub pages.
export const menuLabel: Record<GroupSlug, string> = { for: 'Who', occasion: 'Occasion', budget: 'Budget', interest: 'Interests' };

export const tagSlugs = new Set([...recipients, ...occasions, ...interests].map((c) => c.slug));

export function findCategory(slug: string): { group: Group; category: Category } | undefined {
  for (const group of groups) {
    const category = group.categories.find((c) => c.slug === slug);
    if (category) return { group, category };
  }
  return undefined;
}

export const listUrl = (group: Group | GroupSlug, category: Category | string) =>
  `/${typeof group === 'string' ? group : group.slug}/${typeof category === 'string' ? category : category.slug}/`;
