export interface RawIngredient {
  name?: string;
  nameClean?: string;
  amount?: number;
  unit?: string;
}

export interface RawInstructionGroup {
  steps?: { step?: string }[];
}

export interface RawRecipeSummary {
  id: number;
  title?: string;
  image?: string;
  cuisines?: string[];
  dishTypes?: string[];
  diets?: string[];
}

export interface RawRecipeDetail extends RawRecipeSummary {
  instructions?: string;
  analyzedInstructions?: RawInstructionGroup[];
  extendedIngredients?: RawIngredient[];
}

export interface RawSearchResponse {
  results?: RawRecipeSummary[];
}
