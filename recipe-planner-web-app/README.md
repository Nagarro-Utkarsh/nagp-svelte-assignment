# recipe-planner-web-app — Recipe Finder & Meal Planner

The SvelteKit 5 application. It consumes the component library as the published npm package
[`@utkarsh-mahajan/recipe-ui`](https://www.npmjs.com/package/@utkarsh-mahajan/recipe-ui), not from
source.

Setup, prerequisites and the deployed URL are in the [root README](../README.md). This file documents
how the app is put together.

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | dev server on `http://localhost:5173` |
| `npm run build` | production build |
| `npm run preview` | serve the production build |
| `npm run check` | `svelte-check` — types, and attributes on every component |

## Environment

```
SPOONACULAR_API_KEY=
```

Copy `.env.example` to `.env` and fill it in. The key is optional: without it the app serves a committed
fallback snapshot and behaves identically. `.env` is gitignored, and the key is read through
`$env/dynamic/private`, so it can only be touched in a server context.

## Routes

| Route | Rendering | Purpose |
| --- | --- | --- |
| `/` | SSR + hydration | Discovery — search, three filters, paginated grid |
| `/recipes/[id]` | SSR + hydration | Recipe details — ingredients, instructions, tags |
| `/favorites` | `ssr = false` | Favorite recipes |
| `/my-recipes` | `ssr = false` | Your own recipes |
| `/my-recipes/new` | `ssr = false` | Create a recipe |
| `/my-recipes/[id]` | `ssr = false` | One of your recipes, with edit and delete |
| `/my-recipes/[id]/edit` | `ssr = false` | Edit a recipe |
| `/planner` | `ssr = false` | Weekly plan — 7 days × breakfast/lunch/dinner |

The four `ssr = false` areas read from localStorage, which the server cannot see. Everything that can be
server-rendered is.

## State

Three rune-based stores in `src/lib/stores/`, each persisting to localStorage through
`src/lib/storage.ts`:

| Store | Key | Holds |
| --- | --- | --- |
| `favorites.svelte.ts` | `rf:favorites` | recipe ids |
| `my-recipes.svelte.ts` | `rf:my-recipes` | your recipes, in full |
| `planner.svelte.ts` | `rf:planner` | `{ day: { breakfast: id[], lunch: id[], dinner: id[] } }` |

Favorites and the planner store **ids only**, so a recipe is never duplicated into two places that can
disagree. Reads are sanitised on load, so hand-edited or stale localStorage degrades to an empty state
instead of throwing.

## Data

Every read goes through a server-side cache of 50 recipes. If the cache is empty it is populated from
the [Spoonacular API](https://spoonacular.com/food-api); if that call fails, from a static fallback
file. Either way the cache is filled once and everything after that reads it:

```ts
let cache: RawRecipeDetail[] = [];

async function getAllRecipes(): Promise<RawRecipeDetail[]> {
	if (!cache.length) {
		cache = await fetchRecipes();
	}

	return cache;
}
```

Search, filtering, pagination, detail lookups and favorite/planner lookups all run over that array in
`src/lib/server/recipes.ts`. There is no second API call.

```
src/lib/server/
├─ recipes.ts              the cache, the one fetch, and all search/filter/detail logic
└─ fallback-recipes.json   a static snapshot used only when that fetch fails
```

`$lib/server` is a SvelteKit guarantee, not a convention — importing anything under it from client code
is a build error. That's what keeps the key and the dataset off the wire.

Nothing outside `src/lib/server/` and `src/routes/api/` imports that module. Every page reaches the data
through the API instead.

### Why one fetch is enough

`complexSearch` runs with `addRecipeInformation=true` and `fillIngredients=true`, so each of the 50
results already carries everything the app renders: title, image, cuisines, dish types, diets,
ingredients with amounts, and step-by-step instructions. There is nothing left to look up per recipe,
which is what makes the detail page free.

This also keeps the app inside the free plan's ~150 points/day. One request for 50 fully-populated
recipes costs a few points; a cold start costs that again, and browsing costs nothing.

### The API

The whole app talks to four endpoints, and they are the only callers of `src/lib/server/recipes.ts`:

| Endpoint | Returns |
| --- | --- |
| `GET /api/recipes?q=&meal=&cuisine=&diet=&page=` | `{ recipes, total, page, pageCount }` |
| `GET /api/recipes?ids=a,b,c` | the same envelope, unpaged, for those ids |
| `GET /api/recipes/[id]` | one `RecipeDetail`, or `404` |
| `GET /api/filters?q=&meal=&cuisine=&diet=` | the filter groups, narrowed to the current selection |

Each handler only reads the query string and hands it over; searching, filtering, paging and shaping all
happen behind them:

```ts
export const GET: RequestHandler = async ({ url }) => {
	return json(
		await listRecipes({
			query: url.searchParams.get('q')?.trim() ?? '',
			filters: readFilters(url.searchParams),
			page: readPageNumber(url.searchParams.get('page')),
			ids: url.searchParams.get('ids')?.split(',').filter(Boolean) ?? []
		})
	);
};
```

Each filter is its own query parameter, named after the filter type, so a combination reads plainly:
`/api/recipes?q=chicken&cuisine=Italian&diet=Vegetarian`. `readFilters()` picks out whichever of `meal`,
`cuisine` and `diet` are present, and `listRecipes()` keeps a recipe only if **every** one of them
matches:

```ts
return FILTER_TYPES.every((type) => {
	const value = filters?.[type];

	return !value || matchesFilter(raw, type, value);
});
```

Because the pages go through HTTP rather than importing the server module, their loads are **universal**
(`+page.ts`, not `+page.server.ts`). SvelteKit's `fetch` invokes the handler in-process during SSR, so
the first render costs no real request; after hydration, client-side navigation calls `/api/recipes`
directly instead of round-tripping the page's data. One data path, exercised the same way from both
sides.

`recipesUrl()`, `recipesApiUrl()` and `filtersApiUrl()` all build their URL from the same encoder, so
the page URL and the two API URLs can't drift apart.

### Why favorites and the planner need the `ids` form

Favorites and the meal plan store only recipe **ids**, in localStorage. The server can't read
localStorage, so it can't load those pages — which is why they are `ssr = false`. But the dataset lives
on the server. So neither side can resolve the ids alone: the browser knows *which* recipes, the server
*has* them. `?ids=` is where those two meet:

```svelte
const lookup = recipeLookup(() => favorites.ids);
const recipes = $derived(lookup.resolve(favorites.ids));
```

`recipeLookup` (`src/lib/recipe-lookup.svelte.ts`) is shared by both pages: an `$effect` that re-fetches
whenever the ids change, and a `resolve()` that puts them back in the order they were asked for. It
doesn't work out which ids are local first — the endpoint filters the dataset by id, so ids the server
has never heard of are simply absent from the reply, and `resolve()` fills those slots from the local
store. A late reply from a superseded request is dropped by comparing the ids it was for.

### Fallback

If the fetch fails — quota exhausted, no key configured, network error, empty response —
`src/lib/server/fallback-recipes.json` is used instead, and the app behaves identically: browse, search,
filter, favorite, plan. The switch is silent by design; the client has no notion of which dataset it is
looking at, and the reason is logged server-side only.

It is a static snapshot committed to the repo, not something generated at build time, so a fresh clone
works before any key is configured.

### Filters

Spoonacular has no endpoint that lists cuisines, diets or meal types — they're fixed enumerations the
API validates against but never returns. So the filter options are **derived from whichever 50 recipes
are loaded**, by `getFilterGroups()` in the same module, and served from `/api/filters`. The values are
the API's own strings rather than hand-copied ones.

The options are also **faceted**: `/api/filters` takes the current selection and each dropdown lists
only the values still reachable. The one subtlety is which recipes each list is computed over — a
dropdown is faceted against every filter *except its own*:

```ts
const others = { ...filters };

delete others[type];

const reachable = all.filter((raw) => matchesSearch(raw, { query, filters: others }));
```

Including its own filter would collapse each list to the single value already selected, and there would
be no way to switch. Excluding it means every option offered leads to at least one recipe, so the
dropdowns can't produce a dead end. A selected value is kept in its list even if the other filters make
it unreachable, so it stays visible and clearable.

### Where the logic lives

The API decides, the page renders. Search, filtering and paging are all resolved behind `/api/recipes` —
it returns the matching page of recipes plus the `total`, the clamped `page` and the `pageCount`. The
load turns that into a heading and a pager whose Previous/Next are real `href`s:

```ts
pager: {
	page: list.page,
	pageCount: list.pageCount,
	previous: list.page > 1 ? recipesUrl({ query, filters, page: list.page - 1 }) : null,
	next: list.page < list.pageCount ? recipesUrl({ query, filters, page: list.page + 1 }) : null
}
```

So pagination is plain links that work without JavaScript, and an out-of-range `?page=` redirects to the
last real page during the load. `recipesUrl()` is shared with the page, which uses it for search and
filter navigation — one place that knows the URL shape.

The page keeps only what is genuinely interactive: the search input's value, the debounce, and `goto()`.
Nothing computes a result set client-side.

## Recipe form validation

`src/lib/recipe-form.ts` holds the rules, and `RecipeForm.svelte` renders the messages inline against
the field they belong to. Name is required and capped at 80 characters; category and area are required;
at least one step and at least one ingredient are required; a row with a measure but no ingredient name
is flagged on that row. An uploaded image is capped at 512 KB.

## Consuming the component library

`package.json` depends on `@utkarsh-mahajan/recipe-ui` as a normal package, and the components are plain
ES module imports — no script tags, no copying files into `static/`, no loader call:

```svelte
import '@utkarsh-mahajan/recipe-ui/components/recipe-card';
```

**Each component is imported by the file that renders it**, not registered centrally in
`+layout.svelte`. Registration is idempotent — `customElements.get(tag) || define(tag)` — and Vite
dedupes the module, so repeating an import across files costs nothing while a route only pays for the
components it actually uses. There is no barrel to import instead: the package root is the shared
runtime plus the event-payload types, not a re-export of the components.

The component modules reach `HTMLElement` through a `typeof window` guard and self-register behind a
`typeof customElements` check, so no `browser` guard is needed. SSR emits the un-upgraded tags, and they
upgrade during hydration.

**Everything crosses the boundary as primitives, events and slots.** No object or array props: lists
ride as comma-separated strings (`options`), so every prop is safe as a plain attribute regardless of
when the element upgrades. Attribute names are kebab-case (`recipe-id`, `is-favorite`, `slot-label`).
Interaction comes back as custom events, widened in one place (`src/lib/events.ts`) so no page repeats a
cast:

| Component | Props passed in | Events handled | Slots used |
| --- | --- | --- | --- |
| `recipe-card` | `recipe-id`, `name`, `image`, `category`, `area`, `is-favorite`, `is-owned` | `favorite-toggle`, `card-open` | `actions` |
| `search-bar` | `value`, `placeholder` | `search-input`, `search-submit`, `search-clear` | `filters` |
| `filter-select` | `label`, `value`, `options`, `any-label`, `searchable`, `search-label` | `filter-change` | `empty` |
| `meal-slot` | `day`, `slot-label`, `is-empty`, `add-label` | `slot-add` | default |
| `confirm-dialog` | `open`, `heading`, `confirm-label`, `cancel-label`, `tone` | `dialog-confirm`, `dialog-cancel` | default |

`filter-select` sits in `search-bar`'s `filters` slot and carries its own "no matches" message in its
`empty` slot, planned meals are passed into `meal-slot`'s default slot from the light DOM, and the
add-to-plan form is passed into `confirm-dialog`'s default slot.

Theming works because shadow DOM blocks selector matching but not inheritance: `src/app.css` declares
the `--rf-*` tokens on `:root` and their values reach inside every shadow root. See the
[library README](../recipe-ui/README.md#theming) for the token list.
