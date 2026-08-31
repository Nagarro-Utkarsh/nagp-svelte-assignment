import { recipesApiUrl, type RecipeList } from '$lib/api/recipes';
import { myRecipes } from '$lib/stores/my-recipes.svelte';
import type { RecipeSummary } from '$lib/types';

export function recipeLookup(getIds: () => string[]) {
	let loading = $state(true);
	let fetched = $state<RecipeSummary[]>([]);

	$effect(() => {
		const requested = getIds();

		if (!requested.length) {
			fetched = [];
			loading = false;

			return;
		}

		const url = recipesApiUrl({ ids: requested });

		fetch(url)
			.then((response) => response.json())
			.then((list: RecipeList) => {
				if (url !== recipesApiUrl({ ids: getIds() })) return;

				fetched = list.recipes;
				loading = false;
			});
	});

	return {
		get loading() {
			return loading;
		},
		resolve(ids: string[]): RecipeSummary[] {
			const fromServer = new Map(fetched.map((recipe) => [recipe.id, recipe]));

			return ids
				.map((id) => fromServer.get(id) ?? myRecipes.get(id))
				.filter((recipe): recipe is RecipeSummary => Boolean(recipe));
		}
	};
}
