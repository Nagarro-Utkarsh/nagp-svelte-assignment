# Recipe Finder & Meal Planner

A recipe discovery and weekly meal-planning app built with **Svelte 5 / SvelteKit**, using a
**StencilJS** web-component library published to npm and consumed as a package dependency.

## Deliverables

| Deliverable | Link |
| --- | --- |
| SvelteKit application — source | [`recipe-planner-web-app/`](recipe-planner-web-app) |
| StencilJS component library — source | [`recipe-ui/`](recipe-ui) |
| npm package | https://www.npmjs.com/package/@utkarsh-mahajan/recipe-ui |
| Deployed application | https://recipe-planner-web-app.vercel.app |
| GitHub repository | https://github.com/Nagarro-Utkarsh/nagp-svelte-assignment |


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

  
## Publishing the library

```bash
cd recipe-ui
npm pack --dry-run                  # confirm what ships
npm publish
```

Both checks belong *before* the first publish, since a published version cannot be replaced.

`package.json` already depends on the registry range, so the app needs an explicit install of the package to pick up the new version:

```bash
cd ../recipe-planner-web-app && npm install @utkarsh-mahajan/recipe-ui
```