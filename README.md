# Recipe Finder & Meal Planner

A recipe discovery and weekly meal-planning app built with **Svelte 5 / SvelteKit**, using a
**StencilJS** web-component library published to npm and consumed as a package dependency.

## Deliverables

| | |
| --- | --- |
| Deployed application | _TODO: Vercel URL_ |
| npm package | https://www.npmjs.com/package/@utkarsh-mahajan/recipe-ui |
| GitHub repository | _TODO: GitHub URL_ |

```
.
├─ recipe-ui/                StencilJS component library → published as @utkarsh-mahajan/recipe-ui
└─ recipe-planner-web-app/   SvelteKit app → deployed to Vercel
```

Each folder has its own README:

- [recipe-ui/README.md](recipe-ui/README.md) — the five components, their props, events, slots and
  theming tokens.
- [recipe-planner-web-app/README.md](recipe-planner-web-app/README.md) — the app's routes, state, API
  and how it consumes the library.

## Features

- **Discovery** — debounced name search combined with any of three filters (meal type, cuisine, diet),
  with server-side pagination.
- **Details** — a dedicated page per recipe with an ingredient/measure table, numbered instructions and
  tags.
- **My recipes** — create, edit and delete your own recipes, with inline validation. Any API recipe can
  be duplicated into your own collection, which is what makes it editable.
- **Favorites** — toggle from any card or detail page, and a page listing all of them.
- **Planner** — a 7 × 3 grid (day × breakfast/lunch/dinner); add a recipe to any slot, remove it from
  the card.

## Prerequisites

- Node 20+
- npm
- A free [Spoonacular](https://spoonacular.com/food-api) API key — **optional**; without one the app
  serves a committed fallback snapshot and every feature still works

## Setup

```bash
git clone <repo-url> && cd "Svelte Assignment"
```

**1. Install the app.** It pulls the component library from npm.

```bash
cd recipe-planner-web-app && npm install
```

**2. Add your API key.**

```bash
cp .env.example .env
```

Then put your key in `recipe-planner-web-app/.env`:

```
SPOONACULAR_API_KEY=your-key-here
```

Skip this step to run on the fallback snapshot instead.

## Starting the development server

```bash
cd recipe-planner-web-app && npm run dev
```

The app runs at `http://localhost:5173`.

Other commands:

```bash
npm run check      # svelte-check: types and component attributes
npm run build      # production build
npm run preview    # serve the production build
```

### Working on the library too

Only needed if you are changing the components. It builds `recipe-ui` and points the app at the local
build instead of the registry:

```bash
cd recipe-ui && npm install && npm run build && npm link
```

```bash
cd ../recipe-planner-web-app && npm link @utkarsh-mahajan/recipe-ui
```

Undo it with `npm unlink --no-save @utkarsh-mahajan/recipe-ui && npm install`.

## Assumptions

- **There are no user accounts**, so favorites, your own recipes and the meal plan are stored per
  browser in localStorage. Clearing site data resets them, and they do not follow you to another device.
- **A meal slot holds more than one recipe.** Breakfast on Monday can have several recipes in it — a
  real meal is often more than one dish, and it also means adding a recipe never silently replaces
  something already planned. Adding the same recipe to the same slot twice is a no-op.
- **API recipes are read-only.** The assignment asks for editing and deleting *recipes created by the
  user*, so to change an API recipe you duplicate it into My recipes first; the copy is yours.
- **Search matches the recipe name**, over the 50 cached recipes, not the whole Spoonacular catalogue.
  The free plan makes fetching the catalogue per keystroke impractical, and a fixed working set keeps
  results stable.
- **Filters combine with each other and with the search term.** Every one that is set has to hold, so
  `?q=chicken&cuisine=Italian&diet=Vegetarian` narrows on all three at once.
- **The filter dropdowns never offer a dead end.** Each lists only the values still reachable given the
  other filters and the search term, so the only way to reach an empty result is a search term that
  matches nothing.
- **Filter options come from the data, not a hand-written list.** Spoonacular validates cuisines, diets
  and meal types against fixed enumerations but has no endpoint that returns them, so the options are
  derived from the loaded recipes.
- **An uploaded recipe image is stored inline** as a base64 `data:` URL, next to the recipe, so it
  renders straight from localStorage with nothing to host. localStorage holds ~5 MB per origin and
  base64 adds about a third, so the form caps an upload at 512 KB rather than let a photo silently blow
  the quota.
- **The Spoonacular key is server-only.** It lives in `recipe-planner-web-app/.env` (gitignored) and, in
  production, a Vercel environment variable. It is read through `$env/dynamic/private` and never reaches
  the browser.

## How the requirements are met

| Requirement | Where |
| --- | --- |
| Search, browse, filter, organised display | `/` — `search-bar` + three `filter-select`s + paginated `recipe-card` grid |
| Recipe details page | `/recipes/[id]` and `/my-recipes/[id]` |
| Add, edit, delete own recipes, with validation | `/my-recipes/new`, `/my-recipes/[id]/edit`; rules in `recipe-planner-web-app/src/lib/recipe-form.ts` |
| Favorites: add, remove, view all | `favorite-toggle` on every card and detail page; `/favorites` |
| Weekly meal plan: create, assign, modify, remove | `/planner` — 7 days × breakfast/lunch/dinner |
| Library published to npm | [`@utkarsh-mahajan/recipe-ui`](https://www.npmjs.com/package/@utkarsh-mahajan/recipe-ui) |
| App consumes the published package | `recipe-planner-web-app/package.json` dependency; no imports from `../recipe-ui/src` |
| Data passed in as properties | kebab-case attributes on every component — see the table in [recipe-planner-web-app/README.md](recipe-planner-web-app/README.md#consuming-the-component-library) |
| Custom events handled in SvelteKit | `favorite-toggle`, `card-open`, `search-input`, `search-submit`, `search-clear`, `filter-change`, `slot-add`, `dialog-confirm`, `dialog-cancel` |
| Slots used | `search-bar`'s `filters`, `filter-select`'s `empty`, `recipe-card`'s `actions`, `meal-slot`'s default, `confirm-dialog`'s default |
| Components part of the main experience | all five are on the primary paths, not a demo page |

## Versioning

The library follows semver and the app depends on `^1.0.0`. `1.0.0` is the first stable release: the
component API is settled, so changing or removing an attribute, event or CSS custom property needs a
major bump, adding one is a minor bump, and internal styling or markup fixes are a patch. Published
versions are immutable, so every change ships as a new version and the app's dependency range moves
with it.

## Publishing the library

```bash
cd recipe-ui
npm pack --dry-run                  # confirm what ships
npx @arethetypeswrong/cli --pack    # confirm every exports condition resolves
npm publish
```

Both checks belong *before* the first publish, since a published version cannot be replaced.

`package.json` already depends on the registry range, so the app only needs a reinstall:

```bash
cd ../recipe-planner-web-app && npm install
```

`ls -la recipe-planner-web-app/node_modules/@utkarsh-mahajan/` should show a real directory, not a
symlink — that is what proves the app consumes the published package.

## Deploying

Import the repository in Vercel with **root directory `recipe-planner-web-app`**, and add
`SPOONACULAR_API_KEY` as an environment variable. `adapter-auto` handles the rest. Without the variable
the deploy still works — it just serves the fallback snapshot.
