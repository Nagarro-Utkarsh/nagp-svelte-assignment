<script lang="ts">
	import '@utkarsh-mahajan/recipe-ui/components/confirm-dialog';
	import RecipeGrid from '$lib/components/RecipeGrid.svelte';
	import { deleteRecipe } from '$lib/delete-recipe';
	import { myRecipes } from '$lib/stores/my-recipes.svelte';

	let pendingId = $state<string | null>(null);

	const pending = $derived(pendingId ? myRecipes.get(pendingId) : null);

	function confirmDelete() {
		if (pendingId) deleteRecipe(pendingId);
		pendingId = null;
	}
</script>

<svelte:head>
	<title>My recipes · Recipe Finder &amp; Meal Planner</title>
</svelte:head>

<header class="page-head">
	<h1>My recipes</h1>
	<a class="button primary" href="/my-recipes/new">Add recipe</a>
</header>

{#if myRecipes.count}
	<RecipeGrid recipes={myRecipes.all}>
		{#snippet actions(recipe)}
			<span slot="actions" class="actions">
				<a class="button" href={`/my-recipes/${recipe.id}/edit`}>Edit</a>
				<button type="button" onclick={() => (pendingId = recipe.id)}>Delete</button>
			</span>
		{/snippet}
	</RecipeGrid>
{:else}
	<p class="empty">You have not added any recipes yet.</p>
{/if}

<confirm-dialog
	open={Boolean(pending)}
	heading="Delete this recipe?"
	confirm-label="Delete"
	cancel-label="Keep"
	tone="danger"
	ondialog-confirm={confirmDelete}
	ondialog-cancel={() => (pendingId = null)}
>
	<p>“{pending?.name ?? ''}” will also be removed from your favorites and meal plan.</p>
</confirm-dialog>
