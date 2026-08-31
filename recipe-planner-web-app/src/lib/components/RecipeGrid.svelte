<script lang="ts">
	import '@utkarsh-mahajan/recipe-ui/components/recipe-card';
	import type { Snippet } from 'svelte';
	import { goto } from '$app/navigation';
	import { getFavoriteToggle, getOpenedRecipe } from '$lib/events';
	import { favorites } from '$lib/stores/favorites.svelte';
	import { isLocalId, type RecipeSummary } from '$lib/types';

	interface Props {
		recipes: RecipeSummary[];
		actions?: Snippet<[RecipeSummary]>;
	}

	let { recipes, actions }: Props = $props();

	function handleOpen(event: Event) {
		const { recipeId } = getOpenedRecipe(event);
		const section = isLocalId(recipeId) ? '/my-recipes' : '/recipes';

		goto(`${section}/${encodeURIComponent(recipeId)}`);
	}

	function handleFavorite(event: Event) {
		const { recipeId, isFavorite } = getFavoriteToggle(event);

		favorites.set(recipeId, isFavorite);
	}
</script>

<ul class="grid">
	{#each recipes as recipe (recipe.id)}
		<li>
			<recipe-card
				recipe-id={recipe.id}
				name={recipe.name}
				image={recipe.image}
				category={recipe.category ?? ''}
				area={recipe.area ?? ''}
				is-favorite={favorites.has(recipe.id)}
				is-owned={recipe.source === 'local'}
				oncard-open={handleOpen}
				onfavorite-toggle={handleFavorite}
			>
				{#if actions}{@render actions(recipe)}{/if}
			</recipe-card>
		</li>
	{/each}
</ul>

<style>
	.grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(15rem, 1fr));
		gap: 1.25rem;
		margin: 0;
		padding: 0;
		list-style: none;
	}

	li {
		display: flex;
	}

	recipe-card {
		flex: 1;
	}
</style>
