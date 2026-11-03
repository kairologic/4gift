// Gift-type art: one original flat drawing per gift idea, in the 4Gifts palette, served as an SVG at
// /gift-art/<slug>.svg and shown at the top of each gift card. Every drawing sits on a 320x200 tile with a soft
// floor shadow; objects rest on y≈172. A new gift needs a drawing here (test/gift-art.test.ts checks every slug).
// Drawn for 4Gifts, no third-party art, so there is no license to track.

export const ART_W = 320;
export const ART_H = 200;

const K = '#3a2230'; // outline ink
const B = '#8f2954'; // berry (brand)
const T = '#1f6f78'; // deep teal (buy button)
const G = '#e8eef2'; // cool blue gray
const P = '#f4dce6'; // berry tint
const Y = '#e9b44c'; // gold accent
const W = '#ffffff';
const BR = '#7a4a2e'; // coffee, wood, soil
const TAN = '#c99269'; // light wood, plush
const DK = '#2e2a2c'; // cast iron, screens

const o = `stroke="${K}" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"`;
const rect = (x: number, y: number, w: number, h: number, rx: number, fill: string) =>
  `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="${fill}" ${o}/>`;
const circ = (cx: number, cy: number, r: number, fill: string) => `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${fill}" ${o}/>`;
const ell = (cx: number, cy: number, rx: number, ry: number, fill: string) =>
  `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${fill}" ${o}/>`;
const path = (d: string, fill: string) => `<path d="${d}" fill="${fill}" ${o}/>`;
const line = (d: string, color = K, width = 3) =>
  `<path d="${d}" fill="none" stroke="${color}" stroke-width="${width}" stroke-linecap="round" stroke-linejoin="round"/>`;
const dot = (cx: number, cy: number, r: number, fill: string) => `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${fill}"/>`;
const leaf = (x: number, y: number, a: number, fill = T) =>
  `<path d="M0 0c-8-10-6-24 0-30c6 6 8 20 0 30z" fill="${fill}" ${o} transform="translate(${x} ${y}) rotate(${a})"/>`;
const steam = (x: number, y: number, color = B) => line(`M${x} ${y}c-6 8 6 10 0 18`, color);
const heart = (x: number, y: number, s: number, fill: string) =>
  `<path d="M0 6c-4-8-16-6-14 4c1 6 8 10 14 16c6-6 13-10 14-16c2-10-10-12-14-4z" fill="${fill}" transform="translate(${x} ${y}) scale(${s})"/>`;
const sparkle = (x: number, y: number, color = Y) => line(`M${x} ${y - 7}v14M${x - 7} ${y}h14`, color);

