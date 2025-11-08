import { MaterialCommunityIcons } from '@expo/vector-icons';

// Canonical category definitions with minimal, clean icons and hard-coded colors
// Colors chosen for dark backgrounds with decent contrast; adjust as desired.
// Keep total of 8 chips by merging similar categories:
// - bills + utilities -> bills-utilities
// - health + fitness -> health-fitness
export type CategoryId =
  | 'shopping'
  | 'bills-utilities'
  | 'transport'
  | 'entertainment'
  | 'health-fitness'
  | 'food'
  | 'home'
  | 'uncategorized';

export type CategoryDef = {
  id: CategoryId;
  name: string;
  color: string; // canonical color used in charts/cards
  // icon provider info; rendered where needed via set/name
  icon: { set: 'MaterialCommunityIcons'; name: keyof typeof MaterialCommunityIcons.glyphMap };
};

export const CATEGORIES: CategoryDef[] = [
  { id: 'shopping', name: 'Shopping', color: '#7de7ffff', icon: { set: 'MaterialCommunityIcons', name: 'shopping' } },
  { id: 'bills-utilities', name: 'Bills & Utilities', color: '#ffd000ff', icon: { set: 'MaterialCommunityIcons', name: 'file-document' } },
  { id: 'transport', name: 'Transport', color: '#ff5900ff', icon: { set: 'MaterialCommunityIcons', name: 'car' } },
  { id: 'entertainment', name: 'Entertainment', color: '#09ff00ff', icon: { set: 'MaterialCommunityIcons', name: 'movie' } },
  { id: 'health-fitness', name: 'Health & Fitness', color: '#00ffa6ff', icon: { set: 'MaterialCommunityIcons', name: 'heart-pulse' } },
  { id: 'food', name: 'Food', color: '#ffa60bff', icon: { set: 'MaterialCommunityIcons', name: 'food' } },
  { id: 'home', name: 'Home', color: '#61caffff', icon: { set: 'MaterialCommunityIcons', name: 'home' } },
  { id: 'uncategorized', name: 'Uncategorized', color: '#547ab3ff', icon: { set: 'MaterialCommunityIcons', name: 'dots-horizontal' } },
];

export const CATEGORY_MAP = Object.fromEntries(
  CATEGORIES.map((c) => [c.id, c])
) as Record<CategoryId, CategoryDef> & Record<string, CategoryDef>;

// Backward-compat aliases from old ids to merged ids
const CATEGORY_ALIASES: Record<string, CategoryId> = {
  bills: 'bills-utilities',
  utilities: 'bills-utilities',
  health: 'health-fitness',
  fitness: 'health-fitness',
};

export function normalizeCategoryId(category?: string): CategoryId {
  if (!category) return 'uncategorized';
  return (CATEGORY_ALIASES[category] as CategoryId) || (category as CategoryId) || 'uncategorized';
}

export function getCategoryColor(category?: string) {
  const id = normalizeCategoryId(category);
  return CATEGORY_MAP[id]?.color ?? CATEGORY_MAP['uncategorized'].color;
}

export function categoryExists(category?: string) {
  if (!category) return false;
  const id = normalizeCategoryId(category);
  return Boolean(CATEGORY_MAP[id]);
}

// Compute a darker shade of a hex color (RGB) while preserving alpha if present.
// amount in [0,1]; 0 = no change, 1 = black.
function darkenHex(hex: string, amount = 0.2) {
  if (!hex) return hex;
  const h = hex.trim();
  const m = /^#([0-9a-fA-F]{6})([0-9a-fA-F]{2})?$/i.exec(h);
  if (!m) return hex; // fallback if unexpected format
  const rgb = m[1];
  const alpha = m[2] ?? '';
  const r = parseInt(rgb.slice(0, 2), 16);
  const g = parseInt(rgb.slice(2, 4), 16);
  const b = parseInt(rgb.slice(4, 6), 16);
  const dr = Math.round(r * (1 - amount));
  const dg = Math.round(g * (1 - amount));
  const db = Math.round(b * (1 - amount));
  const toHex = (n: number) => n.toString(16).padStart(2, '0');
  return `#${toHex(dr)}${toHex(dg)}${toHex(db)}${alpha}` as const;
}

// Slightly darker color for the chip background so the base icon color pops.
export function getCategoryChipColor(category?: string, amount = 0.45) {
  const base = getCategoryColor(category);
  return darkenHex(base, amount);
}

// Try to find a category id that matches a given color (used for migration/fallback when category is missing).
export function findCategoryByColor(color?: string): CategoryId | undefined {
  if (!color) return undefined;
  const norm = (hex: string) => hex.trim().toLowerCase().replace('#', '').slice(0, 6);
  const target = norm(color);
  // Exact match first
  for (const c of CATEGORIES) {
    if (norm(c.color) === target) return c.id;
  }
  // Approximate match: pick the closest by RGB distance if reasonably near
  const toRGB = (hex: string) => {
    const h = norm(hex);
    const r = parseInt(h.slice(0, 2), 16);
    const g = parseInt(h.slice(2, 4), 16);
    const b = parseInt(h.slice(4, 6), 16);
    return { r, g, b };
  };
  const t = toRGB(color);
  let best: { id: CategoryId; d: number } | null = null;
  for (const c of CATEGORIES) {
    const cc = toRGB(c.color);
    const d = Math.sqrt((t.r - cc.r) ** 2 + (t.g - cc.g) ** 2 + (t.b - cc.b) ** 2);
    if (!best || d < best.d) best = { id: c.id, d };
  }
  // If very close (< 40) consider it a match
  if (best && best.d < 40) return best.id;
  return undefined;
}
