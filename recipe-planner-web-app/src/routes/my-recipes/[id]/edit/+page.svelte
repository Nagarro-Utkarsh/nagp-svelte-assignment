<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import RecipeForm from '$lib/components/RecipeForm.svelte';
	import { getFormValues, getRecipeInput } from '$lib/recipe-form';
	import { myRecipes } from '$lib/stores/my-recipes.svelte';
	import type { RecipeFormValues } from '$lib/types';

	const id = $derived(page.params.id ?? '');
	const recipe = $derived(myRecipes.get(id));

	function save(values: RecipeFormValues) {
		myRecipes.update(id, getRecipeInput(values));
		goto(`/my-recipes/${id}`);
	}
</script>

<svelte:head>
	<title>Edit recipe · Recipe Finder &amp; Meal Planner</title>
</svelte:head>

{#if recipe}
	<h1>Edit “{recipe.name}”</h1>

	{#key id}
		<RecipeForm
			initial={getFormValues(recipe)}
			submitLabel="Save changes"
			onsave={save}
			oncancel={() => goto(`/my-recipes/${id}`)}
		/>
	{/key}
{:else}
	<p class="empty">This recipe is not in this browser. <a href="/my-recipes">Back to list</a></p>
{/if}
