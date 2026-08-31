<script lang="ts">
	import '@utkarsh-mahajan/recipe-ui/components/filter-select';
	import '@utkarsh-mahajan/recipe-ui/components/search-bar';
	import { untrack } from 'svelte';
	import { afterNavigate, goto } from '$app/navigation';
	import { navigating } from '$app/state';
	import { countFilters, recipesUrl, type FilterType, type RecipesQuery } from '$lib/api/recipes';
	import RecipeGrid from '$lib/components/RecipeGrid.svelte';
	import { debounce } from '$lib/debounce';
	import { getFilterValue, getSearchValue } from '$lib/events';
	import type { PageData } from './$types';

	const SEARCH_DELAY = 350;

	let { data }: { data: PageData } = $props();

	let query = $state(untrack(() => data.query));

	const loading = $derived(Boolean(navigating.to));

	const filterCount = $derived(countFilters(data.selected));

	afterNavigate(({ type }) => {
		if (type === 'enter' || type === 'popstate') query = data.query;
	});

	function showResults(next: RecipesQuery, replaceState = false) {
		searchAfterTyping.cancel();
		goto(recipesUrl(next), { keepFocus: true, noScroll: true, replaceState });
	}

	const searchAfterTyping = debounce(
		(term: string) => showResults({ query: term, filters: data.selected }, true),
		SEARCH_DELAY
	);

	function handleTyping(event: Event) {
		query = getSearchValue(event);
		searchAfterTyping(query);
	}

	function handleSearch(event: Event) {
		showResults({ query: getSearchValue(event), filters: data.selected });
	}

	function handleClear() {
		query = '';
		showResults({ filters: data.selected });
	}

	function handleFilter(type: FilterType, event: Event) {
		showResults({ query, filters: { ...data.selected, [type]: getFilterValue(event) } });
	}

	function handleReset() {
		query = '';
		showResults({});
	}
</script>

<svelte:head>
	<title>Discover recipes · Recipe Finder &amp; Meal Planner</title>
	<meta name="description" content="Search and browse thousands of recipes." />
</svelte:head>

<section class="discover">
	<h1>Discover recipes</h1>

	<search-bar
		value={query}
		placeholder="Search by name, e.g. arrabiata"
		label="Search recipes by name"
		onsearch-input={handleTyping}
		onsearch-submit={handleSearch}
		onsearch-clear={handleClear}
	>
		{#each data.filters as filter (filter.type)}
			<filter-select
				slot="filters"
				label={filter.label}
				value={data.selected[filter.type] ?? ''}
				options={filter.values.join(',')}
				search-label={`Filter ${filter.label.toLowerCase()}`}
				onfilter-change={(event: Event) => handleFilter(filter.type, event)}
			>
				<span slot="empty">No {filter.label.toLowerCase()} matches that.</span>
			</filter-select>
		{/each}
	</search-bar>

	<div class="status" aria-live="polite">
		<h2>{data.heading}</h2>
		<span class="pill">{loading ? 'Loading…' : `${data.total} found`}</span>

		{#if data.query || filterCount}
			<button type="button" onclick={handleReset}>
				Clear {filterCount > 1 ? `${filterCount} filters` : 'all'}
			</button>
		{/if}
	</div>

	{#if data.recipes.length}
		<RecipeGrid recipes={data.recipes} />

		{#if data.pager.pageCount > 1}
			<nav class="pager" aria-label="Pagination">
				<a class="button" href={data.pager.previous ?? undefined}>Previous</a>
				<span>Page {data.pager.page} of {data.pager.pageCount}</span>
				<a class="button" href={data.pager.next ?? undefined}>Next</a>
			</nav>
		{/if}
	{:else}
		<p class="empty">Nothing matched. Try a different search, or clear everything and start again.</p>
	{/if}
</section>

<style>
	.discover {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	h1 {
		margin: 0;
	}

	.status {
		display: flex;
		flex-wrap: wrap;
		align-items: baseline;
		gap: 0.75rem;
	}

	.status h2 {
		margin: 0;
	}

	.status button {
		margin-left: auto;
	}

	.pager {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: center;
		gap: 1rem;
		color: var(--rf-muted);
		font-size: 0.875rem;
	}
</style>
