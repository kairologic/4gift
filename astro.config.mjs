import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// SITE_URL is set by the deploy workflow (https://4gift.store).
export default defineConfig({
  site: process.env.SITE_URL || 'https://4gift.store',
  trailingSlash: 'always',
  build: { format: 'directory' },
  // /find/ is search results for whatever the reader typed, so it stays out of the sitemap (and is noindex).
  integrations: [sitemap({ filter: (page) => !new URL(page).pathname.startsWith('/find/') })],
});
