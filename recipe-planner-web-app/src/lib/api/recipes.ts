import type { RecipeSummary } from '$lib/types';

export const FILTER_TYPES = ['meal', 'cuisine', 'diet'] as const;

export type FilterType = (typeof FILTER_TYPES)[number];

export type SelectedFilters = Partial<Record<FilterType, string>>;

export interface FilterGroup {
	type: FilterType;
	label: string;
	values: string[];
}

export const FILTER_LABELS: Record<FilterType, string> = {
	meal: 'Meal type',
	cuisine: 'Cuisine',
	diet: 'Diet'
};

export interface RecipesQuery {
	query?: string;
	filters?: SelectedFilters;
	page?: number;
	ids?: string[];
}

export interface RecipeList {
	recipes: RecipeSummary[];
	total: number;
	page: number;
	pageCount: number;
}

export function readFilters(params: URLSearchParams): SelectedFilters {
	const filters: SelectedFilters = {};

	for (const type of FILTER_TYPES) {
		const value = params.get(type)?.trim();

		if (value) filters[type] = value;
	}

	return filters;
}

export function readPageNumber(raw: string | null): number {
	const parsed = Number(raw);

	return Number.isInteger(parsed) && parsed > 0 ? parsed : 1;
}

export function countFilters(filters: SelectedFilters): number {
	return FILTER_TYPES.filter((type) => filters[type]).length;
}

function toSearchParams({ query, filters, page, ids }: RecipesQuery): string {
	const params = new URLSearchParams();

	if (query) params.set('q', query);

	for (const type of FILTER_TYPES) {
		const value = filters?.[type];

		if (value) params.set(type, value);
	}

	if (page && page > 1) params.set('page', String(page));

	if (ids?.length) params.set('ids', ids.join(','));

	return params.toString();
}

function withParams(path: string, query: RecipesQuery): string {
	const search = toSearchParams(query);

	return search ? `${path}?${search}` : path;
}

export function recipesUrl(query: RecipesQuery): string {
	return withParams('/', query);
}

export function recipesApiUrl(query: RecipesQuery): string {
	return withParams('/api/recipes', query);
}

export function filtersApiUrl(query: RecipesQuery): string {
	return withParams('/api/filters', query);
}
