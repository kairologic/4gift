import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// SITE_URL is set by the deploy workflow (https://4gift.store).
export default defineConfig({
  site: process.env.SITE_URL || 'https://4gift.store',
  trailingSlash: 'always',
  build: { format: 'directory' },
  integrations: [sitemap()],
});
