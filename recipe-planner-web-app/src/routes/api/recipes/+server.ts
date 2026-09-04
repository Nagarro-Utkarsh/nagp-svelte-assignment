import { json } from "@sveltejs/kit";
import { readFilters, readPageNumber } from "$lib/api/recipes";
import { listRecipes } from "$lib/server/recipes";
import type { RequestHandler } from "./$types";

export const GET: RequestHandler = async ({ url }) => {
  return json(
    await listRecipes({
      query: url.searchParams.get("q")?.trim() ?? "",
      filters: readFilters(url.searchParams),
      page: readPageNumber(url.searchParams.get("page")),
      ids: url.searchParams.get("ids")?.split(",").filter(Boolean) ?? [],
    }),
  );
};
