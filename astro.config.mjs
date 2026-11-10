import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// SITE_URL is set by the deploy workflow (https://4gift.store).
export default defineConfig({
  site: process.env.SITE_URL || 'https://4gift.store',
  trailingSlash: 'always',
  // Budget lists renamed 2026-11-10 (store floor $40); old links from posts and pins keep working.
  redirects: {
    '/budget/under-25/': '/budget/small-luxuries/',
    '/budget/under-50/': '/budget/40-to-75/',
    '/budget/under-100/': '/budget/75-to-150/',
    '/budget/splurge/': '/budget/150-and-up/',
  },
  build: { format: 'directory' },
  // /find/ is search results for whatever the reader typed, so it stays out of the sitemap (and is noindex).
  integrations: [sitemap({ filter: (page) => !new URL(page).pathname.startsWith('/find/') })],
});
