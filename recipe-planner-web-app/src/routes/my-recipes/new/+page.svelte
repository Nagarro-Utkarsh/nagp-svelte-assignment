<script lang="ts">
	import { goto } from '$app/navigation';
	import RecipeForm from '$lib/components/RecipeForm.svelte';
	import { emptyForm, getRecipeInput } from '$lib/recipe-form';
	import { myRecipes } from '$lib/stores/my-recipes.svelte';
	import type { RecipeFormValues } from '$lib/types';

	function save(values: RecipeFormValues) {
		const created = myRecipes.create(getRecipeInput(values));
		goto(`/my-recipes/${created.id}`);
	}
</script>

<svelte:head>
	<title>Add a recipe · Recipe Finder &amp; Meal Planner</title>
</svelte:head>

<h1>Add a recipe</h1>

<RecipeForm
	initial={emptyForm()}
	submitLabel="Save recipe"
	onsave={save}
	oncancel={() => goto('/my-recipes')}
/>
