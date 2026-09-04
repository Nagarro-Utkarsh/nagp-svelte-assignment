import { error, redirect } from "@sveltejs/kit";
import { isLocalId, type RecipeDetail } from "$lib/types";
import type { PageLoad } from "./$types";

export const load: PageLoad = async ({ params, fetch }) => {
  if (isLocalId(params.id)) {
    redirect(307, `/my-recipes/${params.id}`);
  }

  const response = await fetch(`/api/recipes/${encodeURIComponent(params.id)}`);

  if (!response.ok) {
    error(404, `No recipe found with id ${params.id}`);
  }

  const recipe: RecipeDetail = await response.json();

  return { recipe };
};
