// src/utils.ts

// Money format
export function currency(n: number) {
  return `$${n.toFixed(2)}`;
}

// Short order IDs
export function shortId() {
  const s = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `OW-${s}`;
}

// Safe localStorage helpers
export function loadJSON<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function saveJSON(key: string, data: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch {
    // ignore
  }
}
