// src/utils.ts

// Format numbers as money
export function currency(n: number) {
  return `$${n.toFixed(2)}`;
}

// Generate short order IDs
export function shortId() {
  const s = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `OW-${s}`;
}

// Convert slot ID to a readable label
export function slotLabel(id: string, SLOTS: { id: string; label: string }[]) {
  return SLOTS.find((s) => s.id === id)?.label || id;
}
