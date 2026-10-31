import type { APIRoute } from 'astro';
import { Resvg } from '@resvg/resvg-js';
import path from 'node:path';
import { allPins, PIN_W, pinSvg, type Pin } from '../../lib/pins';

// Renders each pin to PNG at build time with the fonts in src/assets/fonts (OFL), so the images look the same on
// any build machine.
const fonts = ['DMSerifDisplay-Regular.ttf', 'Hind-Regular.ttf', 'Hind-SemiBold.ttf'].map((f) => path.join(process.cwd(), 'src/assets/fonts', f));

export function getStaticPaths() {
  return allPins().map((pin) => ({ params: { name: pin.name }, props: { pin } }));
}

export const GET: APIRoute = ({ props }) => {
  const png = new Resvg(pinSvg((props as { pin: Pin }).pin), {
    fitTo: { mode: 'width', value: PIN_W },
    font: { fontFiles: fonts, loadSystemFonts: false, defaultFontFamily: 'Hind' },
  }).render().asPng();
  return new Response(new Uint8Array(png), { headers: { 'content-type': 'image/png' } });
};
