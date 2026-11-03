import type { APIRoute } from 'astro';
import { gifts } from '../../data/gifts';
import { giftArtSvg } from '../../lib/gift-art';

// One SVG per gift idea, written at build time (src/lib/gift-art.ts holds the drawings).
export function getStaticPaths() {
  return gifts.map((g, i) => ({ params: { slug: g.slug }, props: { index: i } })).filter((p) => giftArtSvg(p.params.slug, p.props.index));
}

export const GET: APIRoute = ({ params, props }) =>
  new Response(giftArtSvg(params.slug!, (props as { index: number }).index), {
    headers: { 'content-type': 'image/svg+xml' },
  });
