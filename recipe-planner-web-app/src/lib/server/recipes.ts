import { env } from '$env/dynamic/private';
import {
	FILTER_TYPES,
	FILTER_LABELS,
	type FilterGroup,
	type FilterType,
	type RecipeList,
	type RecipesQuery
} from '$lib/api/recipes';
import { getRecipeDetail, getRecipeSummary } from '$lib/api/normalize';
import type { RawRecipeDetail, RawSearchResponse } from '$lib/api/spoonacular.types';
import type { RecipeDetail } from '$lib/types';
import FALLBACK_RECIPES from './fallback-recipes.json';

const ENDPOINT = 'https://api.spoonacular.com/recipes/complexSearch';
const RECIPE_COUNT = 50;
const PAGE_SIZE = 24;

type FilterField = 'dishTypes' | 'cuisines' | 'diets';

const FILTER_FIELDS: Record<FilterType, FilterField> = {
	meal: 'dishTypes',
	cuisine: 'cuisines',
	diet: 'diets'
};

let cache: Promise<RawRecipeDetail[]> | null = null;

async function fetchRecipes(): Promise<RawRecipeDetail[]> {
	const apiKey = env.SPOONACULAR_API_KEY;

	if (!apiKey) {
		console.warn('SPOONACULAR_API_KEY is not set — serving the bundled fallback recipes.');

		return FALLBACK_RECIPES;
	}

	const params = new URLSearchParams({
		number: String(RECIPE_COUNT),
		addRecipeInformation: 'true',
		fillIngredients: 'true',
		instructionsRequired: 'true',
		sort: 'popularity',
		apiKey
	});

	const response = await fetch(`${ENDPOINT}?${params}`);

	if (!response.ok) throw new Error(`Spoonacular responded with ${response.status}`);

	const body = (await response.json()) as RawSearchResponse;
	const results = (body.results ?? []) as RawRecipeDetail[];

	if (!results.length) throw new Error('Spoonacular returned no results');

	return results.sort((a, b) => (a.title ?? '').localeCompare(b.title ?? ''));
}

async function getAllRecipes(): Promise<RawRecipeDetail[]> {
	cache ??= fetchRecipes();

	try {
		return await cache;
	} catch (cause) {
		cache = null;

		console.warn(`${cause} — serving the bundled fallback recipes.`);

		return FALLBACK_RECIPES;
	}
}

function titleCase(value: string): string {
	return value.replace(/\b[a-z]/g, (letter) => letter.toUpperCase());
}

function sameText(left: string, right: string): boolean {
	return left.trim().toLowerCase() === right.trim().toLowerCase();
}

function matchesFilter(raw: RawRecipeDetail, type: FilterType, value: string): boolean {
	return (raw[FILTER_FIELDS[type]] ?? []).some((entry) => sameText(entry, value));
}

function matchesSearch(raw: RawRecipeDetail, { query, filters }: RecipesQuery): boolean {
	const name = (raw.title ?? '').toLowerCase();

	if (query && !name.includes(query.toLowerCase())) return false;

	return FILTER_TYPES.every((type) => {
		const value = filters?.[type];

		return !value || matchesFilter(raw, type, value);
	});
}

export async function listRecipes(search: RecipesQuery): Promise<RecipeList> {
	const all = await getAllRecipes();

	if (search.ids?.length) {
		const wanted = new Set(search.ids);
		const recipes = all.filter((raw) => wanted.has(String(raw.id))).map(getRecipeSummary);

		return { recipes, total: recipes.length, page: 1, pageCount: 1 };
	}

	const matched = all.filter((raw) => matchesSearch(raw, search)).map(getRecipeSummary);
	const pageCount = Math.max(1, Math.ceil(matched.length / PAGE_SIZE));
	const page = Math.min(search.page ?? 1, pageCount);
	const start = (page - 1) * PAGE_SIZE;

	return {
		recipes: matched.slice(start, start + PAGE_SIZE),
		total: matched.length,
		page,
		pageCount
	};
}

export async function findRecipe(id: string): Promise<RecipeDetail | null> {
	const raw = (await getAllRecipes()).find((recipe) => String(recipe.id) === id);

	return raw ? getRecipeDetail(raw) : null;
}

function collectValues(recipes: RawRecipeDetail[], type: FilterType): Map<string, string> {
	const labelByValue = new Map<string, string>();

	for (const raw of recipes) {
		for (const entry of raw[FILTER_FIELDS[type]] ?? []) {
			const trimmed = entry?.trim();

			if (trimmed) labelByValue.set(trimmed.toLowerCase(), titleCase(trimmed));
		}
	}

	return labelByValue;
}

export async function getFilterGroups({ query, filters }: RecipesQuery): Promise<FilterGroup[]> {
	const all = await getAllRecipes();

	return FILTER_TYPES.map((type) => {
		const others = { ...filters };

		delete others[type];

		const reachable = all.filter((raw) => matchesSearch(raw, { query, filters: others }));
		const labelByValue = collectValues(reachable, type);
		const chosen = filters?.[type]?.trim();

		if (chosen) labelByValue.set(chosen.toLowerCase(), titleCase(chosen));

		return {
			type,
			label: FILTER_LABELS[type],
			values: [...labelByValue.values()].sort((a, b) => a.localeCompare(b))
		};
	});
}
