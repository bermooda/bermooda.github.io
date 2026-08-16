// @ts-check

import sitemap from '@astrojs/sitemap';
import starlight from '@astrojs/starlight';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'astro/config';

export default defineConfig({
	site: 'https://bermooda.github.io',
	integrations: [
		starlight({
			title: 'bermooda',
			description:
				'Own your ecommerce stack. Open-source ecommerce with storefront, admin, and REST API in one app.',
			logo: {
				src: './src/assets/logo-full.svg',
				replacesTitle: true,
				alt: 'bermooda',
			},
			favicon: '/favicon.svg',
			social: [
				{
					icon: 'github',
					label: 'GitHub',
					href: 'https://github.com/bermooda/bermooda',
				},
			],
			customCss: ['./src/styles/docs.css'],
			disable404Route: true,
			credits: false,
			editLink: {
				baseUrl: 'https://github.com/bermooda/bermooda.github.io/edit/master/',
			},
			components: {
				ThemeSelect: './src/components/docs/ThemeSelect.astro',
			},
			head: [
				{
					tag: 'link',
					attrs: {
						rel: 'preconnect',
						href: 'https://fonts.googleapis.com',
					},
				},
				{
					tag: 'link',
					attrs: {
						rel: 'preconnect',
						href: 'https://fonts.gstatic.com',
						crossorigin: true,
					},
				},
				{
					tag: 'link',
					attrs: {
						rel: 'stylesheet',
						href: 'https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500&family=Source+Sans+3:ital,wght@0,400;0,500;0,600;1,400&display=swap',
					},
				},
			],
			sidebar: [
				{
					label: 'Start here',
					items: [
						{ label: 'Introduction', slug: 'docs' },
						{ label: 'Quick start', slug: 'docs/getting-started' },
						{ label: 'Configuration', slug: 'docs/configuration' },
						{ label: 'Local development', slug: 'docs/development' },
						{ label: 'Deploy', slug: 'docs/deploy' },
					],
				},
				{
					label: 'CLI',
					items: [
						{ label: 'Overview', slug: 'docs/cli' },
						{ label: 'Commands', slug: 'docs/cli/commands' },
					],
				},
				{
					label: 'Guides',
					items: [
						{ label: 'Authentication', slug: 'docs/guides/auth' },
						{ label: 'PostgreSQL', slug: 'docs/guides/postgres' },
						{ label: 'Storage', slug: 'docs/guides/storage' },
						{ label: 'Testing', slug: 'docs/guides/testing' },
						{ label: 'Agents (MCP)', slug: 'docs/guides/agents' },
					],
				},
				{
					label: 'Themes',
					items: [
						{ label: 'Overview', slug: 'docs/themes' },
						{ label: 'Package contract', slug: 'docs/themes/package' },
						{ label: 'Components', slug: 'docs/themes/components' },
						{ label: 'Slots', slug: 'docs/themes/slots' },
						{ label: 'Create a theme', slug: 'docs/themes/create' },
						{ label: 'Theme API', slug: 'docs/themes/api' },
					],
				},
				{
					label: 'Plugins',
					items: [
						{ label: 'Overview', slug: 'docs/plugins' },
						{ label: 'Hooks and ctx', slug: 'docs/plugins/hooks' },
						{ label: 'Blocks and routes', slug: 'docs/plugins/blocks' },
						{ label: 'Build a plugin', slug: 'docs/plugins/create' },
					],
				},
				{
					label: 'REST API',
					items: [
						{ label: 'Overview', slug: 'docs/api' },
						{ label: 'Authentication', slug: 'docs/api/authentication' },
						{ label: 'Storefront', slug: 'docs/api/storefront' },
						{ label: 'Admin', slug: 'docs/api/admin' },
						{ label: 'Webhooks', slug: 'docs/api/webhooks' },
					],
				},
			],
		}),
		sitemap(),
	],
	vite: {
		plugins: [tailwindcss()],
	},
});
