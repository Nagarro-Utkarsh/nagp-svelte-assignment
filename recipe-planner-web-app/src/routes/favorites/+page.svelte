<script lang="ts">
	import RecipeGrid from '$lib/components/RecipeGrid.svelte';
	import { recipeLookup } from '$lib/recipe-lookup.svelte';
	import { favorites } from '$lib/stores/favorites.svelte';

	const lookup = recipeLookup(() => favorites.ids);

	const recipes = $derived(lookup.resolve(favorites.ids));
</script>

<svelte:head>
	<title>Favorites · Recipe Finder &amp; Meal Planner</title>
</svelte:head>

<h1>Favorites</h1>

{#if lookup.loading}
	<p class="muted">Loading…</p>
{:else if recipes.length}
	<RecipeGrid {recipes} />
{:else}
	<p class="empty">No favorites yet. Tap the heart on any recipe card to save it here.</p>
{/if}
