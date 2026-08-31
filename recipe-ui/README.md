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
import '@utkarsh-mahajan/recipe-ui/components/recipe-card';
```

Registration is idempotent and bundlers dedupe the module, so importing the same component from several
files costs nothing and each route only pulls in what it uses. There is no barrel export — the package
root is the shared runtime and the event-payload types, not a re-export of the components, so
`import '@utkarsh-mahajan/recipe-ui'` registers nothing.

No `browser` guard is needed. The modules reach `HTMLElement` through a `typeof window` check and
self-register behind a `typeof customElements` check, so they are safe during SSR, which renders the
un-upgraded tags and lets them upgrade on hydration.

The package builds only Stencil's `dist-custom-elements` target, which the Stencil docs recommend for
consumers that already run a bundler. The components share one runtime chunk through static imports and
never fetch anything at runtime, so a bundler code-splits them like any other dependency and
registration happens synchronously at module evaluation.

## Components

| Tag | Purpose |
| --- | --- |
| `<recipe-card>` | one recipe in a grid, with a favorite toggle and an `actions` slot |
| `<search-bar>` | search input with a clear button and a `filters` slot |
| `<filter-select>` | single-select dropdown, optionally with type-ahead |
| `<meal-slot>` | one slot of a meal plan, holding cards passed in from the light DOM |
| `<confirm-dialog>` | modal built on native `<dialog>`, for confirmations and short forms |

All props are primitives, so they work as plain attributes no matter when the element upgrades.
Attribute names are the kebab-case form of the prop. Richer content goes through slots.

### `<recipe-card>`

| Attribute | Type | Default |
| --- | --- | --- |
| `recipe-id` | `string` | required |
| `name` | `string` | required |
| `image` | `string` | — |
| `category` | `string` | — |
| `area` | `string` | — |
| `is-favorite` | `boolean` | `false` |
| `is-owned` | `boolean` | `false` |

Events: `favorite-toggle` (`{ recipeId, isFavorite }`, already inverted), `card-open` (`{ recipeId }`).
Slot: `actions` — collapses when empty.

### `<search-bar>`

| Attribute | Type | Default |
| --- | --- | --- |
| `value` | `string` | `''` |
| `placeholder` | `string` | `'Search recipes…'` |
| `label` | `string` | `'Search recipes'` |

Events: `search-input` (`{ value }`, every keystroke), `search-submit` (`{ value }`), `search-clear`.
Slot: `filters`.

`search-input` is undebounced on purpose — debouncing belongs next to the consumer's fetch, where the
request can also be cancelled.

### `<filter-select>`

Single-select combobox with type-to-search. Sits in `search-bar`'s `filters` slot.

| Attribute | Type | Default |
| --- | --- | --- |
| `label` | `string` | `''` |
| `value` | `string` | `''` |
| `options` | comma-separated `string` | `''` |
| `any-label` | `string` | `'Any'` |
| `searchable` | `boolean` | `true` |
| `search-label` | `string` | `'Type to filter options'` |

Event: `filter-change` (`{ value }`, `''` when cleared). The empty string is a real option rendered as
`any-label`, so clearing goes through the same event as choosing. Only fires when the value changes.

Set `any-label=""` to drop that option and make the select required — useful when every state is a real
choice, like picking a day and a meal.

Set `searchable="false"` to drop the type-ahead box, for lists short enough to just read. Keyboard
handling is unaffected: arrow keys move the active option, Enter selects, Escape closes, clicking
outside closes. Slot: `empty` — the message shown when the type-ahead matches nothing.

The host is `inline-flex` and sizes to its content, but the trigger fills whatever width the host is
given — so `filter-select { display: flex }` from the light DOM stretches it across a form row. To line
several rows up, set `--rf-filter-label-width` to reserve a fixed label column; without it the label is
as wide as its text and the triggers start at different offsets.

### `<meal-slot>`

| Attribute | Type | Default |
| --- | --- | --- |
| `day` | `string` | required |
| `slot-label` | `string` | required |
| `is-empty` | `boolean` | `false` |
| `add-label` | `string` | `'Add meal'` |

Event: `slot-add` (`{ day, slotLabel }`). Slot: default — the planned `recipe-card`s, passed in from
the light DOM. Removing a planned meal is the consumer's job — put the control in the card's `actions`
slot.

### `<confirm-dialog>`

| Attribute | Type | Default |
| --- | --- | --- |
| `open` | `boolean` | `false` |
| `heading` | `string` | `'Are you sure?'` |
| `confirm-label` | `string` | `'Confirm'` |
| `cancel-label` | `string` | `'Cancel'` |
| `tone` | `'default' \| 'danger'` | `'default'` |

Events: `dialog-confirm`, `dialog-cancel`. Slot: default — the body, between the heading and the
buttons.

Built on the native `<dialog>` via `showModal()`, so focus trapping and Escape come from the platform.
Escape and backdrop clicks emit `dialog-cancel` rather than closing, keeping `open` the single source
of truth.

The dialog sets `overflow: visible`, overriding the `overflow: auto` in the UA stylesheet, so a
`filter-select` in the default slot can open its dropdown past the dialog's edge instead of being
clipped. The trade is that the dialog does not scroll — it is meant for short content.

## Theming

Shadow DOM blocks selector matching but not inheritance, so **values** reach inside the components
while **rules** do not. Set these on `:root` and they apply everywhere:

| Token | Fallback |
| --- | --- |
| `--rf-font-family` | `ui-sans-serif, system-ui, sans-serif` |
| `--rf-line-height` | `1.5` |
| `--rf-text` | `#1f2328` |
| `--rf-muted` | `#6b7280` |
| `--rf-surface` | `#ffffff` |
| `--rf-muted-surface` | `#f3f4f6` |
| `--rf-border` | `#e4e6ea` |
| `--rf-accent` | `#d9480f` |
| `--rf-on-accent` | `#ffffff` |
| `--rf-danger` | `#e03131` |
| `--rf-radius-lg` | `0.75rem` |
| `--rf-shadow` / `--rf-shadow-hover` | card shadows |



## TypeScript

Event payload types are exported from the package root:

```ts
import type {
	FavoriteToggleDetail,
	CardOpenDetail,
	SearchInputDetail,
	SearchSubmitDetail,
	FilterChangeDetail,
	SlotAddDetail,
	ConfirmDialogTone
} from '@utkarsh-mahajan/recipe-ui';
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



## Publishing

```bash
npm pack --dry-run                  # confirm what ships
npx @arethetypeswrong/cli --pack    # confirm every exports condition resolves
npm publish
```

`files` is `["dist/"]`, so only the build output and this README ship. `publishConfig.access` is
`public`, which scoped packages need in order to publish at all.

Versioning is semver via `npm version patch|minor|major`. Changing or removing an attribute, event
or CSS custom property is a breaking change and gets a major bump; adding one is a minor bump;
internal styling and markup fixes get a patch. Published versions are immutable, so every change
ships as a new version and the app moves to it.

## License

MIT
