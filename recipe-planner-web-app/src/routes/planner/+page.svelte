<script lang="ts">
	import '@utkarsh-mahajan/recipe-ui/components/meal-slot';
	import { goto } from '$app/navigation';
	import RecipeGrid from '$lib/components/RecipeGrid.svelte';
	import { recipeLookup } from '$lib/recipe-lookup.svelte';
	import { planner } from '$lib/stores/planner.svelte';
	import { DAYS, MEALS, type Day, type Meal } from '$lib/types';

	const lookup = recipeLookup(() =>
		DAYS.flatMap((day) => MEALS.flatMap((meal) => planner.ids(day, meal)))
	);

	function recipesFor(day: Day, meal: Meal) {
		return lookup.resolve(planner.ids(day, meal));
	}
</script>

<svelte:head>
	<title>Meal planner · Recipe Finder &amp; Meal Planner</title>
</svelte:head>

<header class="page-head">
	<h1>Weekly meal plan</h1>
	{#if planner.count}
		<button type="button" onclick={() => planner.clear()}>Clear week</button>
	{/if}
</header>

<div class="week">
	{#each DAYS as day (day)}
		<section>
			<h2>{day}</h2>

			{#each MEALS as meal (meal)}
				<meal-slot
					{day}
					slot-label={meal}
					is-empty={planner.ids(day, meal).length === 0}
					add-label="Find a recipe"
					onslot-add={() => goto('/')}
				>
					<RecipeGrid recipes={recipesFor(day, meal)}>
						{#snippet actions(recipe)}
							<button
								slot="actions"
								type="button"
								onclick={() => planner.remove(day, meal, recipe.id)}
							>
								Remove
							</button>
						{/snippet}
					</RecipeGrid>
				</meal-slot>
			{/each}
		</section>
	{/each}
</div>

<style>
	.week {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(20rem, 1fr));
		gap: 1.5rem;
	}

	section {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}
</style>
