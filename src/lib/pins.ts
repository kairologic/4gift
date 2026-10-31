import { budgets, findCategory, groups, listUrl, type Category, type Group } from '../data/taxonomy';
import { giftsFor, inBudget, listsOf, priceLabel, type Gift } from './gifts';
import { SITE } from '../site';

// Pinterest pins, made at build time: one tall image per list, per list-and-budget pair, and per gift. Every pin
// links back to the page it describes, and /pins.csv lists them all in Pinterest's bulk-upload format.

export const PIN_W = 1000;
export const PIN_H = 1500;
const MIN_ON_BUDGET_PIN = 5;

export interface Pin {
  name: string; // file name under /pins/, without .png
  title: string;
  description: string;
  link: string; // site path the pin opens
  board: string; // Pinterest board to post it to
  kicker: string; // small line above the title
  lines: string[]; // gift names (list pins) or the gift's pitch (gift pins)
  footer: string;
}

export const pinPath = (name: string) => `/pins/${name}.png`;
export const listPinName = (group: Group, category: Category, max?: number) =>
  `${group.slug}-${category.slug}${max ? `-under-${max}` : ''}`;
export const giftPinName = (g: Gift) => `gift-${g.slug}`;

const ideas = (n: number) => `${n} gift idea${n === 1 ? '' : 's'}`;
const from = (list: Gift[]) => Math.min(...list.map((g) => g.from));

function listPin(group: Group, category: Category, list: Gift[], max?: number): Pin {
  const title = max ? `${category.title} under $${max}` : category.title;
  const names = list.slice(0, 6).map((g) => g.name);
  return {
    name: listPinName(group, category, max),
    title,
    description: `${ideas(list.length)}, starting at $${from(list)}. ${category.blurb} Every idea links to the shop, with typical prices. Save it for later.`,
    link: `${listUrl(group, category)}${max ? `?max=${max}` : ''}`,
    board: category.title,
    kicker: `${ideas(list.length)} · from $${from(list)}`,
    lines: names,
    footer: list.length > names.length ? `+ ${list.length - names.length} more at ${SITE.domain}` : SITE.domain,
  };
}

function giftPin(g: Gift): Pin {
  const lists = listsOf(g);
  const home = lists[0]?.href ?? '/lists/';
  return {
    name: giftPinName(g),
    title: g.name,
    description: `${g.name}: ${g.why} Typically ${priceLabel(g).replace('About ', 'about ')}. Gift idea ${lists.map((l) => l.name.toLowerCase()).slice(0, 3).join(', ')}.`,
    link: `${home}#${g.slug}`,
    board: findCategory(g.tags[0])?.category.title ?? 'Gift ideas', // the board of the gift's first list
    kicker: `Gift idea · ${priceLabel(g)}`,
    lines: [g.why],
    footer: lists.length ? `On our lists: ${lists.slice(0, 3).map((l) => l.name).join(' · ')}` : SITE.domain,
  };
}

export function allPins(): Pin[] {
  const pins: Pin[] = [];
  for (const group of groups) {
    for (const category of group.categories) {
      const list = giftsFor(category);
      pins.push(listPin(group, category, list));
      if (group.slug === 'budget') continue;
      for (const b of budgets) {
        if (!b.max) continue;
        const under = list.filter((g) => inBudget(g, b));
        if (under.length >= MIN_ON_BUDGET_PIN && under.length < list.length) pins.push(listPin(group, category, under, b.max));
      }
    }
  }
  const seen = new Set<string>();
  for (const group of groups) for (const c of group.categories) for (const g of giftsFor(c)) {
    if (!seen.has(g.slug)) { seen.add(g.slug); pins.push(giftPin(g)); }
  }
  return pins;
}

// ---------- drawing ----------

const C = { ink: '#1f2a2e', soft: '#4a575c', paper: '#fbf8f3', card: '#ffffff', line: '#e4ddd2', brand: '#1d5c63', brandDark: '#12434a', accent: '#c9682c' };
const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// Greedy word wrap by an average glyph width; good enough for the two fonts used here.
export function wrap(text: string, size: number, width: number, em = 0.5): string[] {
  const max = Math.max(4, Math.floor(width / (size * em)));
  const out: string[] = [];
  let line = '';
  for (const word of text.split(/\s+/)) {
    if (line && (line + ' ' + word).length > max) { out.push(line); line = word; } else line = line ? `${line} ${word}` : word;
  }
  if (line) out.push(line);
  return out;
}

