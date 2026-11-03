// Natural language gift search. Reads a request like "birthday present for a 10 year old girl around $50" into the
// same filters the lists use (recipient, occasion, interest tags from taxonomy.ts, plus a price window), then ranks
// gift ideas against them. It runs in the browser with no network call, so it is instant and free; requests it
// cannot fully read are flagged `unsure` so a smarter reader (HQ's Haiku endpoint, when configured) can take over.
// The output is always taxonomy filters, never free text, so nothing here can invent a product.

import type { Gift } from '../data/gifts';

export interface Filters {
  for?: string; // recipient slug: her, him, mom, dad, kids, teens, couples, coworkers
  occasion?: string; // occasion slug
  interests: string[]; // interest slugs
  min?: number; // dollars; a gift fits when its typical range overlaps [min, max]
  max?: number;
  around?: number; // the number the reader gave with "around"/"about", kept for display
  age?: number;
  person?: string; // the word they used (girl, nephew, wife), kept for display
  pet?: boolean; // the gift is for an animal, not a person: other stores may serve it better
}

export interface Parsed extends Filters {
  q: string;
  unsure: boolean; // words we could not place, or nothing recognised at all
  leftovers: string[];
}

type Rule = [RegExp, string];

// Order matters: the first rule that matches wins for recipient and occasion. Multi-word phrases come first.
const OCCASIONS: Rule[] = [
  [/\bmother'?s? ?day\b/, 'mothers-day'],
  [/\bfather'?s? ?day\b/, 'fathers-day'],
  [/\b(graduat\w*|grad|commencement|finish(ed|ing)? (school|college|university))\b/, 'graduation'],
  [/\b(birthday|bday|b-day|turning \d+|\d+(st|nd|rd|th) birthday)\b/, 'birthday'],
  [/\b(christmas|xmas|x-mas|holiday|holidays|stocking|secret santa|hanukkah|festive)\b/, 'christmas'],
  [/\b(anniversary|anniversaries)\b/, 'anniversary'],
  [/\b(wedding|newlyweds?|bride|groom|bridal|engagement)\b/, 'wedding'],
  [/\b(housewarming|house warming|new (home|house|apartment|place)|moving in|moved in)\b/, 'housewarming'],
  [/\b(thank ?you|thanks|teacher|host(ess)?|appreciation|neighbou?r|helper)\b/, 'thank-you'],
];

const RECIPIENTS: Rule[] = [
  [/\b(mom|mum|mother|mommy|mama|grandma|grandmother|granny|nana|mother-in-law|mil)\b/, 'mom'],
  [/\b(dad|father|daddy|papa|grandpa|grandfather|granddad|father-in-law|fil)\b/, 'dad'],
  [/\b(couples?|newlyweds|parents|the two of them)\b/, 'couples'],
  [/\b(coworkers?|co-workers?|colleagues?|boss|manager|employees?|team|office|secret santa)\b/, 'coworkers'],
  [/\b(teens?|teenagers?|teenage|adolescents?|high ?schooler|tween)\b/, 'teens'],
  [/\b(kids?|child|children|toddler|little (one|girl|boy)|grandkids?|grandchild(ren)?)\b/, 'kids'],
  [/\b(wife|girlfriend|gf|sister|fianc[eé]e|her|woman|women|lady|aunt|niece|daughter|bestie|she)\b/, 'her'],
  [/\b(husband|boyfriend|bf|brother|fianc[eé]|him|man|men|guy|uncle|nephew|son|he)\b/, 'him'],
];

// Words that mean a child unless an age says otherwise. Son, daughter, niece and nephew can be any age, so without
// an age they read as him or her ("my son who is graduating college").
const YOUNG = /\b(girls?|boys?|grandsons?|granddaughters?|grandkids?)\b/;

const INTERESTS: Rule[] = [
  [/\b(cook\w*|chef|kitchen|bak(e|er|ing)|foodie|grill\w*|bbq)\b/, 'cooks'],
  [/\b(coffee|tea|espresso|latte|barista)\b/, 'coffee-tea'],
  [/\b(garden\w*|plants?|green thumb|grow(ing)? herbs)\b/, 'gardeners'],
  [/\b(read(s|er|ers|ing)?|books?|bookworm|novels?)\b/, 'readers'],
  [/\b(travel\w*|trips?|vacation|adventur\w*|hik(e|er|ing)|camp(er|ing)?|outdoors?)\b/, 'travelers'],
  [/\b(fitness|gym|workouts?|exercise|runn(er|ing)|runs|yoga|athlete|sporty|sports)\b/, 'fitness'],
  [/\b(gam(e|er|ers|es|ing)|video ?games?|board ?games?|xbox|playstation|nintendo)\b/, 'gamers'],
  [/\b(tech\w*|gadgets?|geek|nerd|electronics)\b/, 'tech'],
  [/\b(self-care|self care|spa|pamper\w*|relax\w*|stress\w*|cozy|cosy)\b/, 'self-care'],
  [/\b(pet lovers?|dog lovers?|cat lovers?|dog (mom|dad|parent)|cat (mom|dad|parent))\b/, 'pet-lovers'],
];

// A gift for the animal itself ("a present for my dog"), as opposed to its owner.
const PET = /\b(for (my|our|a|the) (dog|puppy|cat|kitten|pet)s?|(dog|puppy|cat|kitten)'?s? (birthday|gift|present|christmas))\b/;
const ANIMAL = /\b(dogs?|pupp(y|ies)|cats?|kittens?|pets?)\b/;

// Words that carry no gift meaning; anything left after removing these and the recognised phrases is a leftover.
const STOP = new Set(
  ('a an the for to my our your his their of in on at with and or but is are was be who that this some any ' +
    'gift gifts present presents idea ideas looking look find want need buy buying get getting give giving ' +
    'something someone somebody thing things good great nice best cool fun perfect special unique ' +
    'around about under over below above less more than up max maximum budget spend spending price cheap ' +
    'dollars dollar usd bucks year years yr yrs old aged age turning i im i\'m we me us please just really ' +
    'very new little big young older who\'s whos loves love likes like into enjoys ' +
    'she he her him they them college school university high first').split(' '),
);

function first(rules: Rule[], text: string): { slug: string; match: string } | undefined {
  for (const [re, slug] of rules) {
    const m = text.match(re);
    if (m) return { slug, match: m[0] };
  }
  return undefined;
}

function money(text: string): Pick<Filters, 'min' | 'max' | 'around'> & { matches: string[] } {
  const n = String.raw`\$?\s?(\d+(?:\.\d+)?)(?:\s?(?:dollars?|bucks|usd))?`;
  const range = text.match(new RegExp(String.raw`(?:between\s)?${n}\s?(?:-|–|to|and)\s?${n}`));
  if (range && (range[0].includes('$') || /between|dollar|buck|usd/.test(range[0]) || /\bbudget|spend/.test(text))) {
    const [a, b] = [Number(range[1]), Number(range[2])].sort((x, y) => x - y);
    return { min: a, max: b, matches: [range[0]] };
  }
  const under = text.match(new RegExp(String.raw`(?:under|below|less than|no more than|up to|at most|max(?:imum)?|within|cheaper than|<)\s?${n}`));
  if (under) return { max: Number(under[1]), matches: [under[0]] };
  const over = text.match(new RegExp(String.raw`(?:over|above|more than|at least|min(?:imum)?|>|starting at)\s?${n}`));
  if (over) return { min: Number(over[1]), matches: [over[0]] };
  const around = text.match(new RegExp(String.raw`(?:around|about|roughly|approximately|approx|~|close to|near)\s?${n}`));
  // A bare "$50" or "50 dollars" reads as "around 50".
  const bare = around ?? text.match(/\$\s?(\d+(?:\.\d+)?)|(\d+(?:\.\d+)?)\s?(?:dollars?|bucks|usd)\b/);
  if (bare) {
    const v = Number(bare[1] ?? bare[2]);
    return { min: Math.round(v * 0.6), max: Math.round(v * 1.25), around: v, matches: [bare[0]] };
  }
  return { matches: [] };
}

function ageOf(text: string): { age?: number; match?: string } {
  const m = text.match(/\b(\d{1,2})\s?(?:-|\s)?(?:years?|yrs?|yo|y\/o)(?:\s?-?\s?old)?\b/) ?? text.match(/\bturning (\d{1,2})\b/) ?? text.match(/\b(\d{1,2})(?:st|nd|rd|th) birthday\b/) ?? text.match(/\baged? (\d{1,2})\b/);
  return m ? { age: Number(m[1]), match: m[0] } : {};
}

export function parseQuery(raw: string): Parsed {
  const q = raw.trim().slice(0, 300);
  let text = ` ${q.toLowerCase().replace(/[’`]/g, "'").replace(/[!?,.;:"()]/g, ' ').replace(/\s+/g, ' ')} `;
  const used: string[] = [];
  const take = (s?: string) => { if (s) used.push(s); };

  const price = money(text);
  price.matches.forEach(take);
  for (const s of price.matches) text = text.replace(s, ' ');

  const { age, match: ageMatch } = ageOf(text);
  take(ageMatch);

  const occasion = first(OCCASIONS, text);
  take(occasion?.match);

  const pet = PET.test(text);
  const interests: string[] = [];
  for (const [re, slug] of INTERESTS) {
    const m = text.match(re);
    if (m && !interests.includes(slug)) { interests.push(slug); take(m[0]); }
  }
  if (pet && !interests.includes('pet-lovers')) interests.push('pet-lovers');
  const animal = text.match(ANIMAL);
  if (animal) { take(animal[0]); if (!interests.includes('pet-lovers')) interests.push('pet-lovers'); }

  // Recipient: an age or a child word decides kids vs teens before the gendered words get a say.
  const young = text.match(YOUNG);
  let recipient: string | undefined;
  let person: string | undefined;
  if (age !== undefined && age < 13) recipient = 'kids';
  else if (age !== undefined && age < 20) recipient = 'teens';
  const r = first(RECIPIENTS, text);
  if (!recipient && young && !(r && ['mom', 'dad', 'couples', 'coworkers', 'teens'].includes(r.slug))) {
    recipient = 'kids';
  }
  if (!recipient && r) recipient = r.slug;
  if (young) { person = young[0]; take(young[0]); }
  if (r) { take(r.match); person ??= r.match; }
  // "her"/"him" are also plain pronouns ("a gift for my sister, she loves tea"): the first gendered word wins above.
  if (age !== undefined && age >= 20 && recipient === 'kids') recipient = undefined;

  // Leftovers: content words we could not place. Two or more means the request is probably richer than our rules.
  let rest = text;
  for (const u of used) rest = rest.replace(u, ' ');
  const leftovers = rest.split(' ').filter((w) => w && !STOP.has(w) && !/^\d+$/.test(w) && w.length > 2);
  const recognised = Boolean(recipient || occasion || interests.length || price.max || price.min);

  return {
    q,
    for: recipient,
    occasion: occasion?.slug,
    interests,
    min: price.min,
    max: price.max,
    around: price.around,
    age,
    person,
    pet: pet || undefined,
    leftovers,
    unsure: !recognised || leftovers.length >= 2,
  };
}

// Structured links (from channels or the chips on /find/) skip parsing: /find/?for=kids&occasion=birthday&max=50.
export function filtersFromParams(p: URLSearchParams): Filters | undefined {
  const keys = ['for', 'occasion', 'interest', 'min', 'max'];
  if (!keys.some((k) => p.has(k))) return undefined;
  const num = (k: string) => (p.get(k) && Number.isFinite(Number(p.get(k))) ? Number(p.get(k)) : undefined);
  return {
    for: p.get('for') || undefined,
    occasion: p.get('occasion') || undefined,
    interests: p.getAll('interest').flatMap((s) => s.split(',')).filter(Boolean),
    min: num('min'),
    max: num('max'),
  };
}

export function filtersToParams(f: Filters): URLSearchParams {
  const p = new URLSearchParams();
  if (f.for) p.set('for', f.for);
  if (f.occasion) p.set('occasion', f.occasion);
  if (f.interests.length) p.set('interest', f.interests.join(','));
  if (f.min !== undefined) p.set('min', String(f.min));
  if (f.max !== undefined) p.set('max', String(f.max));
  return p;
}

export const fitsPrice = (g: Pick<Gift, 'from' | 'to'>, f: Pick<Filters, 'min' | 'max'>) =>
  (f.max === undefined || g.from <= f.max) && (f.min === undefined || g.to >= f.min);

export interface Ranked<G> { gift: G; score: number; exact: boolean }

// Price is a hard filter. Among gifts in budget, the ones that match every asked-for tag come first ("exact"),
// then gifts that match some of them (recipient counts most), each group in editor's order.
export function rankGifts<G extends Pick<Gift, 'from' | 'to' | 'tags'>>(all: G[], f: Filters): Ranked<G>[] {
  const want = [f.for, f.occasion, ...f.interests].filter((t): t is string => Boolean(t));
  const out: Ranked<G>[] = [];
  all.forEach((gift) => {
    if (!fitsPrice(gift, f)) return;
    let score = 0;
    let hits = 0;
    if (f.for && gift.tags.includes(f.for)) { score += 4; hits++; }
    if (f.occasion && gift.tags.includes(f.occasion)) { score += 2; hits++; }
    for (const i of f.interests) if (gift.tags.includes(i)) { score += 3; hits++; }
    if (want.length && score === 0) return;
    out.push({ gift, score, exact: hits === want.length });
  });
  // Stable sort keeps editor's order within equal scores.
  return out.sort((a, b) => Number(b.exact) - Number(a.exact) || b.score - a.score);
}
