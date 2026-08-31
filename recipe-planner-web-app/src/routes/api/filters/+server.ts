import { json } from '@sveltejs/kit';
import { readFilters } from '$lib/api/recipes';
import { getFilterGroups } from '$lib/server/recipes';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url }) => {
	return json(
		await getFilterGroups({
			query: url.searchParams.get('q')?.trim() ?? '',
			filters: readFilters(url.searchParams)
		})
	);
};
