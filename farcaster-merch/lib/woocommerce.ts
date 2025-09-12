import fetch from "cross-fetch";

export type Product = {
  id: string;
  wcId: number;
  title: string;
  description: string;
  url: string;
  image: string | null;
  price: number | null;
  currency: string;
  tags: string[];
  categories: string[];
  sku?: string | null;
  stock_status?: string;
  visibility?: string;
  createdAt?: string;
};

const base = (process.env.WC_SITE_URL || "").replace(/\/+$/, "");
const ck = process.env.WC_CONSUMER_KEY!;
const cs = process.env.WC_CONSUMER_SECRET!;
const currency = process.env.CURRENCY_SYMBOL || "€";
const utm = process.env.UTM ? (process.env.UTM.startsWith("?") ? process.env.UTM.slice(1) : process.env.UTM) : "";

function api(path: string, params: Record<string, any> = {}) {
  const qp = new URLSearchParams({
    consumer_key: ck,
    consumer_secret: cs,
    ...Object.fromEntries(Object.entries(params).filter(([, v]) => v != null))
  });
  return `${base}/wp-json/wc/v3${path}?${qp.toString()}`;
}

function firstSentence(html: string): string {
  const text = html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
  const m = text.match(/^(.*?[.!?])\s|^(.{0,140})/);
  return (m?.[1] || m?.[2] || text).trim();
}

function parsePrice(p: any): number | null {
  if (p.price) return parseFloat(p.price);
  if (p.regular_price) return parseFloat(p.regular_price);
  const html: string | undefined = p.price_html;
  const m = html?.match(/([0-9]+(?:[\.,][0-9]{2})?)/g);
  if (m && m.length) return parseFloat(m[0].replace(",", "."));
  return null;
}

async function fetchPage(page = 1, per_page = 50) {
  const url = api("/products", {
    status: "publish",
    page,
    per_page,
    orderby: "date",
    order: "desc"
  });
  const res = await fetch(url);
  if (!res.ok) throw new Error(`WooCommerce ${res.status}: ${await res.text()}`);
  return res.json();
}

export async function fetchProducts(limit = 50): Promise<Product[]> {
  const out: any[] = [];
  let page = 1;
  while (out.length < limit) {
    const batch = await fetchPage(page, Math.min(50, limit - out.length));
    if (!batch?.length) break;
    out.push(...batch);
    if (batch.length < 50) break;
    page += 1;
  }

  return out.map((p: any) => {
    const permalink = p.permalink || `${base}/?p=${p.id}`;
    const link = utm ? (permalink.includes("?") ? `${permalink}&${utm}` : `${permalink}?${utm}`) : permalink;
    const img = p.images?.[0]?.src ?? null;
    const tagNames = (p.tags || []).map((t: any) => (t.slug || t.name || "").toString().toLowerCase());
    const catNames = (p.categories || []).map((c: any) => (c.slug || c.name || "").toString().toLowerCase());
    return {
      id: `wc_${p.id}`,
      wcId: p.id,
      title: p.name,
      description: firstSentence(p.short_description || p.description || ""),
      url: link,
      image: img,
      price: parsePrice(p),
      currency,
      tags: tagNames,
      categories: catNames,
      sku: p.sku || null,
      stock_status: p.stock_status,
      visibility: p.catalog_visibility,
      createdAt: p.date_created || p.date_created_gmt
    };
  });
}
