type CastParts = { text: string; embedUrl?: string };

function shorten(text: string, max = 300) {
  return text.length <= max ? text : text.slice(0, max - 1) + "…";
}

function pickHashtags(tags: string[], base: string[], enable: boolean) {
  if (!enable) return "";
  const from = tags.slice(0, 3).map(t => "#" + t.replace(/\s+/g, ""));
  const all = Array.from(new Set([...from, ...base])).slice(0, 4);
  return all.length ? "\n" + all.join(" ") : "";
}

export function buildCast(
  title: string,
  description: string,
  url: string,
  price: number | null,
  currency: string,
  tags: string[],
  opts?: { appendHashtags?: boolean; baseHashtags?: string[] }
): CastParts {
  const pricePart = price ? ` – ${currency}${price.toFixed(2)}` : "";
  const hash = pickHashtags(tags, opts?.baseHashtags || [], !!opts?.appendHashtags);
  return {
    text: shorten(`${title}${pricePart}\n${description}\n${url}${hash}`, 300),
    embedUrl: url
  };
}
