# @utkarsh-mahajan/recipe-ui

Web components for the Recipe Finder & Meal Planner app, built with
[StencilJS](https://stenciljs.com/). Five components, all using shadow DOM and themeable through CSS
custom properties.

## Install

```bash
npm install @utkarsh-mahajan/recipe-ui
```

## Usage

Import each component in the file that renders it. The module registers its own tag as a side effect, so
there is nothing to call:

```js
import "@utkarsh-mahajan/recipe-ui/components/recipe-card";
```

The package builds only Stencil's `dist-custom-elements` target, which the Stencil docs recommend for
consumers that already run a bundler. The components share one runtime chunk through static imports and
never fetch anything at runtime, so a bundler code-splits them like any other dependency and
registration happens synchronously at module evaluation.

## Components

| Tag                | Purpose                                                             |
| ------------------ | ------------------------------------------------------------------- |
| `<recipe-card>`    | one recipe in a grid, with a favorite toggle and an `actions` slot  |
| `<search-bar>`     | search input with a clear button and a `filters` slot               |
| `<filter-select>`  | single-select dropdown, optionally with type-ahead                  |
| `<meal-slot>`      | one slot of a meal plan, holding cards passed in from the light DOM |
| `<confirm-dialog>` | modal built on native `<dialog>`, for confirmations and short forms |

### `<recipe-card>`

| Attribute     | Type      | Default  |
| ------------- | --------- | -------- |
| `recipe-id`   | `string`  | required |
| `name`        | `string`  | required |
| `image`       | `string`  | —        |
| `category`    | `string`  | —        |
| `area`        | `string`  | —        |
| `is-favorite` | `boolean` | `false`  |
| `is-owned`    | `boolean` | `false`  |

Events: `favorite-toggle` (`{ recipeId, isFavorite }`, already inverted), `card-open` (`{ recipeId }`).
Slot: `actions` — collapses when empty.

### `<search-bar>`

| Attribute     | Type     | Default             |
| ------------- | -------- | ------------------- |
| `value`       | `string` | `''`                |
| `placeholder` | `string` | `'Search recipes…'` |
| `label`       | `string` | `'Search recipes'`  |

Events: `search-input` (`{ value }`, every keystroke), `search-submit` (`{ value }`), `search-clear`.
Slot: `filters`.

`search-input` is undebounced on purpose — debouncing belongs next to the consumer's fetch, where the
request can also be cancelled.

### `<filter-select>`

Single-select combobox with type-to-search. Sits in `search-bar`'s `filters` slot.

| Attribute      | Type                     | Default                    |
| -------------- | ------------------------ | -------------------------- |
| `label`        | `string`                 | `''`                       |
| `value`        | `string`                 | `''`                       |
| `options`      | comma-separated `string` | `''`                       |
| `any-label`    | `string`                 | `'Any'`                    |
| `searchable`   | `boolean`                | `true`                     |
| `search-label` | `string`                 | `'Type to filter options'` |

Event: `filter-change` (`{ value }`, `''` when cleared). The empty string is a real option rendered as
`any-label`, so clearing goes through the same event as choosing. Only fires when the value changes.

Set `any-label=""` to drop that option and make the select required — useful when every state is a real
choice, like picking a day and a meal.

Set `searchable="false"` to drop the type-ahead box, for lists short enough to just read. Keyboard
handling is unaffected: arrow keys move the active option, Enter selects, Escape closes, clicking
outside closes. Slot: `empty` — the message shown when the type-ahead matches nothing.

### `<meal-slot>`

| Attribute    | Type      | Default      |
| ------------ | --------- | ------------ |
| `day`        | `string`  | required     |
| `slot-label` | `string`  | required     |
| `is-empty`   | `boolean` | `false`      |
| `add-label`  | `string`  | `'Add meal'` |

Event: `slot-add` (`{ day, slotLabel }`). Slot: default — the planned `recipe-card`s, passed in from
the light DOM. Removing a planned meal is the consumer's job — put the control in the card's `actions`
slot.

### `<confirm-dialog>`

| Attribute       | Type                    | Default           |
| --------------- | ----------------------- | ----------------- |
| `open`          | `boolean`               | `false`           |
| `heading`       | `string`                | `'Are you sure?'` |
| `confirm-label` | `string`                | `'Confirm'`       |
| `cancel-label`  | `string`                | `'Cancel'`        |
| `tone`          | `'default' \| 'danger'` | `'default'`       |

Events: `dialog-confirm`, `dialog-cancel`. Slot: default — the body, between the heading and the
buttons.

Built on the native `<dialog>` via `showModal()`, so focus trapping and Escape come from the platform.
Escape and backdrop clicks emit `dialog-cancel` rather than closing, keeping `open` the single source
of truth.

## Theming

Set these on `:root` and they apply everywhere:

| Token                               | Fallback                               |
| ----------------------------------- | -------------------------------------- |
| `--rf-font-family`                  | `ui-sans-serif, system-ui, sans-serif` |
| `--rf-line-height`                  | `1.5`                                  |
| `--rf-text`                         | `#1f2328`                              |
| `--rf-muted`                        | `#6b7280`                              |
| `--rf-surface`                      | `#ffffff`                              |
| `--rf-muted-surface`                | `#f3f4f6`                              |
| `--rf-border`                       | `#e4e6ea`                              |
| `--rf-accent`                       | `#d9480f`                              |
| `--rf-on-accent`                    | `#ffffff`                              |
| `--rf-danger`                       | `#e03131`                              |
| `--rf-radius-lg`                    | `0.75rem`                              |
| `--rf-shadow` / `--rf-shadow-hover` | card shadows                           |

## TypeScript

The bare import (`@utkarsh-mahajan/recipe-ui`) is **types-only** — it has no runtime module. Use it to
import event detail types and prop types. Component registration is always a per-component side-effect
import (see [Usage](#usage)).

| Type                   | Component          | Event / Prop                   |
| ---------------------- | ------------------ | ------------------------------ |
| `FavoriteToggleDetail` | `<recipe-card>`    | `favorite-toggle` event detail |
| `CardOpenDetail`       | `<recipe-card>`    | `card-open` event detail       |
| `SearchInputDetail`    | `<search-bar>`     | `search-input` event detail    |
| `SearchSubmitDetail`   | `<search-bar>`     | `search-submit` event detail   |
| `FilterChangeDetail`   | `<filter-select>`  | `filter-change` event detail   |
| `SlotAddDetail`        | `<meal-slot>`      | `slot-add` event detail        |
| `ConfirmDialogTone`    | `<confirm-dialog>` | `tone` prop type               |

```ts
import type {
  FavoriteToggleDetail,
  CardOpenDetail,
} from "@utkarsh-mahajan/recipe-ui";
```

## Development

```bash
npm install
npm run build     # emits dist/components and dist/types
npm start         # watch mode
```

To try a change in the app before publishing, link the local build:

```bash
npm link          # then: cd ../recipe-planner-web-app && npm link @utkarsh-mahajan/recipe-ui
```