export function pinSvg(pin: Pin): string {
  const x = 80;
  const w = PIN_W - 2 * x;
  const parts: string[] = [];
  parts.push(`<rect width="${PIN_W}" height="${PIN_H}" fill="${C.paper}"/>`);
  // Brand bar
  parts.push(`<rect width="${PIN_W}" height="150" fill="${C.brand}"/>`);
  parts.push(`<text x="${x}" y="100" font-family="DM Serif Display" font-size="64" fill="${C.paper}"><tspan fill="#f2a46f">4</tspan>Gift</text>`);
  parts.push(`<text x="${PIN_W - x}" y="96" text-anchor="end" font-family="Hind" font-weight="600" font-size="30" fill="${C.paper}" opacity=".85">${esc(SITE.domain)}</text>`);

  // Kicker, title and a card with the gift names (list pins) or the pitch (gift pins), centred in the space
  // between the brand bar and the call to action.
  let size = pin.title.length > 40 ? 92 : 112;
  let title = wrap(pin.title, size, w, 0.5);
  if (title.length > 4) { size = 76; title = wrap(pin.title, size, w, 0.5); }
  const isList = !pin.name.startsWith('gift-');
  const bodySize = isList ? 52 : 60;
  const lead = bodySize * 1.5;
  // SVG collapses leading spaces, so a wrapped bullet's later lines are indented with dx instead.
  const rows = isList
    ? pin.lines.flatMap((l) => wrap(`• ${l}`, bodySize, w - 120, 0.45).map((text, i) => ({ text, dx: i ? 36 : 0 })))
    : wrap(pin.lines[0], bodySize, w - 80, 0.45).map((text) => ({ text, dx: 0 }));
  const top = 150;
  const bottom = PIN_H - 230;
  const cardH = Math.min(bottom - top - 200, rows.length * lead + 70);
  const blockH = 40 + title.length * size * 1.08 + 50 + cardH;
  let y = top + Math.max(60, (bottom - top - blockH) / 2) + 32;
  parts.push(`<text x="${x}" y="${y}" font-family="Hind" font-weight="600" font-size="34" letter-spacing="3" fill="${C.accent}">${esc(pin.kicker.toUpperCase())}</text>`);
  y += 10;
  for (const t of title) { y += size * 1.08; parts.push(`<text x="${x}" y="${y}" font-family="DM Serif Display" font-size="${size}" fill="${C.ink}">${esc(t)}</text>`); }
  y += 50;
  parts.push(`<rect x="${x}" y="${y}" width="${w}" height="${cardH}" rx="24" fill="${C.card}" stroke="${C.line}" stroke-width="3"/>`);
  let ry = y + 30;
  for (const r of rows) {
    ry += lead;
    if (ry > y + cardH - 10) break;
    parts.push(`<text x="${x + 40 + r.dx}" y="${ry - 16}" font-family="Hind" font-size="${bodySize}" fill="${isList ? C.ink : C.soft}">${esc(r.text)}</text>`);
  }

  // Call to action
  const cta = isList ? 'See the full list' : 'See it on our gift lists';
  parts.push(`<rect x="${x}" y="${PIN_H - 210}" width="${w}" height="110" rx="20" fill="${C.accent}"/>`);
  parts.push(`<text x="${PIN_W / 2}" y="${PIN_H - 140}" text-anchor="middle" font-family="Hind" font-weight="600" font-size="46" fill="#fff">${esc(cta)}</text>`);
  const foot = wrap(pin.footer, 28, w, 0.5)[0];
  parts.push(`<text x="${PIN_W / 2}" y="${PIN_H - 40}" text-anchor="middle" font-family="Hind" font-size="28" fill="${C.soft}">${esc(foot)}</text>`);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${PIN_W}" height="${PIN_H}" viewBox="0 0 ${PIN_W} ${PIN_H}">${parts.join('')}</svg>`;
}

// Pinterest's bulk-create CSV (Create → Bulk create Pins; the boards must exist first). Pins are split into weekly
// batches, list pins first: upload one file a week, since Pinterest favours a steady flow of fresh pins over a burst.
export const PINS_PER_WEEK = 35;

export function pinBatches(pins: Pin[]): Pin[][] {
  const out: Pin[][] = [];
  for (let i = 0; i < pins.length; i += PINS_PER_WEEK) out.push(pins.slice(i, i + PINS_PER_WEEK));
  return out;
}

export function pinsCsv(pins: Pin[], site: URL): string {
  const cell = (v: string) => `"${v.replace(/"/g, '""')}"`;
  const rows = [['Title', 'Media URL', 'Pinterest board', 'Thumbnail', 'Description', 'Link', 'Publish date', 'Keywords']];
  for (const p of pins) {
    rows.push([p.title.slice(0, 100), new URL(pinPath(p.name), site).toString(), p.board, '', p.description.slice(0, 500), new URL(p.link, site).toString(), '', '']);
  }
  return rows.map((r) => r.map(cell).join(',')).join('\n') + '\n';
}
