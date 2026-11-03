import { SITE } from '../site';
import { wrap } from './pins';

// Link-preview cards (Open Graph and X): one 1200x630 image per page, made at build time like the pins. Facebook,
// iMessage, Slack and X crop a tall pin badly, so they get this card; Pinterest still gets the page's pin.
// Left: the store name, a kicker, the page title and a call to action. Right: the brand tile (a page photo can
// take its place later).

export const SHARE_W = 1200;
export const SHARE_H = 630;

export interface ShareCard {
  path: string; // the page the card describes, e.g. /occasion/christmas/
  kicker: string;
  title: string;
  cta: string;
}

/** The card's file name under /share/, from its page path: / is home, /occasion/christmas/ is occasion-christmas. */
export const shareName = (path: string) => path.replace(/^\/+|\/+$/g, '').replace(/[^a-z0-9]+/gi, '-').toLowerCase() || 'home';
export const sharePath = (path: string) => `/share/${shareName(path)}.png`;

const C = { ink: '#1f2a2e', soft: '#4a575c', paper: '#fbf8f3', brand: '#8f2954', buy: '#1f6f78', bow: '#c9682c', bowDark: '#a9531f' };
const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// The 4Gifts mark (the same paths as the site header's logo), drawn in an 800-unit box.
const MARK = `<path d="M440 160 H550 V440 H620 V540 H550 V650 H440 V540 H170 V445 Z M440 305 L295 440 H440 Z" fill="${C.paper}" fill-rule="evenodd" stroke="${C.paper}" stroke-width="18" stroke-linejoin="round" transform="translate(60 73) scale(0.86)"/><g transform="translate(490 202) scale(0.82)"><path d="M-8 10 L-40 78 L-18 70 L-6 92 L8 18 Z M8 10 L40 78 L18 70 L6 92 L-8 18 Z" fill="${C.bow}"/><path d="M-6 0 C-30 -52 -92 -62 -88 -18 C-85 18 -36 14 -6 0 Z" fill="${C.bow}"/><path d="M6 0 C30 -52 92 -62 88 -18 C85 18 36 14 6 0 Z" fill="${C.bow}"/><ellipse cx="0" cy="0" rx="20" ry="22" fill="${C.bowDark}"/></g>`;

/** Title lines and size: as large as fits in three lines of the text column. */
export function shareTitle(title: string, width = 600): { size: number; lines: string[] } {
  for (const size of [76, 60, 52]) {
    const lines = wrap(title, size, width, 0.44);
    if (lines.length <= (size === 76 ? 2 : 3)) return { size, lines };
  }
  return { size: 46, lines: wrap(title, 46, width, 0.44).slice(0, 4) };
}

export function shareSvg(card: ShareCard): string {
  const x = 72;
  const panel = 430;
  const p: string[] = [];
  p.push(`<rect width="${SHARE_W}" height="${SHARE_H}" fill="${C.paper}"/>`);
  p.push(`<rect x="${SHARE_W - panel}" width="${panel}" height="${SHARE_H}" fill="${C.brand}"/>`);
  p.push(`<g transform="translate(${SHARE_W - panel} ${(SHARE_H - panel) / 2}) scale(${panel / 800})">${MARK}</g>`);
  p.push(`<rect y="${SHARE_H - 14}" width="${SHARE_W - panel}" height="14" fill="${C.brand}"/>`);
  p.push(`<text x="${x}" y="104" font-family="DM Serif Display" font-size="40" fill="${C.brand}">${esc(SITE.name)}</text>`);
  let y = 210;
  p.push(`<text x="${x}" y="${y}" font-family="Hind" font-weight="600" font-size="24" letter-spacing="3" fill="${C.brand}">${esc(card.kicker.toUpperCase())}</text>`);
  y += 12;
  const t = shareTitle(card.title);
  for (const line of t.lines) {
    y += t.size * 1.08;
    p.push(`<text x="${x}" y="${y}" font-family="DM Serif Display" font-size="${t.size}" fill="${C.ink}">${esc(line)}</text>`);
  }
  const ctaW = Math.round(card.cta.length * 14 + 72);
  p.push(`<rect x="${x}" y="${SHARE_H - 132}" rx="12" width="${ctaW}" height="62" fill="${C.buy}"/>`);
  p.push(`<text x="${x + ctaW / 2}" y="${SHARE_H - 91}" text-anchor="middle" font-family="Hind" font-weight="600" font-size="26" fill="#fff">${esc(card.cta)}</text>`);
  p.push(`<text x="${x + ctaW + 28}" y="${SHARE_H - 91}" font-family="Hind" font-size="24" fill="${C.soft}">${esc(SITE.domain)}</text>`);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${SHARE_W}" height="${SHARE_H}" viewBox="0 0 ${SHARE_W} ${SHARE_H}">${p.join('')}</svg>`;
}
