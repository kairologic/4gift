import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { guideSchema } from './lib/guides';

// Gift guides written by Masthead land here, one Markdown file per pull request (merging publishes).
// The gift lists themselves stay in src/data/gifts.ts; a guide points at the lists it draws from in `lists`.
const guides = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/guides' }),
  schema: guideSchema,
});

export const collections = { guides };
