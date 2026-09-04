import type { Ingredient, RecipeDetail, RecipeSummary } from "$lib/types";
import type {
  RawIngredient,
  RawRecipeDetail,
  RawRecipeSummary,
} from "./spoonacular.types";

const TAG_LIMIT = 6;

function getFirstValue(values: string[] | undefined): string | null {
  const found = values?.find((value) => value?.trim());

  return found ? capitalize(found.trim()) : null;
}

function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function stripHtml(value: string): string {
  return value
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function getRecipeSummary(raw: RawRecipeSummary): RecipeSummary {
  return {
    id: String(raw.id),
    name: raw.title?.trim() || "Untitled recipe",
    image: raw.image?.trim() || "",
    category: getFirstValue(raw.dishTypes),
    area: getFirstValue(raw.cuisines),
    source: "api",
  };
}

export function getRecipeDetail(raw: RawRecipeDetail): RecipeDetail {
  return {
    ...getRecipeSummary(raw),
    instructions: getInstructions(raw),
    ingredients: getIngredients(raw.extendedIngredients),
    tags: getTags(raw),
  };
}

function getMeasure(row: RawIngredient): string {
  const amount = row.amount ? String(Math.round(row.amount * 100) / 100) : "";

  return [amount, row.unit?.trim()].filter(Boolean).join(" ");
}

function getIngredients(rows: RawIngredient[] | undefined): Ingredient[] {
  const seen = new Set<string>();
  const ingredients: Ingredient[] = [];

  for (const row of rows ?? []) {
    const name = (row.nameClean || row.name)?.trim();

    if (!name || seen.has(name.toLowerCase())) continue;

    seen.add(name.toLowerCase());
    ingredients.push({ name: capitalize(name), measure: getMeasure(row) });
  }

  return ingredients;
}

function getInstructions(raw: RawRecipeDetail): string[] {
  const steps = (raw.analyzedInstructions ?? []).flatMap(
    (group) => group.steps ?? [],
  );

  if (steps.length) {
    return steps
      .map((step) => step.step?.trim())
      .filter((step): step is string => Boolean(step));
  }

  const html = raw.instructions?.trim();

  if (!html) return [];

  const items = [...html.matchAll(/<li[^>]*>(.*?)<\/li>/gis)]
    .map((match) => stripHtml(match[1]))
    .filter(Boolean);

  if (items.length) return items;

  return stripHtml(html)
    .split(/(?<=[.!?])\s+/)
    .map((step) => step.trim())
    .filter(Boolean);
}

function getTags(raw: RawRecipeDetail): string[] {
  const tags = [...(raw.diets ?? []), ...(raw.dishTypes ?? [])]
    .map((tag) => tag?.trim())
    .filter((tag): tag is string => Boolean(tag))
    .map(capitalize);

  return [
    ...new Map(tags.map((tag) => [tag.toLowerCase(), tag])).values(),
  ].slice(0, TAG_LIMIT);
}
