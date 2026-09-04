import { loadPersisted, savePersisted } from "$lib/storage";

const KEY = "rf:favorites";

function sanitize(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((id): id is string => typeof id === "string")
    : [];
}

let ids = $state.raw<string[]>(sanitize(loadPersisted<string[]>(KEY, [])));

function persist() {
  savePersisted(KEY, ids);
}

export const favorites = {
  get ids() {
    return ids;
  },
  has(id: string) {
    return ids.includes(id);
  },
  set(id: string, isFavorite: boolean) {
    if (isFavorite === ids.includes(id)) return;

    ids = isFavorite ? [...ids, id] : ids.filter((current) => current !== id);
    persist();
  },
  toggle(id: string) {
    favorites.set(id, !ids.includes(id));
  },
  purge(id: string) {
    favorites.set(id, false);
  },
};
