<script lang="ts">
	import { goto } from '$app/navigation';
	import AddToPlanDialog from '$lib/components/AddToPlanDialog.svelte';
	import RecipeDetailView from '$lib/components/RecipeDetailView.svelte';
	import { favorites } from '$lib/stores/favorites.svelte';
	import { myRecipes } from '$lib/stores/my-recipes.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let planOpen = $state(false);

	const recipe = $derived(data.recipe);
	const isFavorite = $derived(favorites.has(recipe.id));

	function duplicate() {
		const created = myRecipes.create({
			name: `${recipe.name} (copy)`,
			image: recipe.image,
			area: recipe.area,
			category: recipe.category,
			tags: recipe.tags,
			instructions: recipe.instructions,
			ingredients: recipe.ingredients.map((row) => ({ ...row }))
		});

		goto(`/my-recipes/${created.id}`);
	}
</script>

<svelte:head>
	<title>{recipe.name} · Recipe Finder &amp; Meal Planner</title>
	<meta name="description" content={`Ingredients and instructions for ${recipe.name}.`} />
</svelte:head>

<RecipeDetailView {recipe} backHref="/" backLabel="Discover">
	{#snippet actions()}
		<button
			type="button"
			class={[isFavorite && 'primary']}
			onclick={() => favorites.toggle(recipe.id)}
		>
			{isFavorite ? 'Remove from favorites' : 'Add to favorites'}
		</button>
		<button type="button" onclick={() => (planOpen = true)}>Add to meal plan</button>
		<button type="button" onclick={duplicate}>Duplicate to My recipes</button>
	{/snippet}
</RecipeDetailView>

<AddToPlanDialog
	open={planOpen}
	recipeId={recipe.id}
	name={recipe.name}
	onclose={() => (planOpen = false)}
/>
