/**
 * Reads a CSS custom property that contains a font stack.
 *
 * next/font exposes hashed family names through a variable; canvas text needs the
 * resolved list, not the variable name. Falls back cleanly during SSR or when the
 * token is missing.
 */
export function readFontStack(cssVar: string, fallback: string): string {
  if (typeof window === "undefined" || typeof document === "undefined") return fallback;
  try {
    const raw = getComputedStyle(document.documentElement).getPropertyValue(cssVar).trim();
    return raw ? `${raw}, ${fallback}` : fallback;
  } catch {
    return fallback;
  }
}
