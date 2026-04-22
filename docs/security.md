# Margin — Security Report

_Last scan: 2026-04-22._

This document is the durable record of the proactive security audit
run against `olukareem/margin`. It is meant to be re-run before every
production deploy and updated in place.

## Scope

1. Secret exposure in working tree and full Git history.
2. `.gitignore` coverage for credential artefacts.
3. Client bundle leakage via `NEXT_PUBLIC_*` variables.
4. Convex mutation and query authorization.
5. Next.js middleware route protection.
6. Dependency CVEs (`npm audit`).
7. Preventive controls: pre-commit scanning, HTTP security headers.

## Findings

### 1. Secret scan — PASS

- `gitleaks detect` over 28 commits (~751 KB), with repo config
  `.gitleaks.toml`, reports `no leaks found`.
- Manual pattern sweep across six families (Clerk, Stripe, AWS, GCP,
  GitHub, JWT, RSA private-key blocks, Convex deploy keys, raw
  EdgeStore tokens) returns zero matches outside `.env.local` (which
  is correctly ignored).
- The only `eyJ…` string in the repo is an npm sha512 integrity hash
  in `package-lock.json`. False positive; now explicitly allowlisted
  in `.gitleaks.toml`.

### 2. `.gitignore` coverage — PASS

`.gitignore` now ignores:

- `.env`, `.env.*` (with allowlist for `.env.example` / `.env.sample`)
- `.envrc`
- `*.pem`, `*.key`, `*.p12`, `*.pfx`, `*.gpg`
- `id_rsa`, `id_rsa.pub`
- `credentials.json`, `service-account*.json`

This closes the original template's gap where a bare `.env` or a
dropped SSH key could have been staged.

### 3. Client bundle leakage — PASS

Only two `NEXT_PUBLIC_*` variables ship to the browser:

- `NEXT_PUBLIC_CONVEX_URL` — the Convex deployment URL. Public by
  design; Convex auth is per-request.
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` — Clerk's documented
  browser-safe key.

Server-only secrets (`CLERK_SECRET_KEY`, `EDGE_STORE_SECRET_KEY`,
Convex deploy key) are unprefixed and stay server-side.

### 4. Convex authorization — PASS

Every one of the 19 exported mutations and queries in `convex/notes.ts`
and `convex/folders.ts` runs through one of:

- `requireUser(ctx)` — rejects unauthenticated requests.
- `requireOwnedNote(ctx, id)` / `requireOwnedFolder(ctx, id)` —
  additionally rejects requests where `note.userId !== identity.subject`.

One deliberate exception: `notes.getById` allows anonymous reads for
documents where `isPublished && !isArchived`. This is the contract
for `/preview/[noteId]` share links and is intentional.

### 5. Middleware coverage — PASS

`middleware.ts` uses `clerkMiddleware` with an explicit public-route
allowlist:

- `/` (marketing)
- `/preview/(.*)` (shared notes)
- `/api/edgestore/(.*)` (upload-token minting)

Everything else calls `auth().protect()`. CVE-2025-29927 (the Next.js
`x-middleware-subrequest` bypass) is patched by the Next 14.2.35 bump.

**Follow-up (medium):** `/api/edgestore/(.*)` being public means an
anonymous client can mint upload tokens and burn EdgeStore quota.
Low real-world risk because EdgeStore enforces per-file size caps,
but worth gating behind Clerk once we have a rate-limit story.

### 6. Dependency CVEs — PARTIALLY PATCHED

- Bumped `next` from `14.2.5` → `14.2.35` to patch the middleware
  bypass (CVE-2025-29927) and several lower-severity issues.
- `npm audit` still reports ~40 advisories, all transitive via
  `@edgestore/server` → `@aws-sdk/client-s3` → `@smithy/*`. No
  clean fix path exists without upstream EdgeStore bumping its S3
  SDK; none of the flagged paths are reachable from Margin's actual
  usage (we never call the S3 SDK directly, only EdgeStore's
  abstraction). Re-evaluate on every `@edgestore/*` release.

### 7. Preventive controls — NEW

**Gitleaks pre-commit hook.** `.githooks/pre-commit` runs
`gitleaks protect --staged` on every commit. `scripts/setup-hooks.sh`
wires `core.hooksPath` to the versioned `.githooks/` directory so
the whole team gets the same check. Smoke-tested with a fake GitHub
PAT — blocked as expected.

**HTTP security headers** via `next.config.mjs`:

| Header | Value | Purpose |
|---|---|---|
| `Content-Security-Policy` | scoped to Convex / Clerk / EdgeStore + regional AWS S3 hosts, `frame-ancestors 'none'` | Blocks XSS and clickjacking |
| `X-Frame-Options` | `DENY` | Legacy clickjacking defense |
| `X-Content-Type-Options` | `nosniff` | Blocks MIME sniffing on cover uploads |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | Stops note ids leaking in `Referer` |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=()`, etc. | Locks down unused browser APIs |
| `Strict-Transport-Security` | `max-age=63072000; includeSubDomains; preload` | Forces HTTPS |
| (stripped) `X-Powered-By` | — | Removes framework fingerprint |

### CSP caveat — EdgeStore upload targets

EdgeStore mints presigned PUT URLs that target its underlying S3 bucket
directly (today: `edge-store.s3.us-east-1.amazonaws.com`), not the
`files.edgestore.dev` CDN host. Both `connect-src` and `img-src` must
therefore allowlist AWS S3 regional wildcards or browsers will reject
the upload with a CSP violation and a generic `status: 0` XHR failure.
Smoke-tested end-to-end via the cover-image modal on 2026-04-22.

## How to re-run this audit

```bash
# From repo root
gitleaks detect --config .gitleaks.toml --no-banner    # history scan
npm audit                                              # dependency CVEs
npx tsc --noEmit && npm run lint && npm run build      # build health

# In a browser against a running deployment, inspect response headers
# at the root route; all seven entries in the table above must be present.
```

## Remaining recommendations

1. Gate `/api/edgestore/(.*)` behind Clerk once a rate-limit policy
   is decided (medium).
2. Schedule a weekly `npm audit` + `gitleaks detect` run in CI; fail
   the build on any new critical advisory (low effort, high value).
3. When Clerk's production keys are provisioned, rotate the dev
   publishable key and re-scan history.
4. When EdgeStore publishes a release that bumps `@aws-sdk/client-s3`,
   run `npm update @edgestore/server @edgestore/react` and re-audit.
