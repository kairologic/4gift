import type { APIRoute } from 'astro';
import { Resvg } from '@resvg/resvg-js';
import path from 'node:path';
import { shareName, shareSvg, SHARE_W, type ShareCard } from '../../lib/share';
import { allShareCards } from '../../lib/share-cards';

// Renders each link-preview card to PNG at build time with the fonts in src/assets/fonts (OFL), like the pins.
const fonts = ['DMSerifDisplay-Regular.ttf', 'Hind-Regular.ttf', 'Hind-SemiBold.ttf'].map((f) => path.join(process.cwd(), 'src/assets/fonts', f));

export async function getStaticPaths() {
  return (await allShareCards()).map((card) => ({ params: { name: shareName(card.path) }, props: { card } }));
}

export const GET: APIRoute = ({ props }) => {
  const png = new Resvg(shareSvg((props as { card: ShareCard }).card), {
    fitTo: { mode: 'width', value: SHARE_W },
    font: { fontFiles: fonts, loadSystemFonts: false, defaultFontFamily: 'Hind' },
  }).render().asPng();
  return new Response(new Uint8Array(png), { headers: { 'content-type': 'image/png' } });
};
