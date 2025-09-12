import fetch from "cross-fetch";

const neynarKey = process.env.NEYNAR_API_KEY!;
const signerUuid = process.env.FARCASTER_SIGNER_UUID!;
const dryRun = (process.env.DRY_RUN || "false").toLowerCase() === "true";

export async function publishCast({
  text,
  embedUrl,
  imageUrl
}: { text: string; embedUrl?: string; imageUrl?: string }) {
  if (dryRun) {
    console.log("[DRY_RUN] Would post:", { text, embedUrl, imageUrl });
    return { ok: true, dryRun: true };
  }
  const res = await fetch("https://api.neynar.com/v2/farcaster/cast", {
    method: "POST",
    headers: { "api_key": neynarKey, "content-type": "application/json" },
    body: JSON.stringify({
      signer_uuid: signerUuid,
      text,
      embeds: [
        ...(embedUrl ? [{ url: embedUrl }] : []),
        ...(imageUrl ? [{ url: imageUrl }] : [])
      ]
    })
  });
  if (!res.ok) throw new Error(`Publish failed ${res.status}: ${await res.text()}`);
  return res.json();
}
