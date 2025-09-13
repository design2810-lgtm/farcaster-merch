import { Redis } from "@upstash/redis";

const url  = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const token= process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

const redis = url && token ? new Redis({ url, token }) : null;
const SET_POSTED = "posted_products";

export async function hasPosted(id: string) {
  if (!redis) return false;
  return (await redis.sismember(SET_POSTED, id)) === 1;
}
export async function markPosted(id: string) {
  if (!redis) return;
  await redis.sadd(SET_POSTED, id);
}

/** Tageszähler anhand Datum in Europe/Berlin */
function berlinDateStr(d = new Date()) {
  const fmt = new Intl.DateTimeFormat("de-DE", { timeZone: "Europe/Berlin", year: "numeric", month: "2-digit", day: "2-digit" });
  const parts = fmt.formatToParts(d);
  const dd = parts.find(p => p.type === "day")!.value;
  const mm = parts.find(p => p.type === "month")!.value;
  const yy = parts.find(p => p.type === "year")!.value;
  return `${yy}-${mm}-${dd}`; // YYYY-MM-DD
}

export async function getDailyCount() {
  if (!redis) return 0;
  const key = `daily_count:${berlinDateStr()}`;
  const v = await redis.get<number>(key);
  return v || 0;
}
export async function incDailyCount() {
  if (!redis) return 0;
  const key = `daily_count:${berlinDateStr()}`;
  const n = await redis.incr(key);
  // Ablauf um Mitternacht Berlin
  const now = new Date();
  const tzNow = new Date(now.toLocaleString("en-US", { timeZone: "Europe/Berlin" }));
  const midnight = new Date(tzNow); midnight.setHours(24,0,0,0);
  const ttl = Math.max(60, Math.floor((midnight.getTime() - tzNow.getTime()) / 1000));
  await redis.expire(key, ttl);
  return n;
}
