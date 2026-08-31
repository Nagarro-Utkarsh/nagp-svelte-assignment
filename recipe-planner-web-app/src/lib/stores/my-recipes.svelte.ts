import { loadPersisted, savePersisted } from '$lib/storage';
import { LOCAL_ID_PREFIX, type RecipeDetail } from '$lib/types';

const KEY = 'rf:my-recipes';

export type RecipeInput = Omit<RecipeDetail, 'id' | 'source'>;

function sanitize(value: unknown): RecipeDetail[] {
	if (!Array.isArray(value)) return [];

	return value.filter(
		(recipe): recipe is RecipeDetail =>
			Boolean(recipe) && typeof recipe.id === 'string' && typeof recipe.name === 'string'
	);
}

let recipes = $state.raw<RecipeDetail[]>(sanitize(loadPersisted<RecipeDetail[]>(KEY, [])));

function persist() {
	savePersisted(KEY, recipes);
}

function newId() {
	return `${LOCAL_ID_PREFIX}${crypto.randomUUID()}`;
}

export const myRecipes = {
	get all() {
		return recipes;
	},
	get count() {
		return recipes.length;
	},
	get(id: string) {
		return recipes.find((recipe) => recipe.id === id) ?? null;
	},
	create(input: RecipeInput) {
		const created: RecipeDetail = { ...input, id: newId(), source: 'local' };

		recipes = [created, ...recipes];
		persist();

		return created;
	},
	update(id: string, input: RecipeInput) {
		recipes = recipes.map((recipe) =>
			recipe.id === id ? { ...input, id, source: 'local' } : recipe
		);
		persist();
	},
	remove(id: string) {
		recipes = recipes.filter((recipe) => recipe.id !== id);
		persist();
	}
};