// One drawing per gift slug (the slugs in src/data/gifts.ts).
const art: Record<string, string> = {
  'weighted-blanket':
    rect(92, 118, 136, 50, 14, T) + line('M100 143h120', W, 2) + line('M126 122v42M160 122v42M194 122v42', W, 2) +
    rect(104, 78, 112, 44, 14, B) + line('M138 82v36M172 82v36', W, 2) + line('M112 100h96', W, 2),
  'cast-iron-skillet':
    rect(196, 104, 74, 16, 8, DK) + circ(146, 114, 52, DK) + `<circle cx="146" cy="114" r="40" fill="#4a4447"/>` +
    path('M126 106c4-22 40-24 44 0c4 20-12 30-24 28c-14-2-24-12-20-28z', W) + circ(146, 112, 10, Y),
  'pour-over-coffee-set':
    path('M112 60h96l-30 44h-36z', T) + path('M128 108h64l8 56a10 10 0 0 1-10 10h-60a10 10 0 0 1-10-10z', W) +
    `<path d="M134 148h52l3 20h-58z" fill="${BR}"/>` + line('M200 122c18 0 18 30 0 30') + steam(146, 36) + steam(174, 36),
  'instant-camera':
    rect(98, 58, 124, 108, 16, W) + rect(98, 58, 124, 34, 16, T) + circ(160, 114, 30, G) + dot(160, 114, 16, K) +
    dot(154, 108, 4, W) + `<rect x="196" y="66" width="16" height="12" rx="3" fill="${Y}"/>` +
    `<rect x="128" y="152" width="64" height="8" rx="3" fill="${B}"/>`,
  'e-reader':
    rect(114, 34, 92, 138, 14, DK) + rect(124, 46, 72, 104, 4, G) +
    line('M134 62h52M134 74h52M134 86h40M134 104h52M134 116h52M134 128h30', '#9aa7ae', 4) + dot(160, 160, 4, '#6b6467'),
  'book-light':
    path('M90 150c24-10 50-10 70 0c20-10 46-10 70 0v-60c-24-10-50-10-70 0c-20-10-46-10-70 0z', W) + line('M160 90v60') +
    line('M102 104c14-4 30-4 44 0M102 120c14-4 30-4 44 0M174 104c14-4 30-4 44 0M174 120c14-4 30-4 44 0', '#9aa7ae', 3) +
    `<path d="M196 54l-46 44h44z" fill="${Y}" opacity=".35"/>` + line('M224 96c0-30-6-44-22-48', K) +
    path('M186 40h28l-6 16h-16z', B) + rect(214, 92, 22, 12, 4, B),
  'herb-garden-kit':
    leaf(112, 120, -20) + leaf(122, 120, 15) + leaf(158, 116, -10) + leaf(164, 118, 25) + leaf(204, 120, -25) +
    leaf(212, 120, 10) + path('M96 122h40l-6 48h-28z', B) + path('M140 122h40l-6 48h-28z', '#b05a3c') +
    path('M184 122h40l-6 48h-28z', B) + line('M96 132h40M140 132h40M184 132h40', W, 2),
  'smart-garden':
    line('M104 132v-86h112v86', K, 4) + rect(100, 40, 120, 12, 6, W) + `<path d="M108 52h104l-14 70h-76z" fill="${Y}" opacity=".25"/>` +
    leaf(130, 132, -15) + leaf(138, 132, 20) + leaf(160, 130, 0) + leaf(184, 132, -20) + leaf(190, 132, 15) +
    rect(92, 130, 136, 40, 14, W) + dot(210, 150, 4, T),
  'gardening-tool-set':
    line('M128 108l-14-58', K, 5) + path('M104 46c0-12 20-12 20 0l-4 16h-12z', '#9aa7ae') +
    line('M186 108l14-54', K, 5) + line('M190 52l2-18M198 54l4-18M206 56l6-16', '#9aa7ae', 4) +
    path('M96 104h128l-10 66h-108z', T) + line('M128 104c0-26 64-26 64 0', K, 4) + rect(140, 124, 40, 22, 4, P),
  'garden-kneeler':
    line('M108 112v58M212 112v58', T, 8) + line('M108 112c0-36 0-52 0-52M212 112c0-36 0-52 0-52', T, 6) +
    rect(96, 104, 128, 26, 10, B) + rect(110, 54, 12, 12, 4, T) + rect(198, 54, 12, 12, 4, T) +
    `<rect x="92" y="164" width="36" height="8" rx="4" fill="${T}"/><rect x="192" y="164" width="36" height="8" rx="4" fill="${T}"/>`,
  'personalized-cutting-board':
    path('M90 70h120a20 20 0 0 1 20 20v60a20 20 0 0 1-20 20h-120a20 20 0 0 1-20-20v-60a20 20 0 0 1 20-20z', TAN) +
    path('M230 106h22a14 14 0 0 1 0 28h-22', TAN) + circ(244, 120, 5, P) + line('M90 160h100', BR, 2) +
    heart(150, 96, 1.4, B) + line('M118 140h64', BR, 3),
  'star-map':
    rect(104, 34, 112, 138, 6, W) + rect(114, 44, 92, 118, 2, '#1e2a44') + circ(160, 94, 36, '#1e2a44') +
    [[148, 80], [170, 74], [178, 98], [156, 108], [142, 96], [166, 116], [184, 84]].map(([x, y]) => dot(x, y, 2.5, Y)).join('') +
    line('M148 80l22-6l8 24l-22 10l-14-12', Y, 1.5) + line('M134 146h52', W, 3),
  'photo-book':
    path('M96 60h120a8 8 0 0 1 8 8v96a8 8 0 0 1-8 8h-120z', B) + rect(88, 56, 16, 116, 6, '#6f1f41') +
    rect(124, 76, 80, 60, 4, W) + `<path d="M128 132l22-28l16 18l10-12l24 22z" fill="${T}"/>` + dot(186, 90, 7, Y) +
    line('M140 152h48', W, 3),
  'digital-photo-frame':
    rect(86, 46, 148, 108, 10, DK) + rect(98, 58, 124, 84, 3, '#bfe3e6') + `<path d="M98 142l36-40l26 28l18-18l44 30z" fill="${T}"/>` +
    dot(196, 80, 10, Y) + line('M160 154l-16 18M160 154l16 18', K, 4),
  'mini-massage-gun':
    rect(96, 66, 112, 36, 18, T) + rect(140, 98, 32, 70, 10, DK) + rect(208, 74, 18, 20, 4, '#9aa7ae') +
    circ(240, 84, 16, B) + dot(118, 84, 5, Y) + line('M150 120h12M150 132h12', '#6b6467', 3),
  'insulated-water-bottle':
    rect(136, 34, 48, 22, 8, DK) + rect(124, 54, 72, 118, 22, T) + `<rect x="124" y="98" width="72" height="22" fill="${W}" opacity=".9"/>` +
    line('M140 70v20', W, 4) + line('M184 40c14 0 14 18 0 18', K, 3),
  'yoga-mat':
    path('M96 106h112v64h-112z', B) + ell(96, 138, 14, 32, '#b44d78') + circ(208, 138, 32, B) + circ(208, 138, 20, '#6f1f41') +
    circ(208, 138, 9, B) + rect(128, 102, 12, 72, 4, T) + rect(164, 102, 12, 72, 4, T),
  'fitness-tracker':
    path('M136 40h48v40h-48zM136 140h48v34h-48z', T) + rect(126, 74, 68, 72, 16, DK) + rect(134, 82, 52, 56, 10, '#1e2a44') +
    heart(160, 100, 0.9, B) + line('M142 126h6l4-6l6 12l4-6h12', Y, 2.5),
  smartwatch:
    path('M136 34h48v42h-48zM136 134h48v40h-48z', B) + rect(120, 66, 80, 78, 20, DK) + rect(128, 74, 64, 62, 14, '#1e2a44') +
    line('M160 105v-18M160 105l12 8', W, 4) + dot(160, 105, 4, Y) + rect(200, 92, 8, 18, 3, '#6b6467'),
  'noise-cancelling-headphones':
    line('M104 126c0-80 112-80 112 0', K, 14) + line('M104 126c0-80 112-80 112 0', B, 8) +
    rect(88, 110, 34, 58, 14, DK) + rect(198, 110, 34, 58, 14, DK) + rect(112, 116, 16, 46, 8, B) + rect(192, 116, 16, 46, 8, B),
  'wireless-earbuds':
    path('M104 112h112v40a20 20 0 0 1-20 20h-72a20 20 0 0 1-20-20z', W) + path('M104 112a56 34 0 0 1 112 0z', G) +
    dot(160, 158, 4, T) + rect(126, 66, 22, 36, 11, W) + rect(172, 66, 22, 36, 11, W) + circ(137, 70, 12, W) + circ(183, 70, 12, W) +
    dot(137, 70, 5, T) + dot(183, 70, 5, T),
  'power-bank':
    rect(110, 62, 92, 110, 14, DK) + rect(124, 80, 64, 14, 4, Y) + rect(124, 100, 64, 14, 4, Y) + rect(124, 120, 64, 14, 4, Y) +
    `<rect x="124" y="140" width="64" height="14" rx="4" fill="#4a4447"/>` + rect(142, 52, 28, 12, 4, '#6b6467') +
    line('M156 52c0-24 70-24 70 20v60', T, 5) + rect(218, 130, 16, 24, 4, W),
  'packing-cubes':
    rect(88, 128, 144, 44, 10, T) + line('M100 138h120', Y, 3) + rect(96, 88, 128, 42, 10, B) + line('M108 98h104', Y, 3) +
    rect(106, 50, 108, 40, 10, '#5d8fb0') + line('M118 60h84', Y, 3) + dot(214, 98, 4, W) + dot(222, 138, 4, W),
  'travel-pillow':
    path('M100 110c0-50 120-50 120 0c0 34-18 56-36 56c-12 0-18-10-18-22c0-14 10-20 10-34c0-14-28-14-28 0c0 14 10 20 10 34c0 12-6 22-18 22c-18 0-40-22-40-56z', T) +
    line('M120 110c0-26 80-26 80 0', '#2a8a95', 3) + line('M146 70l4 8M174 70l-4 8', W, 3),
  'scratch-map':
    rect(70, 46, 180, 110, 6, Y) + rect(80, 56, 160, 90, 2, '#d79c35') +
    `<path d="M98 80c10-10 30-8 34 4c-2 14-18 12-20 24c-10 6-18-6-14-28z M150 74c16-8 40-6 52 6c6 10-6 14-16 12c-8 10-20 14-30 6c-6-10 0-16-6-24z M178 112c10-4 20 2 22 12c-6 8-16 6-22-12z" fill="${T}"/>` +
    rect(200, 128, 34, 34, 17, '#9aa7ae') + line('M206 145h22', K, 2),
  'item-tracker':
    circ(150, 120, 42, W) + circ(150, 120, 22, G) + dot(150, 120, 6, T) + line('M182 92c10-6 16-14 18-26', K, 3) +
    circ(206, 56, 14, 'none') + rect(208, 62, 28, 10, 4, Y) + line('M98 78c-10 10-12 26-6 40M86 70c-16 16-18 40-8 58', B, 3),
  'camping-hammock':
    rect(76, 70, 10, 102, 3, BR) + rect(234, 70, 10, 102, 3, BR) + path('M60 98l21-60l21 60z', T) + path('M218 98l21-60l21 60z', T) +
    line('M86 102l20 20M234 102l-20 20', K, 2) + path('M104 120c30 40 82 40 112 0c-30 18-82 18-112 0z', B) + line('M110 128c30 20 70 20 100 0', Y, 2),
  'party-board-game':
    rect(84, 96, 120, 74, 8, B) + rect(84, 96, 120, 18, 8, '#6f1f41') + rect(100, 126, 88, 30, 4, Y) +
    `<g transform="rotate(-12 214 108)">${rect(196, 62, 46, 64, 6, W)}${heart(219, 82, 0.9, B)}</g>` +
    rect(208, 134, 30, 30, 6, W) + dot(216, 142, 3, K) + dot(230, 156, 3, K) + dot(223, 149, 3, K),
  'strategy-board-game':
    path('M80 150l40-50h120l-40 50z', TAN) + line('M110 112h120M100 125h120M90 138h120M150 100l-30 50M190 100l-30 50', BR, 2) +
    path('M136 110c0-10 14-10 14 0l4 20h-22z', B) + circ(143, 104, 7, B) + path('M178 104l12 0l4 26h-20z', T) + circ(184, 98, 7, T) +
    rect(84, 150, 112, 18, 4, '#a9744f'),
  'game-controller':
    path('M100 92c6-20 26-24 40-18h40c14-6 34-2 40 18l14 50c4 16-14 26-26 14l-18-18h-60l-18 18c-12 12-30 2-26-14z', B) +
    line('M128 100v24M116 112h24', W, 6) + dot(194, 104, 6, Y) + dot(208, 118, 6, G),
  'gaming-headset':
    line('M104 120c0-76 112-76 112 0', K, 14) + line('M104 120c0-76 112-76 112 0', T, 8) + rect(86, 104, 36, 58, 16, DK) +
    rect(198, 104, 36, 58, 16, DK) + `<rect x="94" y="114" width="20" height="38" rx="8" fill="${Y}" opacity=".8"/>` +
    line('M104 158c0 14 20 18 40 14', K, 5) + dot(148, 171, 6, Y),
  'led-light-strip':
    line('M70 130c30-60 60 40 90-10s60-50 90 10', K, 14) + line('M70 130c30-60 60 40 90-10s60-50 90 10', W, 8) +
    [[78, 116, B], [98, 100, T], [118, 112, Y], [140, 128, B], [160, 120, T], [180, 100, Y], [204, 94, B], [226, 106, T], [244, 124, Y]]
      .map(([x, y, c]) => `<circle cx="${x}" cy="${y}" r="12" fill="${c}" opacity=".25"/>${dot(x as number, y as number, 4, c as string)}`)
      .join(''),
  'mini-projector':
    `<path d="M136 112l110-60v110z" fill="${Y}" opacity=".3"/>` + rect(70, 96, 84, 66, 14, W) + circ(130, 129, 18, DK) +
    dot(126, 125, 5, '#6b6467') + dot(88, 112, 4, T) + dot(100, 112, 4, B) + rect(244, 40, 10, 134, 3, G),
};

