export type Rules = {
  includeCategories: string[];
  excludeCategories: string[];
  includeTags: string[];
  excludeTags: string[];
  minPrice?: number;
  maxPrice?: number;
  requireImage: boolean;
  requireInStock: boolean;
  allowedVisibility: string[]; // 'visible','catalog','search','hidden'
  excludeSkuRegex?: RegExp;
  onlyNewerThanDays?: number;
  maxPostsPerDay: number;
  pickMostRecent: boolean;
  appendHashtags: boolean;
  baseHashtags: string[];
};

function list(env?: string) {
  return (env || "")
    .split(",")
    .map(s => s.trim())
    .filter(Boolean)
    .map(s => s.toLowerCase());
}

export function loadRules(): Rules {
  return {
    includeCategories: list(process.env.INCLUDE_CATEGORIES),
    excludeCategories: list(process.env.EXCLUDE_CATEGORIES),
    includeTags: list(process.env.INCLUDE_TAGS),
    excludeTags: list(process.env.EXCLUDE_TAGS),
    minPrice: process.env.MIN_PRICE ? Number(process.env.MIN_PRICE) : undefined,
    maxPrice: process.env.MAX_PRICE ? Number(process.env.MAX_PRICE) : undefined,
    requireImage: (process.env.REQUIRE_IMAGE || "true").toLowerCase() === "true",
    requireInStock: (process.env.REQUIRE_IN_STOCK || "true").toLowerCase() === "true",
    allowedVisibility: list(process.env.ALLOWED_VISIBILITY).length
      ? list(process.env.ALLOWED_VISIBILITY)
      : ["visible", "catalog", "search"],
    excludeSkuRegex: process.env.EXCLUDE_SKU_REGEX ? new RegExp(process.env.EXCLUDE_SKU_REGEX) : undefined,
    onlyNewerThanDays: process.env.ONLY_NEWER_THAN_DAYS ? Number(process.env.ONLY_NEWER_THAN_DAYS) : undefined,
    maxPostsPerDay: process.env.MAX_POSTS_PER_DAY ? Number(process.env.MAX_POSTS_PER_DAY) : 4,
    pickMostRecent: (process.env.PICK_MOST_RECENT || "true").toLowerCase() === "true",
    appendHashtags: (process.env.APPEND_HASHTAGS || "true").toLowerCase() === "true",
    baseHashtags: (process.env.BASE_HASHTAGS || "#NFTmerch #web3 #streetwear")
      .split(/\s+/)
      .filter(Boolean)
  };
}
