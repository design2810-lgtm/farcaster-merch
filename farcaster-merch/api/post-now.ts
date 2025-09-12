import type { VercelRequest, VercelResponse } from "@vercel/node";
import { fetchProducts } from "../lib/woocommerce.js";
import { buildCast } from "../lib/templates.js";
import { publishCast } from "../lib/publisher.js";
import { hasPosted, markPosted } from "../lib/kv.js";
import { loadRules } from "../lib/config.js";
import { isEligible } from "../lib/eligibility.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") return res.status(405).json({ ok: false, error: "Use POST" });
  try {
    const rules = loadRules();
    const products = await fetchProducts(100);

    // Same selection logic as cron, but no daily cap (manual override)
    const sorted = rules.pickMostRecent
      ? products.sort((a,b) => (new Date(b.createdAt||0).getTime()) - (new Date(a.createdAt||0).getTime()))
      : products;

    let picked: any = null;
    const skipped: any[] = [];
    for (const p of sorted) {
      if (await hasPosted(p.id)) { skipped.push({ id:p.id, reason:"already_posted" }); continue; }
      const verdict = isEligible(p, rules);
      if (verdict.ok) { picked = p; break; }
      skipped.push({ id:p.id, reason: verdict.reason });
    }

    if (!picked) return res.status(200).json({ ok: true, message: "No eligible products.", skipped });

    const cast = buildCast(
      picked.title, picked.description, picked.url, picked.price, picked.currency, picked.tags,
      { appendHashtags: rules.appendHashtags, baseHashtags: rules.baseHashtags }
    );
    const result = await publishCast({ text: cast.text, embedUrl: cast.embedUrl, imageUrl: picked.image || undefined });

    await markPosted(picked.id);
    return res.status(200).json({ ok: true, product: picked.id, result });
  } catch (e: any) {
    console.error(e);
    return res.status(500).json({ ok: false, error: e.message });
  }
}
