import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  const [owner, repository] = process.env.GITHUB_REPOSITORY?.split('/') ?? [];
  const isUserOrOrganizationSite =
    owner && repository?.toLowerCase() === `${owner.toLowerCase()}.github.io`;

  return {
    base:
      process.env.GITHUB_ACTIONS === 'true' && repository && !isUserOrOrganizationSite
        ? `/${repository}/`
        : '/',
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(import.meta.dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
