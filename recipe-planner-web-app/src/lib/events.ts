import type {
  CardOpenDetail,
  FavoriteToggleDetail,
  FilterChangeDetail,
  SearchInputDetail,
  SearchSubmitDetail,
} from "@utkarsh-mahajan/recipe-ui";

function getDetail<T>(event: Event): T {
  return (event as CustomEvent<T>).detail;
}

export function getSearchValue(event: Event): string {
  return getDetail<SearchInputDetail | SearchSubmitDetail>(event).value;
}

export function getFilterValue(event: Event): string {
  return getDetail<FilterChangeDetail>(event).value;
}

export function getOpenedRecipe(event: Event): CardOpenDetail {
  return getDetail<CardOpenDetail>(event);
}

export function getFavoriteToggle(event: Event): FavoriteToggleDetail {
  return getDetail<FavoriteToggleDetail>(event);
}
