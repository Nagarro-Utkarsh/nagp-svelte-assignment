<script lang="ts">
	import '@utkarsh-mahajan/recipe-ui/components/confirm-dialog';
	import '@utkarsh-mahajan/recipe-ui/components/filter-select';
	import { getFilterValue } from '$lib/events';
	import { planner } from '$lib/stores/planner.svelte';
	import { DAYS, MEALS, readOption, type Day, type Meal } from '$lib/types';

	interface Props {
		open: boolean;
		recipeId: string;
		name: string;
		onclose: () => void;
	}

	let { open, recipeId, name, onclose }: Props = $props();

	let day = $state<Day>(DAYS[0]);
	let meal = $state<Meal>(MEALS[0]);

	function selectDay(event: Event) {
		const chosen = readOption(getFilterValue(event), DAYS);

		if (chosen) day = chosen;
	}

	function selectMeal(event: Event) {
		const chosen = readOption(getFilterValue(event), MEALS);

		if (chosen) meal = chosen;
	}

	function handleConfirm() {
		planner.add(day, meal, recipeId);
		onclose();
	}
</script>

<confirm-dialog
	{open}
	heading="Add to your week"
	confirm-label="Add to plan"
	cancel-label="Cancel"
	ondialog-confirm={handleConfirm}
	ondialog-cancel={onclose}
>
	<div class="pick">
		<p>Choose where “{name}” should go.</p>

		<filter-select
			label="Day"
			value={day}
			options={DAYS.join(',')}
			any-label=""
			searchable="false"
			onfilter-change={selectDay}
		></filter-select>

		<filter-select
			label="Meal"
			value={meal}
			options={MEALS.join(',')}
			any-label=""
			searchable="false"
			onfilter-change={selectMeal}
		></filter-select>
	</div>
</confirm-dialog>

<style>
	.pick {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.pick filter-select {
		display: flex;
		--rf-filter-label-width: 3rem;
	}

	p {
		margin: 0;
	}
</style>
