<script lang="ts">
	import '@utkarsh-mahajan/recipe-ui/components/confirm-dialog';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import AddToPlanDialog from '$lib/components/AddToPlanDialog.svelte';
	import RecipeDetailView from '$lib/components/RecipeDetailView.svelte';
	import { deleteRecipe } from '$lib/delete-recipe';
	import { favorites } from '$lib/stores/favorites.svelte';
	import { myRecipes } from '$lib/stores/my-recipes.svelte';

	let planOpen = $state(false);
	let confirmOpen = $state(false);

	const id = $derived(page.params.id ?? '');
	const recipe = $derived(myRecipes.get(id));
	const isFavorite = $derived(favorites.has(id));

	function confirmDelete() {
		confirmOpen = false;
		deleteRecipe(id);
		goto('/my-recipes');
	}
</script>

<svelte:head>
	<title>{recipe ? recipe.name : 'Recipe not found'} · Recipe Finder &amp; Meal Planner</title>
</svelte:head>

{#if recipe}
	<RecipeDetailView {recipe} backHref="/my-recipes" backLabel="My recipes">
		{#snippet actions()}
			<button
				type="button"
				class={[isFavorite && 'primary']}
				onclick={() => favorites.toggle(recipe.id)}
			>
				{isFavorite ? 'Remove from favorites' : 'Add to favorites'}
			</button>
			<button type="button" onclick={() => (planOpen = true)}>Add to meal plan</button>
			<a class="button" href={`/my-recipes/${recipe.id}/edit`}>Edit</a>
			<button type="button" class="danger" onclick={() => (confirmOpen = true)}>Delete</button>
		{/snippet}
	</RecipeDetailView>

	<AddToPlanDialog
		open={planOpen}
		recipeId={recipe.id}
		name={recipe.name}
		onclose={() => (planOpen = false)}
	/>

	<confirm-dialog
		open={confirmOpen}
		heading="Delete this recipe?"
		confirm-label="Delete"
		cancel-label="Keep"
		tone="danger"
		ondialog-confirm={confirmDelete}
		ondialog-cancel={() => (confirmOpen = false)}
	>
		<p>“{recipe.name}” will also be removed from your favorites and meal plan.</p>
	</confirm-dialog>
{:else}
	<p class="empty">This recipe is not in this browser. <a href="/my-recipes">Back to list</a></p>
{/if}
