import type { RecipeInput } from '$lib/stores/my-recipes.svelte';
import type { Ingredient, IngredientRow, RecipeDetail, RecipeFormValues } from '$lib/types';

const MAX_NAME_LENGTH = 80;

export const MAX_IMAGE_BYTES = 512 * 1024;

export function readDataUrl(file: File): Promise<string> {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();

		reader.onload = () => resolve(String(reader.result));
		reader.onerror = () => reject(reader.error);
		reader.readAsDataURL(file);
	});
}

function splitLines(value: string): string[] {
	return value
		.split('\n')
		.map((line) => line.trim())
		.filter(Boolean);
}

function splitTags(value: string): string[] {
	const tags = value
		.split(',')
		.map((tag) => tag.trim())
		.filter(Boolean);

	return [...new Map(tags.map((tag) => [tag.toLowerCase(), tag])).values()];
}

export interface RecipeFormErrors {
	name?: string;
	category?: string;
	area?: string;
	instructions?: string;
	ingredients?: string;
	rows?: Record<string, string>;
}

let rowCount = 0;

export function emptyRow(): IngredientRow {
	return { id: `row-${++rowCount}`, name: '', measure: '' };
}

export function emptyForm(): RecipeFormValues {
	return {
		name: '',
		image: '',
		category: '',
		area: '',
		tags: '',
		instructions: '',
		ingredients: [emptyRow(), emptyRow(), emptyRow()]
	};
}

export function getFormValues(recipe: RecipeDetail): RecipeFormValues {
	return {
		name: recipe.name,
		image: recipe.image,
		category: recipe.category ?? '',
		area: recipe.area ?? '',
		tags: recipe.tags.join(', '),
		instructions: recipe.instructions.join('\n'),
		ingredients: recipe.ingredients.length
			? recipe.ingredients.map((row) => ({ ...emptyRow(), ...row }))
			: [emptyRow()]
	};
}

export function getRecipeInput(values: RecipeFormValues): RecipeInput {
	return {
		name: values.name.trim(),
		image: values.image.trim(),
		area: values.area.trim() || null,
		category: values.category.trim(),
		tags: splitTags(values.tags),
		instructions: splitLines(values.instructions),
		ingredients: cleanIngredients(values.ingredients)
	};
}

export function validateRecipeForm(values: RecipeFormValues): RecipeFormErrors {
	const errors: RecipeFormErrors = {};
	const rows: Record<string, string> = {};

	const name = values.name.trim();
	if (!name) {
		errors.name = 'Name is required.';
	} else if (name.length > MAX_NAME_LENGTH) {
		errors.name = `Name must be ${MAX_NAME_LENGTH} characters or fewer.`;
	}

	if (!values.category.trim()) errors.category = 'Category is required.';
	if (!values.area.trim()) errors.area = 'Area is required.';

	if (!splitLines(values.instructions).length) {
		errors.instructions = 'Add at least one step, one per line.';
	}

	for (const row of values.ingredients) {
		if (!row.name.trim() && row.measure.trim()) {
			rows[row.id] = 'Add an ingredient name, or clear the measure.';
		}
	}

	if (!cleanIngredients(values.ingredients).length) {
		errors.ingredients = 'Add at least one ingredient.';
	}

	if (Object.keys(rows).length) errors.rows = rows;

	return errors;
}

export function hasErrors(errors: RecipeFormErrors): boolean {
	return Object.keys(errors).length > 0;
}

function cleanIngredients(ingredients: IngredientRow[]): Ingredient[] {
	return ingredients
		.map((row) => ({ name: row.name.trim(), measure: row.measure.trim() }))
		.filter((row) => row.name);
}
