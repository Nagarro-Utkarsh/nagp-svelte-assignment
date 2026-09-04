import { error, json } from "@sveltejs/kit";
import { findRecipe } from "$lib/server/recipes";
import type { RequestHandler } from "./$types";

export const GET: RequestHandler = async ({ params }) => {
  const recipe = await findRecipe(params.id);

  if (!recipe) {
    error(404, `No recipe found with id ${params.id}`);
  }

  return json(recipe);
};
