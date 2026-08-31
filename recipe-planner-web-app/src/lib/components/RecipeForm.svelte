<script lang="ts">
	import { untrack } from 'svelte';
	import {
		MAX_IMAGE_BYTES,
		emptyRow,
		hasErrors,
		readDataUrl,
		validateRecipeForm
	} from '$lib/recipe-form';
	import type { RecipeFormValues } from '$lib/types';

	interface Props {
		initial: RecipeFormValues;
		submitLabel: string;
		onsave: (values: RecipeFormValues) => void;
		oncancel: () => void;
	}

	let { initial, submitLabel, onsave, oncancel }: Props = $props();

	let form = $state(untrack(() => initial));
	let submitted = $state(false);
	let imageError = $state('');

	const errors = $derived(validateRecipeForm(form));

	async function handleImage(event: Event) {
		const input = event.currentTarget as HTMLInputElement;
		const file = input.files?.[0];

		imageError = '';
		input.value = '';

		if (!file) return;

		if (file.size > MAX_IMAGE_BYTES) {
			imageError = `Pick an image under ${MAX_IMAGE_BYTES / 1024} KB.`;
			return;
		}

		try {
			form.image = await readDataUrl(file);
		} catch {
			imageError = 'That image could not be read.';
		}
	}

	function addRow() {
		form.ingredients = [...form.ingredients, emptyRow()];
	}

	function removeRow(id: string) {
		const next = form.ingredients.filter((row) => row.id !== id);
		form.ingredients = next.length ? next : [emptyRow()];
	}

	function handleSubmit(event: SubmitEvent) {
		event.preventDefault();
		submitted = true;

		if (hasErrors(errors)) return;
		onsave(form);
	}
</script>

<form novalidate onsubmit={handleSubmit}>
	<div class="field">
		<label>
			Name
			<input bind:value={form.name} />
		</label>
		{#if submitted && errors.name}<p class="error">{errors.name}</p>{/if}
	</div>

	<div class="pair">
		<div class="field">
			<label>
				Category
				<input bind:value={form.category} placeholder="e.g. Dessert" />
			</label>
			{#if submitted && errors.category}<p class="error">{errors.category}</p>{/if}
		</div>

		<div class="field">
			<label>
				Area
				<input bind:value={form.area} placeholder="e.g. Italian" />
			</label>
			{#if submitted && errors.area}<p class="error">{errors.area}</p>{/if}
		</div>
	</div>

	<div class="field">
		<label>
			Image
			<input type="file" accept="image/*" onchange={handleImage} />
		</label>

		{#if form.image}
			<div class="image">
				<img src={form.image} alt="" />
				<button type="button" onclick={() => (form.image = '')}>Remove image</button>
			</div>
		{/if}

		{#if imageError}<p class="error">{imageError}</p>{/if}
	</div>

	<div class="field">
		<label>
			Tags
			<input bind:value={form.tags} placeholder="Comma separated" />
		</label>
	</div>

	<fieldset>
		<legend>Ingredients</legend>

		{#each form.ingredients as row (row.id)}
			<div class="row">
				<input bind:value={row.name} placeholder="Ingredient" aria-label="Ingredient name" />
				<input bind:value={row.measure} placeholder="Measure" aria-label="Measure" />
				<button type="button" onclick={() => removeRow(row.id)}>Remove</button>
			</div>
			{#if submitted && errors.rows?.[row.id]}<p class="error">{errors.rows[row.id]}</p>{/if}
		{/each}

		<button type="button" onclick={addRow}>Add ingredient</button>
	</fieldset>
	{#if submitted && errors.ingredients}<p class="error">{errors.ingredients}</p>{/if}

	<div class="field">
		<label>
			Instructions
			<textarea rows="10" bind:value={form.instructions}></textarea>
		</label>
		<p class="muted">One step per line.</p>
		{#if submitted && errors.instructions}<p class="error">{errors.instructions}</p>{/if}
	</div>

	<div class="actions">
		<button type="submit" class="primary">{submitLabel}</button>
		<button type="button" onclick={oncancel}>Cancel</button>
	</div>
</form>

<style>
	form {
		display: flex;
		flex-direction: column;
		gap: 1.25rem;
		max-width: 44rem;
	}

	.field {
		display: flex;
		flex-direction: column;
		gap: 0.375rem;
	}

	.pair {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 1rem;
	}

	@media (max-width: 36rem) {
		.pair {
			grid-template-columns: 1fr;
		}
	}

	label {
		display: flex;
		flex-direction: column;
		gap: 0.375rem;
		font-size: 0.875rem;
		font-weight: 600;
	}

	legend {
		font-size: 0.875rem;
		font-weight: 600;
	}

	fieldset {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		align-items: flex-start;
		margin: 0;
		padding: 1rem;
		border: 1px solid var(--rf-border);
		border-radius: var(--rf-radius-lg);
		background: var(--rf-surface);
	}

	.image {
		display: flex;
		gap: 0.75rem;
		align-items: flex-start;
	}

	.image img {
		width: 10rem;
		height: 7rem;
		border-radius: var(--rf-radius-lg);
		border: 1px solid var(--rf-border);
		object-fit: cover;
	}

	.row {
		display: grid;
		grid-template-columns: 2fr 1fr auto;
		gap: 0.5rem;
		width: 100%;
	}

	.muted {
		margin: 0;
		font-size: 0.75rem;
	}

	.error {
		margin: 0;
		color: var(--rf-danger);
		font-size: 0.75rem;
	}
</style>
