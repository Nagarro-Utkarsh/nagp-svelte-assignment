# recipe-card

<!-- Auto Generated Below -->

## Properties

| Property                | Attribute     | Description | Type                  | Default     |
| ----------------------- | ------------- | ----------- | --------------------- | ----------- |
| `area`                  | `area`        |             | `string \| undefined` | `undefined` |
| `category`              | `category`    |             | `string \| undefined` | `undefined` |
| `image`                 | `image`       |             | `string \| undefined` | `undefined` |
| `isFavorite`            | `is-favorite` |             | `boolean`             | `false`     |
| `isOwned`               | `is-owned`    |             | `boolean`             | `false`     |
| `name` _(required)_     | `name`        |             | `string`              | `undefined` |
| `recipeId` _(required)_ | `recipe-id`   |             | `string`              | `undefined` |

## Events

| Event             | Description | Type                                |
| ----------------- | ----------- | ----------------------------------- |
| `card-open`       |             | `CustomEvent<CardOpenDetail>`       |
| `favorite-toggle` |             | `CustomEvent<FavoriteToggleDetail>` |

## Slots

| Slot        | Description |
| ----------- | ----------- |
| `"actions"` |             |

---

_Built with [StencilJS](https://stenciljs.com/)_
