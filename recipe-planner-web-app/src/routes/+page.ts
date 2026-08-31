import { redirect } from '@sveltejs/kit';
import {
	FILTER_TYPES,
	filtersApiUrl,
	readFilters,
	readPageNumber,
	recipesApiUrl,
	recipesUrl,
	type FilterGroup,
	type RecipeList,
	type SelectedFilters
} from '$lib/api/recipes';
import type { PageLoad } from './$types';

function getHeading(query: string, filters: SelectedFilters): string {
	const chosen = FILTER_TYPES.map((type) => filters[type]).filter(Boolean);
	const scope = chosen.length ? `${chosen.join(' · ')} recipes` : 'Recipes';

	if (query) return `${scope} matching “${query}”`;

	return chosen.length ? scope : 'Browse recipes';
}

export const load: PageLoad = async ({ url, fetch }) => {
	const query = url.searchParams.get('q')?.trim() ?? '';
	const selected = readFilters(url.searchParams);
	const page = readPageNumber(url.searchParams.get('page'));

	const [listResponse, filtersResponse] = await Promise.all([
		fetch(recipesApiUrl({ query, filters: selected, page })),
		fetch(filtersApiUrl({ query, filters: selected }))
	]);

	const list: RecipeList = await listResponse.json();
	const filters: FilterGroup[] = await filtersResponse.json();

	if (page > list.pageCount) {
		redirect(307, recipesUrl({ query, filters: selected, page: list.pageCount }));
	}

	return {
		query,
		selected,
		filters,
		total: list.total,
		recipes: list.recipes,
		heading: getHeading(query, selected),
		pager: {
			page: list.page,
			pageCount: list.pageCount,
			previous:
				list.page > 1 ? recipesUrl({ query, filters: selected, page: list.page - 1 }) : null,
			next:
				list.page < list.pageCount
					? recipesUrl({ query, filters: selected, page: list.page + 1 })
					: null
		}
	};
};
