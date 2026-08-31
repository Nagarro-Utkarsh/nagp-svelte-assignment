<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { RecipeDetail } from '$lib/types';

	interface Props {
		recipe: RecipeDetail;
		backHref: string;
		backLabel: string;
		actions?: Snippet;
	}

	let { recipe, backHref, backLabel, actions }: Props = $props();

	const meta = $derived(
		[recipe.category, recipe.area, recipe.source === 'local' ? 'Your recipe' : null].filter(Boolean)
	);
</script>

<article>
	<a class="back" href={backHref}>← {backLabel}</a>

	<header>
		<h1>{recipe.name}</h1>

		{#if meta.length}
			<p class="meta">
				{#each meta as item, index}
					{#if index > 0}<span aria-hidden="true">·</span>{/if}
					<span>{item}</span>
				{/each}
			</p>
		{/if}

		{#if recipe.tags.length}
			<ul class="tags">
				{#each recipe.tags as tag (tag)}
					<li class="pill">{tag}</li>
				{/each}
			</ul>
		{/if}

		{#if actions}
			<div class="actions">{@render actions()}</div>
		{/if}
	</header>

	{#if recipe.image}
		<img src={recipe.image} alt={recipe.name} />
	{/if}

	<div class="columns">
		<section>
			<h2>Ingredients</h2>

			{#if recipe.ingredients.length}
				<table>
					<tbody>
						{#each recipe.ingredients as row}
							<tr>
								<th scope="row">{row.name}</th>
								<td>{row.measure || '—'}</td>
							</tr>
						{/each}
					</tbody>
				</table>
			{:else}
				<p class="muted">No ingredients listed.</p>
			{/if}
		</section>

		<section>
			<h2>Instructions</h2>

			{#if recipe.instructions.length}
				<ol>
					{#each recipe.instructions as step}
						<li>{step}</li>
					{/each}
				</ol>
			{:else}
				<p class="muted">No instructions listed.</p>
			{/if}
		</section>
	</div>
</article>

<style>
	.back {
		display: inline-block;
		margin-bottom: 1rem;
		color: var(--rf-muted);
		font-size: 0.875rem;
		text-decoration: none;
	}

	.back:hover {
		color: var(--rf-text);
	}

	h1 {
		margin: 0 0 0.5rem;
		font-size: 1.875rem;
	}

	.meta {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
		margin: 0;
		color: var(--rf-muted);
		font-size: 0.875rem;
	}

	.tags {
		display: flex;
		flex-wrap: wrap;
		gap: 0.375rem;
		margin: 0.75rem 0 0;
		padding: 0;
		list-style: none;
	}

	.actions {
		margin-top: 1.25rem;
	}

	img {
		width: 100%;
		max-height: 24rem;
		margin: 1.5rem 0;
		border-radius: var(--rf-radius-lg);
		box-shadow: var(--rf-shadow);
		object-fit: cover;
	}

	.columns {
		display: grid;
		grid-template-columns: minmax(15rem, 1fr) minmax(0, 2fr);
		gap: 2.5rem;
		align-items: start;
	}

	@media (max-width: 48rem) {
		.columns {
			grid-template-columns: 1fr;
			gap: 2rem;
		}
	}

	table {
		width: 100%;
		border-collapse: collapse;
	}

	th,
	td {
		padding: 0.5rem 0;
		border-bottom: 1px solid var(--rf-border);
		font-size: 0.875rem;
		text-align: left;
		vertical-align: top;
	}

	th {
		font-weight: 500;
	}

	td {
		width: 40%;
		color: var(--rf-muted);
	}

	ol {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
		margin: 0;
		padding-left: 1.25rem;
	}

	.muted {
		margin: 0;
	}
</style>
