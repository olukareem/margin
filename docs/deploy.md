# Margin — Production Deploy Handoff

Target stack: **Vercel** for the Next.js app, **Convex** cloud for the
reactive backend, **Clerk** production instance for auth, **EdgeStore**
for file uploads. Every external service already has a working dev
tenant (`dev:reliable-squirrel-815` on Convex, `ins_2jLnMf…` on Clerk,
`gydte2h1bvy5cz4f` on EdgeStore). This doc walks from "repo pushed to
GitHub" to "public URL serving signed-in users" without leaving
anything to guess.

The order matters — Clerk prod keys must exist before Convex's JWT
issuer can be updated, and Convex's prod deployment URL must exist
before Vercel can set `NEXT_PUBLIC_CONVEX_URL`.

---

## 0. Pre-flight

```bash
# From /Users/Splice/Desktop/Projects/Personal Portfolio/margin/app
bash scripts/setup-hooks.sh       # wire gitleaks pre-commit for the team
npx tsc --noEmit                  # expect 0 errors
npm run lint                      # expect 0 warnings
npm run build                     # expect clean build
gitleaks detect --config .gitleaks.toml --no-banner   # expect no leaks
```

Git state: `main` is at `olukareem/margin`, clean, with the security
commit (`bc9fe13`) and the CSP fix (`2ad35fc`) pushed.

---

## 1. Clerk — promote dev instance to production

1. `dashboard.clerk.com` → Margin app → **Create production instance**.
2. Add the production domain (the Vercel URL, e.g. `margin.olukareem.com`
   or `margin-olu.vercel.app`).
3. Under **API Keys** on the production instance, copy:
   - `CLERK_PUBLISHABLE_KEY` (starts `pk_live_…`)
   - `CLERK_SECRET_KEY` (starts `sk_live_…`)
4. Under **JWT Templates**, confirm the `convex` template exists (Clerk
   ships it automatically when you created the Convex integration on
   the dev instance; prod needs it re-added). Its **Issuer** URL is
   what Convex will verify against — copy it (e.g.
   `https://clerk.margin.olukareem.com`).
5. Configure any social login providers you want in prod (email-only
   works out of the box).

**Verify:** production keys are `pk_live_…` / `sk_live_…` — if they
still look like `pk_test_…` / `sk_test_…`, you're on the dev instance.

---

## 2. Convex — create production deployment

```bash
npx convex deploy --prod
```

First run will prompt to link a prod deployment to the `margin`
project. Accept the defaults. When it finishes:

1. Note the printed prod URL — it looks like
   `https://<name>-<number>.convex.cloud`.
2. Set the Convex prod env var for Clerk's issuer domain:
   ```bash
   npx convex env set CLERK_JWT_ISSUER_DOMAIN "https://clerk.margin.olukareem.com" --prod
   ```
   This feeds `convex/auth.config.js`, which reads from `process.env`.
3. Retrieve a Convex prod deploy key for Vercel:
   ```bash
   # From dashboard.convex.dev → project → Settings → Deploy Keys
   # Name it "vercel-prod"; copy once — you cannot view it again.
   ```

**Verify:** open the prod deployment in the Convex dashboard, expand
the **Settings → Environment Variables** pane, confirm
`CLERK_JWT_ISSUER_DOMAIN` is set.

---

## 3. EdgeStore — reuse the existing project

EdgeStore is a single project, not dev/prod split. The keys already in
`.env.local` work for prod too. On the EdgeStore dashboard
(`dashboard.edgestore.dev`):

1. Add the Vercel domain to **Allowed Origins** (otherwise the upload
   PUT will CORS-fail).
2. Confirm the project has quota left for production traffic; if not,
   upgrade the plan.

---

## 4. Vercel — import and deploy

1. `vercel.com/new` → import `olukareem/margin` from GitHub.
2. **Framework preset:** Next.js.
3. **Root directory:** leave at repo root (the app lives there).
4. **Environment variables** (Production, Preview):

   | Name | Value | Notes |
   |---|---|---|
   | `NEXT_PUBLIC_CONVEX_URL` | Convex prod URL from step 2 | Public |
   | `CONVEX_DEPLOY_KEY` | Deploy key from step 2 | Secret |
   | `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | `pk_live_…` from step 1 | Public |
   | `CLERK_SECRET_KEY` | `sk_live_…` from step 1 | Secret |
   | `CLERK_JWT_ISSUER_DOMAIN` | issuer URL from step 1 | Secret |
   | `EDGE_STORE_ACCESS_KEY` | same as `.env.local` | Secret |
   | `EDGE_STORE_SECRET_KEY` | same as `.env.local` | Secret |

5. **Build command:** leave the default, then override to
   `npx convex deploy --cmd 'npm run build'`. This wires Convex
   function deploys into the Vercel build so a Vercel promotion
   automatically publishes the matching Convex code.

6. Click **Deploy**. First build takes ~3 min.

---

## 5. Post-deploy verification

Against the live URL:

1. **Auth round-trip.** Visit `/`. Sign up with a new email.
   Verify redirect to `/notes`. Sign out. Sign back in. Expect no
   middleware flash of the marketing page.
2. **CRUD.** `Cmd+N`, type a title, add two tags, upload a cover image.
   Refresh — all state persists.
3. **Search.** `Cmd+K`, type part of a note body — results appear and
   `/preview/<id>` opens when signed out.
4. **Security headers.**
   ```bash
   curl -sI https://<your-domain>/ | grep -Ei 'content-security|strict-transport|frame-options|permissions-policy'
   ```
   All five must be present. `X-Powered-By` must be absent.
5. **Gitleaks tripwire.** On a throwaway branch, stage a fake
   `ghp_…` token and confirm the pre-commit hook blocks it.
6. **Middleware.** Hit `/notes` signed out — expect `302` to `/` (or
   the Clerk sign-in modal). Hit `/preview/<published-id>` signed out —
   expect `200` and the read-only view.

---

## 6. DNS + custom domain (optional, last)

If pointing a custom domain at Vercel:

1. Vercel → Project → **Domains** → add your domain.
2. Update DNS per Vercel's instructions.
3. Once the cert is live, go back to Clerk → Production instance →
   **Domains** and add the same custom domain as an allowed origin.
4. Re-trigger a Vercel deploy so the CSP (which includes the Clerk
   origins) matches the new Clerk prod domain.

---

## 7. Rotate dev secrets after go-live

Once the prod deployment is happy:

1. Delete the `.env.local` values from any shared clipboards or notes.
2. In Clerk dev: rotate `sk_test_…` to invalidate the one in
   `.env.local` (any fork of the repo history that predates the
   `.gitignore` fix can no longer hit your Clerk backend with it).
3. In EdgeStore: rotate the secret key; update `.env.local`.
4. Re-run `gitleaks detect` to confirm no live secrets remain.

Document any rotations in `docs/security.md` under "Remaining
recommendations → When Clerk's production keys are provisioned…".

---

## Rollback

- **Vercel:** Deployments list → promote a previous deployment.
- **Convex:** `npx convex deploy --prod --rollback` (prompts for the
  prior revision).
- Because `convex deploy` is chained into the Vercel build, a Vercel
  rollback does NOT automatically roll Convex back — do both, in that
  order, if a bad function deploy reaches prod.
