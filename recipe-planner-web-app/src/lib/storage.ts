import { browser } from "$app/environment";

export function loadPersisted<T>(key: string, fallback: T): T {
  if (!browser) return fallback;

  try {
    const raw = localStorage.getItem(key);

    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function savePersisted<T>(key: string, data: T): void {
  if (!browser) return;

  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch {
    return;
  }
}
