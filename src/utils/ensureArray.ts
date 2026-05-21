/** Coerce API / storage values to a real array (avoids `.map is not a function`). */
export function ensureArray<T>(value: unknown): T[] {
  return Array.isArray(value) ? value : [];
}
