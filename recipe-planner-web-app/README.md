# recipe-planner-web-app — Recipe Finder & Meal Planner

A modern Recipe Finder & Meal Planner platform built with **Svelte 5**, **SvelteKit** and a
reusable **StencilJS** component library published to npm as
[`@utkarsh-mahajan/recipe-ui`](https://www.npmjs.com/package/@utkarsh-mahajan/recipe-ui).

Users can **discover recipes** from the Spoonacular API (search, filter by cuisine / diet /
meal type), **view full recipe details** (ingredients, instructions, tags), **manage their own
recipes** (create, edit, delete with validation), **favorite** any recipe for quick access, and
**plan meals for the week** by assigning recipes to breakfast, lunch or dinner across seven
days.

## Assumptions

- **There are no user accounts**, so favorites, your own recipes and the meal plan live in
  localStorage, per browser. Clearing site data resets them.
- **A meal slot holds more than one recipe**, so adding a recipe never silently replaces one already
  planned. Adding the same recipe to the same slot twice is a no-op.
- **API recipes are read-only.** Editing and deleting apply to recipes you created, so to change an API
  recipe you duplicate it into My recipes first.
- **Filters combine** with each other and with the search term
- **The filter dropdowns never offer a dead end.** Each lists only the values still reachable given the
  other filters and the search term.
- **Filter options come from the data**, not a hand-written list — Spoonacular validates cuisines, diets
  and meal types but has no endpoint that returns them.
- **An uploaded recipe image is stored inline** as a base64 `data:` URL, capped at 512 KB so a photo
  cannot blow the localStorage quota.
- **The Spoonacular key is server-only**, read through env, so it never reaches the
  browser.

## Scripts

| Command           | What it does                          |
| ----------------- | ------------------------------------- |
| `npm run dev`     | dev server on `http://localhost:5173` |
| `npm run build`   | production build                      |
| `npm run preview` | serve the production build            |
| `npm run check`   | `svelte-check`                        |

## Environment

```
SPOONACULAR_API_KEY=
```

Copy `.env.example` to `.env` and fill it in. The key is optional: without it the app serves a committed
fallback snapshot and behaves identically.

## Routes

| Route                   | Rendering     | Purpose                                          |
| ----------------------- | ------------- | ------------------------------------------------ |
| `/`                     | SSR           | Search, three filters, paginated grid            |
| `/recipes/[id]`         | SSR           | Recipe details — ingredients, instructions, tags |
| `/favorites`            | `ssr = false` | Favorite recipes                                 |
| `/my-recipes`           | `ssr = false` | Your own recipes                                 |
| `/my-recipes/new`       | `ssr = false` | Create a recipe                                  |
| `/my-recipes/[id]`      | `ssr = false` | One of your recipes, with edit and delete        |
| `/my-recipes/[id]/edit` | `ssr = false` | Edit a recipe                                    |
| `/planner`              | `ssr = false` | Weekly plan — 7 days × breakfast/lunch/dinner    |

The `ssr = false` routes read from localStorage, which the server cannot see. Everything that can be
server-rendered is.

## State

Three rune-based stores in `src/lib/stores/`, each persisting to localStorage through
`src/lib/storage.ts`:

| Store                  | Key             | Holds                                                     |
| ---------------------- | --------------- | --------------------------------------------------------- |
| `favorites.svelte.ts`  | `rf:favorites`  | recipe ids                                                |
| `my-recipes.svelte.ts` | `rf:my-recipes` | your recipes, in full                                     |
| `planner.svelte.ts`    | `rf:planner`    | `{ day: { breakfast: id[], lunch: id[], dinner: id[] } }` |

Favorites and the planner store ids only, so a recipe is never duplicated into two places that can
disagree.

## Data

Spoonacular's free tier allows only 50 points per day, 1 request per second and 2 concurrent
requests. Hitting the API for every search, filter change or detail view would exhaust the quota
within minutes. Instead the app fetches once at startup — a single bulk request for 50
recipes — and runs every subsequent operation (search, filtering, pagination, detail lookups)
against that in-memory server-side cache. This keeps the quota cost constant regardless of how many
users interact with the app, which is an acceptable trade-off as this is a demo assignment.

If even that one fetch fails — no key configured, quota already exhausted, or a network error — the
committed snapshot at `src/lib/server/fallback-recipes.json` kicks in so the app still works
identically without any external dependency.

All cache logic lives in `src/lib/server/recipes.ts`. Nothing outside `src/lib/server/` and
`src/routes/api/` imports it

Pages reach the data through four endpoints:

| Endpoint                                         | Returns                                      |
| ------------------------------------------------ | -------------------------------------------- |
| `GET /api/recipes?q=&meal=&cuisine=&diet=&page=` | `{ recipes, total, page, pageCount }`        |
| `GET /api/recipes?ids=a,b,c`                     | the same envelope, unpaged, for those ids    |
| `GET /api/recipes/[id]`                          | one recipe, or `404`                         |
| `GET /api/filters?q=&meal=&cuisine=&diet=`       | the filter options for the current selection |

Each filter is its own query parameter and a recipe has to match every one that is set, so
`?q=chicken&cuisine=Italian&diet=Vegetarian` narrows on all three at once. The filter options are
derived from the loaded recipes rather than hand-written, and each dropdown only offers values that
still lead to a result.

## Recipe form validation

`src/lib/recipe-form.ts` holds the rules and `RecipeForm.svelte` renders the messages inline against the
field they belong to. Name is required and capped at 180 characters; category and area are required; at
least one step and one ingredient are required. An uploaded image is capped at 512 KB.