/** The drawing for one gift, or undefined when it has none. */
export function giftArtSvg(slug: string, index: number): string | undefined {
  const inner = art[slug] ?? artMore[slug];
  if (!inner) return undefined;
  const bg = index % 2 ? G : P;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${ART_W} ${ART_H}" width="${ART_W}" height="${ART_H}"><rect width="${ART_W}" height="${ART_H}" fill="${bg}"/><ellipse cx="160" cy="174" rx="96" ry="9" fill="${K}" opacity=".08"/>${inner}</svg>`;
}

export const giftArtPath = (slug: string) => `/gift-art/${slug}.svg`;
export const giftArtSlugs = () => [...Object.keys(art), ...Object.keys(artMore)];

const artMore: Record<string, string> = {
  'building-set':
    rect(92, 132, 72, 38, 4, B) + rect(164, 132, 64, 38, 4, T) + rect(118, 94, 84, 38, 4, Y) + rect(140, 56, 44, 38, 4, B) +
    [[106, 132], [126, 132], [146, 132], [178, 132], [198, 132], [216, 132], [132, 94], [152, 94], [172, 94], [190, 94], [152, 56], [172, 56]]
      .map(([x, y]) => rect(x - 6, y - 7, 12, 7, 2, W)).join(''),
  'art-kit':
    path('M90 120c0-40 50-62 92-50c36 10 50 40 34 62c-10 14-30 6-38 18c-6 10 4 22-14 24c-40 4-74-18-74-54z', TAN) +
    circ(124, 104, 10, B) + circ(152, 88, 10, T) + circ(184, 94, 10, Y) + circ(118, 136, 10, '#5d8fb0') + circ(196, 124, 8, P) +
    line('M226 44l-60 74', BR, 7) + path('M166 118l-10 18l18-10z', B),
  'stem-kit':
    path('M140 40h40M146 40v42l-34 70a12 12 0 0 0 10 18h76a12 12 0 0 0 10-18l-34-70v-42', W) +
    path('M126 128h68l14 28a10 10 0 0 1-9 14h-78a10 10 0 0 1-9-14z', T) + dot(146, 146, 5, W) + dot(170, 152, 4, W) + dot(160, 112, 4, T) +
    dot(168, 98, 3, T) + line('M232 80c-24-30-40 30-64 0', B, 2) + ell(232, 70, 22, 8, 'none') + dot(232, 70, 5, Y),
  'kids-camera':
    path('M112 72l10-22l14 22zM184 72l14-22l10 22z', Y) + rect(100, 68, 120, 96, 26, Y) + circ(160, 118, 30, W) + circ(160, 118, 18, T) +
    dot(154, 112, 5, W) + dot(124, 88, 5, K) + rect(188, 82, 20, 12, 4, W) + path('M152 150c4 6 12 6 16 0', 'none'),
  'giant-plush':
    circ(124, 62, 18, '#b9825a') + circ(196, 62, 18, '#b9825a') + circ(160, 96, 46, TAN) + `<ellipse cx="160" cy="112" rx="20" ry="15" fill="#f2dcc6"/>` +
    dot(160, 105, 5, K) + dot(142, 88, 4, K) + dot(178, 88, 4, K) + path('M128 136h64l8 36h-80z', TAN) + path('M140 136l20 12l20-12l-4 14l-16-4l-16 4z', B),
  'spa-gift-set':
    rect(100, 54, 28, 70, 8, W) + rect(106, 42, 16, 14, 3, T) + rect(136, 66, 30, 58, 8, P) + rect(144, 54, 14, 14, 3, B) +
    path('M176 92h50a12 12 0 0 1 0 24h-50z', W) + ell(176, 104, 10, 12, G) + path('M88 116h144l-10 54h-124z', TAN) +
    line('M98 132h124M100 150h120', BR, 2),
  'silk-pillowcase':
    path('M88 86c0-20 8-28 28-28h88c20 0 28 8 28 28v52c0 20-8 28-28 28h-88c-20 0-28-8-28-28z', P) +
    line('M110 84c30 10 70-10 100 4M108 112c40 10 70-12 104 2M110 140c30 8 70-10 100 2', W, 4) + line('M100 160c-6 8-12 10-16 10', K, 3),
  'soy-candle':
    rect(118, 78, 84, 94, 12, W) + `<rect x="118" y="110" width="84" height="34" fill="${B}"/>` + line('M160 78v-12') +
    path('M160 30c12 14 12 24 0 32c-12-8-12-18 0-32z', Y) + dot(160, 127, 7, W),
  'oil-diffuser':
    path('M160 70c40 0 60 36 54 70c-4 22-30 32-54 32s-50-10-54-32c-6-34 14-70 54-70z', W) + line('M110 140c30 8 70 8 100 0', T, 3) +
    rect(150, 62, 20, 12, 4, '#9aa7ae') + line('M156 54c-14-10 4-18-8-30M168 52c12-12-6-18 8-32', '#9aa7ae', 3) + dot(160, 152, 4, T),
  'plush-robe':
    line('M140 40c0-12 40-12 40 0', K, 4) + path('M110 62l38-14h24l38 14l22 50l-24 10l-12-24v74h-92v-74l-12 24l-24-10z', P) +
    path('M148 48l12 40l12-40', 'none') + line('M160 88v84', K, 2) + rect(124, 116, 72, 10, 4, B) + line('M160 126l-10 22M160 126l10 22', B, 4),
  'cozy-slippers':
    path('M86 158c-6-30 6-58 34-60c26-2 40 20 34 50c-2 14-14 22-34 22c-18 0-32-4-34-12z', B) + path('M96 128c10-16 40-16 50 0v10h-50z', W) +
    path('M168 158c-6-30 6-58 34-60c26-2 40 20 34 50c-2 14-14 22-34 22c-18 0-32-4-34-12z', T) + path('M178 128c10-16 40-16 50 0v10h-50z', W),
  'heated-throw':
    rect(92, 104, 128, 66, 14, B) + line('M92 126h128M92 148h128', '#b44d78', 3) + rect(104, 78, 104, 30, 12, '#b44d78') +
    line('M220 140c26 0 30 24 14 24', K, 3) + rect(226, 158, 22, 14, 3, DK) +
    line('M120 64c-6-8 6-12 0-20M156 62c-6-8 6-12 0-20M192 64c-6-8 6-12 0-20', Y, 3),
  'wine-glass-set':
    path('M98 70h52l-4 88a10 10 0 0 1-10 10h-24a10 10 0 0 1-10-10z', W) + `<path d="M100 112h48l-2 44a8 8 0 0 1-8 8h-28a8 8 0 0 1-8-8z" fill="${B}"/>` +
    path('M170 70h52l-4 88a10 10 0 0 1-10 10h-24a10 10 0 0 1-10-10z', W) + `<path d="M172 112h48l-2 44a8 8 0 0 1-8 8h-28a8 8 0 0 1-8-8z" fill="${B}"/>` +
    line('M108 82v20M180 82v20', G, 4),
  'electric-wine-opener':
    rect(170, 40, 34, 132, 14, DK) + rect(178, 54, 18, 6, 3, Y) + `<rect x="170" y="150" width="34" height="8" fill="${Y}"/>` +
    path('M112 60h20v24c14 8 18 18 18 34v46a8 8 0 0 1-8 8h-40a8 8 0 0 1-8-8v-46c0-16 4-26 18-34z', B) + rect(106, 116, 40, 30, 3, W),
  'whiskey-glass-set':
    path('M98 84h76l-8 80a8 8 0 0 1-8 8h-44a8 8 0 0 1-8-8z', W) + `<path d="M103 128h66l-4 34a6 6 0 0 1-6 6h-46a6 6 0 0 1-6-6z" fill="${Y}" opacity=".9"/>` +
    rect(118, 116, 20, 20, 3, '#9aa7ae') + rect(140, 124, 20, 20, 3, '#9aa7ae') + rect(196, 140, 24, 24, 4, '#6b6467') +
    rect(214, 120, 24, 24, 4, '#9aa7ae') + rect(222, 146, 24, 24, 4, '#6b6467'),
  'grill-tool-set':
    line('M110 170l60-90', BR, 9) + rect(158, 40, 44, 42, 6, '#9aa7ae') + line('M168 52v20M180 52v20M192 52v20', DK, 3) +
    line('M210 170l-50-90', BR, 9) + line('M160 80l-22-40M160 80l-8-44', '#9aa7ae', 6),
  'meat-thermometer':
    path('M92 128c0-26 30-42 70-42s70 16 70 42c0 22-30 36-70 36s-70-14-70-36z', '#a8433b') +
    path('M108 128c0-16 24-28 54-28s54 12 54 28', 'none') + line('M108 132c20 6 30-4 50 2', '#f2b8a6', 4) +
    line('M184 120l40-70', '#9aa7ae', 6) + rect(214, 34, 26, 26, 8, DK) + dot(227, 47, 5, Y) + line('M250 30c6 6 6 16 0 22', T, 3),
  cookbook:
    rect(104, 40, 112, 132, 8, T) + rect(98, 40, 14, 132, 6, '#185a62') + rect(124, 60, 72, 50, 4, W) +
    line('M146 70v30M160 70v30M174 70v8c0 6-6 8-6 14v8', DK, 3) + line('M132 128h56M140 142h40', W, 3),
  'dutch-oven':
    path('M86 104h148v38c0 18-14 30-32 30h-84c-18 0-32-12-32-30z', T) + rect(72, 110, 22, 12, 6, T) + rect(226, 110, 22, 12, 6, T) +
    path('M80 104c0-20 36-34 80-34s80 14 80 34z', T) + rect(148, 54, 24, 16, 6, '#9aa7ae') + line('M100 140h120', '#2a8a95', 3),
  'air-fryer':
    rect(104, 38, 112, 134, 30, DK) + rect(118, 104, 84, 58, 12, '#4a4447') + rect(140, 124, 40, 12, 6, '#6b6467') +
    circ(160, 72, 18, '#1e2a44') + line('M160 72v-10', Y, 3) + dot(134, 58, 4, B) + dot(186, 58, 4, T),
  'espresso-machine':
    rect(96, 44, 128, 24, 8, '#9aa7ae') + rect(104, 66, 112, 90, 6, '#c9d2d7') + rect(96, 154, 128, 18, 6, '#9aa7ae') +
    rect(128, 82, 48, 16, 6, DK) + rect(176, 86, 34, 8, 4, DK) + path('M140 124h24v18a6 6 0 0 1-6 6h-12a6 6 0 0 1-6-6z', W) +
    line('M164 128c8 0 8 12 0 12', K, 2) + `<path d="M150 98v24" stroke="${BR}" stroke-width="3"/>` + dot(198, 120, 6, B),
  'milk-frother':
    path('M110 96h64v66a10 10 0 0 1-10 10h-44a10 10 0 0 1-10-10z', W) + line('M174 112c20 0 20 34 0 34', K, 3) +
    path('M110 96c4-14 60-14 64 0c-6 10-58 10-64 0z', '#f2e3cf') + line('M196 32l-40 98', '#9aa7ae', 4) + rect(188, 24, 30, 50, 12, B) +
    line('M152 126c-6-6 6-10 4-16', '#9aa7ae', 3),
  'coffee-sampler':
    path('M88 82h40l6 90h-52z', BR) + path('M140 70h40l6 102h-52z', TAN) + path('M192 82h40l6 90h-52z', B) +
    [[108, 124], [160, 120], [212, 124]].map(([x, y]) => ell(x, y, 9, 13, W) + line(`M${x} ${y - 10}c-4 6 4 14 0 20`, K, 2)).join('') +
    line('M90 94h36M142 82h36M194 94h36', W, 2),
  'mug-warmer':
    ell(160, 160, 62, 12, DK) + `<ellipse cx="160" cy="156" rx="48" ry="7" fill="${B}" opacity=".7"/>` +
    path('M126 80h68v62a10 10 0 0 1-10 10h-48a10 10 0 0 1-10-10z', T) + line('M194 96c22 0 22 36 0 36', K, 3) +
    steam(146, 50, Y) + steam(174, 50, Y),
  'tea-sampler':
    rect(84, 76, 44, 96, 6, T) + rect(84, 66, 44, 14, 4, DK) + rect(134, 92, 44, 80, 6, B) + rect(134, 82, 44, 14, 4, DK) +
    leaf(106, 132, 0, '#7cc0a0') + leaf(156, 140, 0, Y) + path('M192 120h46l-4 34a12 12 0 0 1-12 12h-14a12 12 0 0 1-12-12z', W) +
    line('M238 128c14 0 14 18 0 18', K, 3) + steam(214, 92, T),
  'smart-speaker':
    path('M120 70a40 14 0 0 1 80 0v86a40 14 0 0 1-80 0z', DK) + ell(160, 70, 40, 14, '#4a4447') +
    `<ellipse cx="160" cy="70" rx="30" ry="9" fill="none" stroke="${T}" stroke-width="5"/>` +
    line('M126 100v60M136 102v62M146 103v63M156 104v64M166 104v64M176 103v63M186 102v62M196 100v60', '#4a4447', 2),
  'pet-camera':
    rect(108, 50, 104, 122, 30, W) + circ(160, 88, 20, DK) + dot(155, 83, 5, '#6b6467') + rect(140, 128, 40, 22, 6, G) +
    path('M228 150a6 6 0 1 1 8-8h14a6 6 0 1 1 8 8a6 6 0 1 1-8 8h-14a6 6 0 1 1-8-8z', Y) + dot(186, 64, 4, T),
  'pet-portrait':
    rect(98, 36, 124, 136, 8, Y) + rect(110, 48, 100, 112, 2, P) + path('M126 78c-6-18 10-24 18-10M194 78c6-18-10-24-18-10', BR) +
    circ(160, 106, 34, TAN) + ell(160, 122, 16, 12, '#f2dcc6') + dot(160, 116, 5, K) + dot(146, 100, 4, K) + dot(174, 100, 4, K) +
    path('M160 122c0 8-8 10-10 6M160 122c0 8 8 10 10 6', 'none'),
  'calming-pet-bed':
    ell(160, 140, 84, 32, B) + ell(160, 132, 62, 20, '#b44d78') +
    path('M114 132c0-22 40-30 66-18c16 8 16 22 6 26c-20 8-60 8-72-8z', '#9aa7ae') + path('M180 108l6-12l6 14z', '#9aa7ae') +
    line('M174 120c4 2 8 2 12 0', K, 2) + line('M114 134c-8 6-6 14 8 14', '#9aa7ae', 5) + `<text x="210" y="88" font-family="sans-serif" font-size="18" font-weight="700" fill="${T}">z</text><text x="224" y="72" font-family="sans-serif" font-size="14" font-weight="700" fill="${T}">z</text>`,
  'paw-print-kit':
    ell(160, 116, 66, 56, W) + `<ellipse cx="160" cy="116" rx="54" ry="44" fill="${G}"/>` + ell(160, 128, 20, 16, B) +
    ell(134, 104, 8, 10, B) + ell(150, 92, 8, 10, B) + ell(170, 92, 8, 10, B) + ell(186, 104, 8, 10, B) + line('M160 60v-18', Y, 3) + circ(160, 36, 6, 'none'),
  'picnic-blanket':
    path('M64 150l40-50h112l40 50z', B) + `<path d="M92 115h136M80 130h160M120 100l-24 50M160 100v50M200 100l24 50" stroke="${W}" stroke-width="5" opacity=".8"/>` +
    rect(132, 60, 64, 48, 6, TAN) + line('M140 60c0-26 48-26 48 0', BR, 4) + line('M132 78h64', BR, 3),
  'date-night-cards':
    `<g transform="rotate(-14 140 120)">${rect(104, 58, 64, 92, 8, W)}${heart(136, 90, 1.2, B)}</g>` +
    `<g transform="rotate(10 190 120)">${rect(156, 54, 64, 92, 8, B)}${line('M172 82h32M172 96h32M172 110h20', W, 3)}</g>` +
    sparkle(232, 54) + sparkle(96, 52, B),
  'birthstone-necklace':
    line('M96 40c4 60 34 84 64 92M224 40c-4 60-34 84-64 92', Y, 3) + `<path d="M96 40c4 60 34 84 64 92M224 40c-4 60-34 84-64 92" fill="none" stroke="${BR}" stroke-width="1" stroke-dasharray="2 4"/>` +
    path('M160 130l18 12l-18 26l-18-26z', T) + path('M142 142h36', 'none') + line('M148 140l12 6l12-6', W, 2) + sparkle(196, 150),
  'watch-box':
    path('M80 108h160v54a10 10 0 0 1-10 10h-140a10 10 0 0 1-10-10z', BR) + path('M80 108l18-62h124l18 62z', '#5a3420') +
    rect(92, 116, 136, 40, 4, G) + circ(122, 136, 14, W) + circ(160, 136, 14, W) + circ(198, 136, 14, W) +
    line('M122 136v-6M160 136l5-3M198 136h-6', K, 2),
  'slim-wallet':
    rect(98, 70, 124, 92, 12, BR) + `<g transform="rotate(-8 170 60)">${rect(120, 40, 96, 60, 6, T)}${rect(132, 52, 20, 14, 3, Y)}</g>` +
    rect(98, 96, 124, 66, 12, BR) + line('M108 106h104', '#a9744f', 2) + `<path d="M108 152h104" stroke="#a9744f" stroke-width="2" stroke-dasharray="4 4"/>`,
  'desk-plant':
    leaf(160, 110, 0, '#4f8a5b') + leaf(156, 112, -40, '#4f8a5b') + leaf(164, 112, 40, '#4f8a5b') + leaf(152, 116, -75, '#6aa874') +
    leaf(168, 116, 75, '#6aa874') + path('M124 112h72l-10 60h-52z', W) + line('M128 128h64', B, 4),
  'desk-organizer':
    rect(88, 112, 144, 60, 8, TAN) + line('M136 112v60M184 112v60', BR, 3) + line('M104 112l-6-60M116 112l8-62', K, 5) +
    rect(96, 46, 6, 10, 2, B) + rect(121, 44, 6, 10, 2, T) + rect(146, 70, 30, 42, 3, W) + rect(150, 64, 30, 42, 3, Y) +
    line('M200 112v-30M214 112v-38', '#9aa7ae', 6),
  'snack-gift-box':
    rect(88, 98, 144, 74, 8, TAN) + path('M88 98l16-20h112l16 20z', '#e1b98f') + rect(108, 68, 30, 34, 4, B) +
    rect(146, 60, 30, 42, 4, T) + circ(196, 82, 16, Y) + `<rect x="152" y="98" width="16" height="74" fill="${B}"/>` +
    path('M160 120c-16-14-30-4-20 6zM160 120c16-14 30-4 20 6z', B),
  'chocolate-box':
    path('M84 96h152v62a12 12 0 0 1-12 12h-128a12 12 0 0 1-12-12z', B) + rect(98, 106, 124, 54, 6, '#6f1f41') +
    [[116, 120], [146, 120], [176, 120], [206, 120], [116, 146], [146, 146], [176, 146], [206, 146]]
      .map(([x, y], i) => (i % 3 ? circ(x, y, 10, BR) : rect(x - 10, y - 10, 20, 20, 4, '#5a3420'))).join('') +
    path('M90 96c20-40 120-40 140 0', 'none') + heart(160, 60, 1.2, Y),
  'leather-journal':
    rect(104, 38, 108, 134, 10, BR) + rect(196, 38, 8, 134, 2, '#5a3420') + rect(196, 94, 36, 16, 6, '#5a3420') +
    line('M124 66h52', '#c08a5e', 3) + line('M228 30l-10 120', B, 6) + path('M218 150l-2 12l8-10z', K),
  'reading-pillow':
    path('M96 92c0-30 128-30 128 0v70h-128z', T) + path('M76 110c0-14 24-14 24 0v62h-24zM220 110c0-14 24-14 24 0v62h-24z', '#2a8a95') +
    line('M118 90c20-10 64-10 84 0', W, 3) + rect(140, 128, 40, 30, 6, B),
  'jigsaw-puzzle':
    path('M96 64h44c-6-18 26-18 20 0h44v40c18-6 18 26 0 20v44h-44c6 18-26 18-20 0h-44z', T) +
    `<g transform="translate(214 120) rotate(18)">${path('M-22-22h16c-2-10 14-10 12 0h16v16c10-2 10 14 0 12v16h-44z', B)}</g>`,
  'raised-garden-bed':
    leaf(120, 112, -15, '#4f8a5b') + leaf(130, 112, 20, '#4f8a5b') + leaf(160, 112, 0, '#4f8a5b') + leaf(190, 112, -20, '#4f8a5b') +
    leaf(200, 112, 15, '#4f8a5b') + circ(124, 98, 7, '#d64545') + circ(196, 96, 7, '#d64545') +
    `<rect x="84" y="108" width="152" height="10" fill="${BR}"/>` + rect(80, 114, 160, 58, 4, TAN) + line('M80 133h160M80 152h160', BR, 2),
  'bookstore-gift-card':
    rect(84, 58, 152, 98, 12, B) + rect(104, 78, 48, 36, 4, W) + line('M128 80v32', K, 2) + line('M108 86h16M108 94h16M132 86h16M132 94h16', '#9aa7ae', 2) +
    line('M104 132h80', W, 4) + circ(206, 92, 12, Y) + sparkle(240, 50),
  'pet-gps-tracker':
    path('M84 120c0-30 152-30 152 0c0 14-152 14-152 0z', 'none') + line('M84 120c0 22 152 22 152 0', B, 12) +
    rect(138, 118, 44, 42, 10, DK) + dot(160, 139, 6, T) +
    path('M200 40c-16 0-24 12-24 22c0 16 24 36 24 36s24-20 24-36c0-10-8-22-24-22z', T) + dot(200, 62, 7, W),
  'dog-treat-box':
    rect(92, 104, 136, 68, 8, T) + path('M92 104l14-18h108l14 18z', '#2a8a95') +
    `<g transform="translate(140 84) rotate(-20)">${path('M-28-6a8 8 0 1 1 8-8h40a8 8 0 1 1 8 8a8 8 0 1 1-8 8h-40a8 8 0 1 1-8-8z', Y)}</g>` +
    circ(196, 88, 16, B) + line('M184 80c8 8 16 8 24 0', W, 2) + heart(160, 132, 1.1, W),
  'chefs-knife':
    path('M70 120c40-30 110-40 160-36v30h-150c-8 0-14-2-10 6z', '#c9d2d7') + line('M90 112c40-20 90-26 130-26', W, 3) +
    rect(226, 82, 64, 34, 12, DK) + dot(246, 99, 4, '#9aa7ae') + dot(270, 99, 4, '#9aa7ae') +
    rect(88, 134, 150, 34, 6, TAN) + line('M100 151h126', BR, 2),
  'robot-vacuum':
    ell(160, 140, 84, 28, DK) + ell(160, 130, 84, 28, '#4a4447') + ell(160, 126, 30, 10, '#1e2a44') + dot(160, 126, 4, T) +
    line('M92 116c20-14 40-18 60-18', '#6b6467', 2) + line('M64 150c-10 0-14-4-18-10M68 160c-10 2-18 0-22-4', '#9aa7ae', 3),
};
