// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import vercel from '@astrojs/vercel';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://kazechronik.vercel.app',
  output: 'server',
  integrations: [sitemap()],
  vite: {
    plugins: [tailwindcss()],
    build: {
      sourcemap: false
    }
  },
  adapter: vercel()
});