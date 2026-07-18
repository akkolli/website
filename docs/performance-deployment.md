# Production cache setup

The container now sends long-lived cache headers for fingerprinted CSS and JavaScript, 30-day headers for fonts and images, and a one-hour shared-cache lifetime for HTML.

Cloudflare does not cache HTML by default. Add a Cache Rule for `akkolli.net` that marks successful `GET` and `HEAD` HTML responses as eligible for cache, respects the origin `Cache-Control` header, and uses the origin-provided Edge TTL.

Add these Gitea Actions secrets so a deploy purges stale HTML after the new container starts:

- `CLOUDFLARE_ZONE_ID`
- `CLOUDFLARE_API_TOKEN` with `Cache Purge` permission for the zone

The deployment remains functional when those secrets are absent; it simply skips the purge.
