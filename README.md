# Margin

**Notes in the margins. Thoughts you come back to.**

Margin is an opinionated notes app for people who write to think. It keeps the chrome out of the way — folders, tags, full-text search, auto-save, and a small set of keyboard shortcuts — so the page is the thing you see.

Built on Next.js 14, Convex, Clerk, and BlockNote. Dark-first, serif-titled, strict TypeScript end-to-end.

> Repo status: active. The app is shippable; see [Roadmap](#roadmap) for known gaps.

---

## Why Margin?

Most note apps either bury you in options (Notion) or treat writing as disposable (stickies, scratch pads). Margin picks a lane:

- **Writing first.** Serif H1s, generous gutters, a reading measure capped at ~68ch.
- **One surface.** Folders and tags coexist — notes live at the root by default, move into folders when structure emerges.
- **Keyboard-native.** `Cmd+K` to jump, `Cmd+N` to start, `Cmd+Backspace` to archive. No menu diving.
- **Reactive.** Convex streams updates. Every edit you make appears instantly on every open tab.
- **Quiet.** Warm-neutral palette, Instrument Serif display face, no gradients, no mascots, no AI features fighting for attention.

---

## Stack

| Layer          | Choice                                                                    |
| -------------- | ------------------------------------------------------------------------- |
| Framework      | [Next.js 14](https://nextjs.org) (App Router, React 18, TypeScript strict) |
| Database       | [Convex](https://convex.dev) (reactive queries, search indexes, auth sync) |
| Auth           | [Clerk](https://clerk.com) + middleware-enforced route protection         |
| Editor         | [BlockNote](https://blocknotejs.org) with debounced persistence           |
| File uploads   | [EdgeStore](https://edgestore.dev) for cover images                       |
| Styling        | Tailwind CSS, shadcn/ui, Radix primitives, Instrument Serif + Inter       |
| State          | Zustand (UI state), next-themes (class-flip dark mode)                    |

TypeScript runs with `strict`, `noUncheckedIndexedAccess`, and `exactOptionalPropertyTypes` on.

---

## Features

### Writing
- BlockNote rich-text editor with 500 ms debounced auto-save
- Visible save status in the navbar: `Saving` → `Saved Xs ago` → `Save failed`
- Inline title editing, debounced separately from the body
- Emoji icon picker and optional cover image per note

### Organization
- Folder tree with nested notes, move via the row menu
- Tag pills on every note, click a tag to filter at `/tag/[name]`
- Sidebar tag-list with live counts

### Discovery
- `Cmd+K` command palette searches titles and bodies via Convex `searchIndex`
- Results de-duped across the title and body indexes, sorted by relevance

### Sharing
- Publish a note to a read-only URL at `/preview/[noteId]`
- Unpublish at any time; public URLs stop rendering instantly via Convex reactivity

### Workspace
- Resizable and collapsible sidebar, persisted to localStorage
- Dark-first with an optional light theme
- Empty states for welcome, empty folder, empty tag, empty trash
- Trash view with restore and hard-delete

### Keyboard

| Shortcut        | Action                         |
| --------------- | ------------------------------ |
| `Cmd/Ctrl + K`  | Open search                    |
| `Cmd/Ctrl + N`  | New note                       |
| `Cmd/Ctrl + S`  | Flash the save indicator       |
| `Cmd/Ctrl + ⌫`  | Archive the current note       |
| `Esc`           | Close the current modal        |

---

## Quick start

```bash
git clone https://github.com/olukareem/margin.git
cd margin
npm install
npx convex dev    # terminal 1 — provisions a dev Convex deployment
npm run dev       # terminal 2 — http://localhost:3000
```

The first `npx convex dev` run writes `NEXT_PUBLIC_CONVEX_URL` and `CONVEX_DEPLOYMENT` into `.env.local`. You still need to fill in Clerk and EdgeStore keys — see below.

---

## Environment variables

Create `.env.local` at the repo root:

```env
# Convex — populated by `npx convex dev` on first run
NEXT_PUBLIC_CONVEX_URL=
CONVEX_DEPLOYMENT=

# Clerk — https://dashboard.clerk.com
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=

# Clerk JWT issuer domain (no trailing slash)
# e.g. https://robust-gorilla-42.clerk.accounts.dev
CLERK_JWT_ISSUER_DOMAIN=

# EdgeStore — https://dashboard.edgestore.dev
EDGE_STORE_ACCESS_KEY=
EDGE_STORE_SECRET_KEY=
```

`CLERK_JWT_ISSUER_DOMAIN` must also be set inside the Convex dashboard so server-side functions can validate tokens.

### Clerk setup

1. Create an application in Clerk.
2. Enable Email and any social providers you want.
3. Under **JWT Templates**, create a template named `convex`. Copy the issuer URL into `CLERK_JWT_ISSUER_DOMAIN` and into the Convex environment.
4. Copy the publishable and secret keys into `.env.local`.

### Convex setup

1. Run `npx convex dev` once to provision the dev deployment.
2. In the Convex dashboard, set `CLERK_JWT_ISSUER_DOMAIN` under **Settings → Environment Variables**.
3. The schema in `convex/schema.ts` deploys automatically.

### EdgeStore setup

1. Create a project at [edgestore.dev](https://edgestore.dev).
2. Copy the access and secret keys into `.env.local`.

Without EdgeStore keys the editor still works; only cover-image upload will fail.

---

## Architecture

```
app/
  (main)/                    Auth-gated workspace
    _components/sidebar/     Folder tree, tag filter, resize hook
    _components/save-indicator.tsx
    (routes)/notes/          /notes, /notes/[noteId]
    (routes)/trash/          /trash
    (routes)/tag/[tag]/      Tag-filtered view
    (routes)/folder/[id]/    Folder view
  (marketing)/               Public landing
  (public)/preview/          Read-only shared-note view
  api/edgestore/             EdgeStore upload handler
  layout.tsx                 Providers (Clerk, Convex, theme, modal)
components/
  editor.tsx                 BlockNote wrapper + debounced onChange
  search-command.tsx         Cmd+K palette, hits Convex searchNotes
  toolbar.tsx, cover.tsx, icon-picker.tsx, ...
  ui/                        shadcn primitives
convex/
  schema.ts                  notes + folders tables, search indexes
  notes.ts                   queries + mutations, ownership-checked
  folders.ts                 folder CRUD
  auth.config.js             Reads CLERK_JWT_ISSUER_DOMAIN
hook/
  use-save-status.tsx        Zustand store fed by editor + title
  use-keyboard-shortcuts.tsx Global hotkey listener
  use-debounced-callback.tsx
lib/
  utils.ts                   cn
  edgestore.ts               EdgeStore client
middleware.ts                Clerk edge-enforced route protection
```

### Data model

```ts
notes: {
  userId, folderId?, title, content?, tags: string[],
  icon?, coverImage?, isArchived, isPublished, updatedAt
}
folders: {
  userId, name, parentFolderId?, icon?, orderIndex
}
```

Every mutation validates args with `v.*`, resolves `userId` from `ctx.auth.getUserIdentity()`, and rejects on ownership mismatch. Every note mutation bumps `updatedAt`. Archive and restore are recursive across folder hierarchies.

### Auth boundary

- Public: `/`, `/preview/[noteId]`, `/api/edgestore/(.*)`
- Everything else is gated in `middleware.ts` at the edge — no flash of the marketing page before hydration.

---

## Deploy

Next.js goes to Vercel. Convex deploys to its own hosted runtime.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/olukareem/margin)

After Vercel provisions the project:

1. Run `npx convex deploy` locally to push the schema to the production Convex deployment.
2. Add every env var from the list above to the Vercel project.
3. Set `CLERK_JWT_ISSUER_DOMAIN` inside the production Convex deployment's environment.
4. In Clerk, add the Vercel production URL to **Allowed Origins** and **Redirect URLs**.

---

## Scripts

| Script                | Purpose                        |
| --------------------- | ------------------------------ |
| `npm run dev`         | Start Next.js dev server       |
| `npm run build`       | Production build               |
| `npm run start`       | Serve the production build     |
| `npm run lint`        | Run ESLint                     |
| `npx tsc --noEmit`    | Type-check the entire project  |
| `npx convex dev`      | Run Convex against the dev env |
| `npx convex deploy`   | Deploy the Convex schema       |

---

## Roadmap

Shipped and working today:

- Auth, notes, folders, tags, search, publish, trash, auto-save, keyboard shortcuts, theme toggle, empty states.

Known gaps, in priority order:

- Drag-and-drop note reordering inside the sidebar
- Markdown import/export
- Per-note version history via Convex scheduled snapshots
- Mobile layout polish below 640 px

---

## License

MIT
