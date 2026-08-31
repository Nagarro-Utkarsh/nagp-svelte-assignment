<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
	import { page } from '$app/state';

	let { children } = $props();

	const links = [
		{ href: '/', label: 'Discover' },
		{ href: '/favorites', label: 'Favorites' },
		{ href: '/my-recipes', label: 'My recipes' },
		{ href: '/planner', label: 'Planner' }
	];

	function isActive(href: string) {
		return href === '/' ? page.url.pathname === '/' : page.url.pathname.startsWith(href);
	}
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<div class="shell">
	<header class="masthead">
		<a class="brand" href="/">
			<span class="brand__mark" aria-hidden="true">🍲</span>
			<span class="brand__text">Recipe Finder &amp; Meal Planner</span>
		</a>

		<nav aria-label="Main">
			<ul>
				{#each links as link (link.href)}
					<li>
						<a href={link.href} aria-current={isActive(link.href) ? 'page' : undefined}>
							{link.label}
						</a>
					</li>
				{/each}
			</ul>
		</nav>
	</header>

	<main>
		{@render children()}
	</main>

	<footer>Recipe Finder &amp; Meal Planner · Plan your week, one meal at a time.</footer>
</div>

<style>
	.shell {
		display: flex;
		flex-direction: column;
		min-height: 100vh;
	}

	.masthead {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
		padding: 1rem var(--app-gutter);
		border-bottom: 1px solid var(--rf-border);
		background: var(--rf-surface);
		position: sticky;
		top: 0;
		z-index: 10;
	}

	.brand {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		font-size: 1.125rem;
		font-weight: 700;
		color: inherit;
		text-decoration: none;
	}

	.brand__mark {
		font-size: 1.5rem;
	}

	nav ul {
		display: flex;
		flex-wrap: wrap;
		gap: 0.25rem;
		margin: 0;
		padding: 0;
		list-style: none;
	}

	nav a {
		display: inline-flex;
		align-items: center;
		padding: 0.5rem 0.75rem;
		border-radius: var(--app-radius-sm);
		color: var(--rf-muted);
		font-weight: 600;
		text-decoration: none;
	}

	nav a:hover {
		background: var(--rf-muted-surface);
		color: var(--rf-text);
	}

	nav a[aria-current='page'] {
		background: var(--rf-muted-surface);
		color: var(--rf-accent);
	}

	main {
		flex: 1;
		width: 100%;
		max-width: var(--app-max-width);
		margin: 0 auto;
		padding: 1.5rem var(--app-gutter) 3rem;
	}

	footer {
		padding: 1.5rem var(--app-gutter);
		border-top: 1px solid var(--rf-border);
		color: var(--rf-muted);
		font-size: 0.875rem;
		text-align: center;
	}
</style>
