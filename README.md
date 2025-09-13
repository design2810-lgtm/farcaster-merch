# Farcaster Merch Caster (Serverless on Vercel)

Posts English Farcaster casts from your WooCommerce shop (nft-merch.io), with filters and brand prioritization.

## Quickstart

1. **Create Vercel Project** from this repo.
2. Add **Environment Variables** (see `.env.sample`).
3. Deploy. A cron in `vercel.json` runs `/api/post-next` every 2 hours.
4. Test manually (without posting yet): keep `DRY_RUN=true`, then:
   ```bash
   curl -X POST https://<your-project>.vercel.app/api/post-now
   ```
5. If the output looks good, set `DRY_RUN=false` in Vercel and redeploy.

### Endpoints

- `GET/CRON  /api/post-next` – scheduled posting (respects filters + daily cap).
- `POST      /api/post-now` – on-demand posting (respects filters; no daily cap).

### Required Vars

WooCommerce: `WC_SITE_URL`, `WC_CONSUMER_KEY`, `WC_CONSUMER_SECRET`  
Farcaster (Neynar): `NEYNAR_API_KEY`, `FARCASTER_SIGNER_UUID`  
KV (either Vercel KV or Upstash Redis): `KV_REST_API_URL`/`KV_REST_API_TOKEN` or `UPSTASH_REDIS_REST_URL`/`UPSTASH_REDIS_REST_TOKEN`

> **Security:** Never commit real secrets. Rotate any keys that were shared publicly.

