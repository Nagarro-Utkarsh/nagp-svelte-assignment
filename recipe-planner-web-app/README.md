# recipe-planner-web-app — Recipe Finder & Meal Planner

The SvelteKit 5 application. It consumes the component library as the published npm package
[`@utkarsh-mahajan/recipe-ui`](https://www.npmjs.com/package/@utkarsh-mahajan/recipe-ui), not from
source.

Setup, prerequisites and the deployed URL are in the [root README](../README.md).

## Assumptions

- **There are no user accounts**, so favorites, your own recipes and the meal plan live in
  localStorage, per browser. Clearing site data resets them.
- **A meal slot holds more than one recipe**, so adding a recipe never silently replaces one already
  planned. Adding the same recipe to the same slot twice is a no-op.
- **API recipes are read-only.** Editing and deleting apply to recipes you created, so to change an API
  recipe you duplicate it into My recipes first.
- **Search matches the recipe name** over the 50 cached recipes, not the whole Spoonacular catalogue.
- **Filters combine** with each other and with the search term — every one that is set has to hold.
- **The filter dropdowns never offer a dead end.** Each lists only the values still reachable given the
  other filters and the search term.
- **Filter options come from the data**, not a hand-written list — Spoonacular validates cuisines, diets
  and meal types but has no endpoint that returns them.
- **An uploaded recipe image is stored inline** as a base64 `data:` URL, capped at 512 KB so a photo
  cannot blow the localStorage quota.
- **The Spoonacular key is server-only**, read through `$env/dynamic/private`, so it never reaches the
  browser.

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | dev server on `http://localhost:5173` |
| `npm run build` | production build |
| `npm run preview` | serve the production build |
| `npm run check` | `svelte-check` |

## Environment

```
SPOONACULAR_API_KEY=
```

Copy `.env.example` to `.env` and fill it in. The key is optional: without it the app serves a committed
fallback snapshot and behaves identically. `.env` is gitignored, and the key is read through
`$env/dynamic/private`, so it never reaches the browser.

## Routes

| Route | Rendering | Purpose |
| --- | --- | --- |
| `/` | SSR | Search, three filters, paginated grid |
| `/recipes/[id]` | SSR | Recipe details — ingredients, instructions, tags |
| `/favorites` | `ssr = false` | Favorite recipes |
| `/my-recipes` | `ssr = false` | Your own recipes |
| `/my-recipes/new` | `ssr = false` | Create a recipe |
| `/my-recipes/[id]` | `ssr = false` | One of your recipes, with edit and delete |
| `/my-recipes/[id]/edit` | `ssr = false` | Edit a recipe |
| `/planner` | `ssr = false` | Weekly plan — 7 days × breakfast/lunch/dinner |

The `ssr = false` routes read from localStorage, which the server cannot see. Everything that can be
server-rendered is.

## State

Three rune-based stores in `src/lib/stores/`, each persisting to localStorage through
`src/lib/storage.ts`:

| Store | Key | Holds |
| --- | --- | --- |
| `favorites.svelte.ts` | `rf:favorites` | recipe ids |
| `my-recipes.svelte.ts` | `rf:my-recipes` | your recipes, in full |
| `planner.svelte.ts` | `rf:planner` | `{ day: { breakfast: id[], lunch: id[], dinner: id[] } }` |

Favorites and the planner store ids only, so a recipe is never duplicated into two places that can
disagree.

## Data

Recipes come from the [Spoonacular API](https://spoonacular.com/food-api), fetched once into a
server-side cache of 50 recipes. If that fetch fails — no key, quota exhausted, network error — the
committed snapshot at `src/lib/server/fallback-recipes.json` is used instead and the app behaves
identically.

Search, filtering, pagination and detail lookups all run over that cache in
`src/lib/server/recipes.ts`. Nothing outside `src/lib/server/` and `src/routes/api/` imports it —
`$lib/server` is a SvelteKit boundary, so importing it from client code is a build error, which is what
keeps the key and the dataset off the wire.

Pages reach the data through four endpoints:

| Endpoint | Returns |
| --- | --- |
| `GET /api/recipes?q=&meal=&cuisine=&diet=&page=` | `{ recipes, total, page, pageCount }` |
| `GET /api/recipes?ids=a,b,c` | the same envelope, unpaged, for those ids |
| `GET /api/recipes/[id]` | one recipe, or `404` |
| `GET /api/filters?q=&meal=&cuisine=&diet=` | the filter options for the current selection |

Each filter is its own query parameter and a recipe has to match every one that is set, so
`?q=chicken&cuisine=Italian&diet=Vegetarian` narrows on all three at once. The filter options are
derived from the loaded recipes rather than hand-written, and each dropdown only offers values that
still lead to a result.

The `?ids=` form exists because favorites and the planner keep ids in localStorage while the recipes
live on the server, so neither side can resolve them alone.

## Recipe form validation

`src/lib/recipe-form.ts` holds the rules and `RecipeForm.svelte` renders the messages inline against the
field they belong to. Name is required and capped at 80 characters; category and area are required; at
least one step and one ingredient are required. An uploaded image is capped at 512 KB.

## Consuming the component library

`package.json` depends on `@utkarsh-mahajan/recipe-ui` as a normal package, and each component is a
plain ES module import in the file that renders it:

```svelte
import '@utkarsh-mahajan/recipe-ui/components/recipe-card';
```

Everything crosses the boundary as attributes, custom events and slots. All props are primitives — lists
ride as comma-separated strings — so every attribute is safe regardless of when the element upgrades.
Attribute names are kebab-case. Event payloads are read in one place, `src/lib/events.ts`.

| Component | Props passed in | Events handled | Slots used |
| --- | --- | --- | --- |
| `recipe-card` | `recipe-id`, `name`, `image`, `category`, `area`, `is-favorite`, `is-owned` | `favorite-toggle`, `card-open` | `actions` |
| `search-bar` | `value`, `placeholder`, `label` | `search-input`, `search-submit`, `search-clear` | `filters` |
| `filter-select` | `label`, `value`, `options`, `any-label`, `searchable`, `search-label` | `filter-change` | `empty` |
| `meal-slot` | `day`, `slot-label`, `is-empty`, `add-label` | `slot-add` | default |
| `confirm-dialog` | `open`, `heading`, `confirm-label`, `cancel-label`, `tone` | `dialog-confirm`, `dialog-cancel` | default |

`filter-select` sits in `search-bar`'s `filters` slot and carries its own "no matches" message in its
`empty` slot, planned meals are passed into `meal-slot`'s default slot from the light DOM, and the
add-to-plan form is passed into `confirm-dialog`'s default slot.

Theming works because shadow DOM blocks selector matching but not inheritance: `src/app.css` declares
the `--rf-*` tokens on `:root` and their values reach inside every shadow root. See the
[library README](../recipe-ui/README.md#theming) for the token list.
