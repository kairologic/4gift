import { z } from 'astro/zod';
import { groups, listUrl, type Category, type Group } from '../data/taxonomy';

// Front matter of a guide under src/content/guides/. The fields match what Masthead's publish step writes
// (src/content/markdown.ts in kairologic/Masthead-Main: title, description, kind, topic, published, affiliate,
// aiAssisted, byline, reviewedBy, sources, faq); the rest are the site's own and optional. Unknown fields are ignored,
// so a new Masthead field never breaks the build.
export const GUIDE_KINDS = ['guide', 'quick-review', 'review', 'comparison', 'article'] as const;

// Who a resources article is for (kind: article). An article sits under each audience it names on /resources/;
// one that names none sits under "Gifting in general".
export const AUDIENCES = {
  'pet-lovers': 'Pet lovers',
  teens: 'Teens',
  graduates: 'Graduates',
  seniors: 'Grandparents and seniors',
  'new-parents': 'New parents',
  hosts: 'Hosts and housewarmings',
  coworkers: 'Coworkers',
  couples: 'Couples',
  kids: 'Kids',
} as const;
export type Audience = keyof typeof AUDIENCES;
export const GENERAL = 'Gifting in general';

export const guideSchema = z.object({
  title: z.string().min(1),
  description: z.string().default(''),
  kind: z.enum(GUIDE_KINDS).default('guide'),
  // For kind `article`: the audiences it speaks to (keys of AUDIENCES). An unknown one fails the build.
  audience: z.array(z.enum(Object.keys(AUDIENCES) as [Audience, ...Audience[]])).default([]),
  // Masthead's beat, free text (birthday, for mom, under $25, ...). Shown as the card label.
  topic: z.string().optional(),
  published: z.coerce.date(),
  updated: z.coerce.date().optional(),
  // Set when the piece carries affiliate links; shows the disclosure box above the body.
  affiliate: z.boolean().default(false),
  // Drafted by Masthead (Claude) and approved in its review queue; shows a note to readers.
  aiAssisted: z.boolean().default(false),
  byline: z.string().optional(),
  reviewedBy: z.string().optional(),
  sources: z.array(z.object({ title: z.string(), url: z.string().url() })).default([]),
  faq: z.array(z.object({ q: z.string(), a: z.string() })).default([]),
  // Gift list category slugs (src/data/taxonomy.ts) the guide draws from; shown as "Shop the lists" chips.
  lists: z.array(z.string()).default([]),
  // Lead image: a path under public/ or a hotlinked URL with its credit. Doubles as the Pinterest Rich Pin image.
  hero: z.object({ src: z.string(), alt: z.string(), credit: z.string().optional(), creditUrl: z.string().url().optional() }).optional(),
  // A YouTube video (a Short cut from this piece) shown after the body, loaded only when the reader presses play.
  video: z.object({ id: z.string().regex(/^[\w-]{11}$/), title: z.string() }).optional(),
  draft: z.boolean().default(false),
});

export type GuideFrontMatter = z.infer<typeof guideSchema>;

/** Articles grouped for /resources/: one section per audience that has any, in AUDIENCES order, then the general ones. */
export function byAudience<T extends { data: { audience: Audience[] } }>(articles: T[]): { name: string; items: T[] }[] {
  const out = (Object.keys(AUDIENCES) as Audience[]).map((a) => ({ name: AUDIENCES[a] as string, items: articles.filter((x) => x.data.audience.includes(a)) }));
  out.push({ name: GENERAL, items: articles.filter((x) => !x.data.audience.length) });
  return out.filter((s) => s.items.length);
}

/** The URL of a guide, from its collection id (the file name without .md). */
export const guideUrl = (id: string) => `/guides/${id}/`;

/** The gift lists a guide names, resolved to their pages; a slug no list carries is skipped. */
export function listsFor(slugs: string[]): { name: string; href: string }[] {
  const out: { name: string; href: string }[] = [];
  for (const slug of slugs) {
    for (const g of groups as Group[]) {
      const c = (g.categories as Category[]).find((x) => x.slug === slug);
      if (c) out.push({ name: c.title, href: listUrl(g, c) });
    }
  }
  return out;
}
