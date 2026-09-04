export interface Ingredient {
  name: string;
  measure: string;
}

export interface IngredientRow extends Ingredient {
  id: string;
}

export interface RecipeSummary {
  id: string;
  name: string;
  image: string;
  category: string | null;
  area: string | null;
  source: "api" | "local";
}

export interface RecipeDetail extends RecipeSummary {
  instructions: string[];
  ingredients: Ingredient[];
  tags: string[];
}

export interface RecipeFormValues {
  name: string;
  image: string;
  category: string;
  area: string;
  tags: string;
  instructions: string;
  ingredients: IngredientRow[];
}

export const DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
] as const;

export const MEALS = ["Breakfast", "Lunch", "Dinner"] as const;

export type Day = (typeof DAYS)[number];
export type Meal = (typeof MEALS)[number];

export function readOption<T extends string>(
  value: string,
  allowed: readonly T[],
): T | undefined {
  return allowed.includes(value as T) ? (value as T) : undefined;
}

export const LOCAL_ID_PREFIX = "local-";

export function isLocalId(id: string): boolean {
  return id.startsWith(LOCAL_ID_PREFIX);
}
