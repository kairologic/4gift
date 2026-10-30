import type { APIRoute } from 'astro';
import { allPins, pinBatches, pinsCsv, type Pin } from '../../lib/pins';

// /pins/week-1.csv, /pins/week-2.csv, ...: Pinterest bulk-upload files, one a week.
export function getStaticPaths() {
  return pinBatches(allPins()).map((pins, i) => ({ params: { batch: `week-${i + 1}` }, props: { pins } }));
}

export const GET: APIRoute = ({ props, site }) =>
  new Response(pinsCsv((props as { pins: Pin[] }).pins, site!), { headers: { 'content-type': 'text/csv; charset=utf-8' } });
