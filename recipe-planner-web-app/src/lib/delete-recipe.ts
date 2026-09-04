import { favorites } from "$lib/stores/favorites.svelte";
import { myRecipes } from "$lib/stores/my-recipes.svelte";
import { planner } from "$lib/stores/planner.svelte";

export function deleteRecipe(id: string) {
  myRecipes.remove(id);
  favorites.purge(id);
  planner.purge(id);
}
