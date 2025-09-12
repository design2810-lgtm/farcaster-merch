import type { Product } from "./woocommerce.js";
import type { Rules } from "./config.js";

export type Verdict = { ok: boolean; reason?: string };

function inListAny(needles: string[], hay: string[]) {
  if (!needles.length) return true;
  return hay.some(h => needles.includes(h));
}
function inListNone(needles: string[], hay: string[]) {
  if (!needles.length) return true;
  return hay.every(h => !needles.includes(h));
}

export function isEligible(p: Product, r: Rules): Verdict {
  if (r.requireImage && !p.image) return { ok: false, reason: "no_image" };
  if (r.requireInStock && p.stock_status !== "in_stock" && p.stock_status !== "instock")
    return { ok: false, reason: `stock=${p.stock_status}` };

  if (r.allowedVisibility.length && p.visibility && !r.allowedVisibility.includes(p.visibility.toLowerCase()))
    return { ok: false, reason: `visibility=${p.visibility}` };

  if (r.minPrice != null && (p.price == null || p.price < r.minPrice)) return { ok: false, reason: "price_below_min" };
  if (r.maxPrice != null && p.price != null && p.price > r.maxPrice) return { ok: false, reason: "price_above_max" };

  if (!inListAny(r.includeCategories, p.categories)) return { ok: false, reason: "cat_not_included" };
  if (!inListNone(r.excludeCategories, p.categories)) return { ok: false, reason: "cat_excluded" };

  if (!inListAny(r.includeTags, p.tags)) return { ok: false, reason: "tag_not_included" };
  if (!inListNone(r.excludeTags, p.tags)) return { ok: false, reason: "tag_excluded" };

  if (r.excludeSkuRegex && p.sku && r.excludeSkuRegex.test(p.sku)) return { ok: false, reason: "sku_blocked" };

  if (r.onlyNewerThanDays && p.createdAt) {
    const created = new Date(p.createdAt);
    const cutoff = new Date(Date.now() - r.onlyNewerThanDays * 24 * 60 * 60 * 1000);
    if (created < cutoff) return { ok: false, reason: "too_old" };
  }
  return { ok: true };
}
