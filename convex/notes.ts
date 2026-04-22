import { v } from "convex/values";
import { mutation, query, type QueryCtx } from "./_generated/server";
import type { Doc, Id } from "./_generated/dataModel";

async function requireUser(ctx: QueryCtx): Promise<string> {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new Error("Not authenticated");
  }
  return identity.subject;
}

async function requireOwnedNote(
  ctx: QueryCtx,
  noteId: Id<"notes">,
): Promise<{ userId: string; note: Doc<"notes"> }> {
  const userId = await requireUser(ctx);
  const note = await ctx.db.get(noteId);
  if (!note) {
    throw new Error("Note not found");
  }
  if (note.userId !== userId) {
    throw new Error("Unauthorized");
  }
  return { userId, note };
}

// ------------------------- Mutations -------------------------

export const createNote = mutation({
  args: {
    title: v.optional(v.string()),
    folderId: v.optional(v.id("folders")),
  },
  handler: async (ctx, args) => {
    const userId = await requireUser(ctx);
    if (args.folderId) {
      const folder = await ctx.db.get(args.folderId);
      if (!folder || folder.userId !== userId) {
        throw new Error("Folder not found or unauthorized");
      }
    }
    const now = Date.now();
    return await ctx.db.insert("notes", {
      userId,
      folderId: args.folderId,
      title: args.title ?? "Untitled",
      content: undefined,
      tags: [],
      icon: undefined,
      coverImage: undefined,
      isArchived: false,
      isPublished: false,
      updatedAt: now,
    });
  },
});

export const updateNote = mutation({
  args: {
    id: v.id("notes"),
    title: v.optional(v.string()),
    content: v.optional(v.string()),
    icon: v.optional(v.string()),
    coverImage: v.optional(v.string()),
    isPublished: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { note } = await requireOwnedNote(ctx, args.id);
    const { id, ...rest } = args;
    const patch: Partial<Doc<"notes">> = { ...rest, updatedAt: Date.now() };
    await ctx.db.patch(note._id, patch);
    return note._id;
  },
});

export const archiveNote = mutation({
  args: { id: v.id("notes") },
  handler: async (ctx, args) => {
    const { note } = await requireOwnedNote(ctx, args.id);
    await ctx.db.patch(note._id, {
      isArchived: true,
      updatedAt: Date.now(),
    });
    return note._id;
  },
});

export const restoreNote = mutation({
  args: { id: v.id("notes") },
  handler: async (ctx, args) => {
    const { note } = await requireOwnedNote(ctx, args.id);
    await ctx.db.patch(note._id, {
      isArchived: false,
      updatedAt: Date.now(),
    });
    return note._id;
  },
});

export const deleteNote = mutation({
  args: { id: v.id("notes") },
  handler: async (ctx, args) => {
    const { note } = await requireOwnedNote(ctx, args.id);
    await ctx.db.delete(note._id);
    return note._id;
  },
});

export const moveToFolder = mutation({
  args: {
    id: v.id("notes"),
    folderId: v.optional(v.id("folders")),
  },
  handler: async (ctx, args) => {
    const { userId, note } = await requireOwnedNote(ctx, args.id);
    if (args.folderId) {
      const folder = await ctx.db.get(args.folderId);
      if (!folder || folder.userId !== userId) {
        throw new Error("Folder not found or unauthorized");
      }
    }
    await ctx.db.patch(note._id, {
      folderId: args.folderId,
      updatedAt: Date.now(),
    });
    return note._id;
  },
});

export const addTag = mutation({
  args: { id: v.id("notes"), tag: v.string() },
  handler: async (ctx, args) => {
    const normalized = args.tag.trim().toLowerCase();
    if (!normalized) throw new Error("Tag cannot be empty");
    if (normalized.length > 32) throw new Error("Tag too long");
    const { note } = await requireOwnedNote(ctx, args.id);
    if (note.tags.includes(normalized)) return note._id;
    await ctx.db.patch(note._id, {
      tags: [...note.tags, normalized],
      updatedAt: Date.now(),
    });
    return note._id;
  },
});

export const removeTag = mutation({
  args: { id: v.id("notes"), tag: v.string() },
  handler: async (ctx, args) => {
    const { note } = await requireOwnedNote(ctx, args.id);
    await ctx.db.patch(note._id, {
      tags: note.tags.filter((t) => t !== args.tag),
      updatedAt: Date.now(),
    });
    return note._id;
  },
});

export const removeIcon = mutation({
  args: { id: v.id("notes") },
  handler: async (ctx, args) => {
    const { note } = await requireOwnedNote(ctx, args.id);
    await ctx.db.patch(note._id, { icon: undefined, updatedAt: Date.now() });
    return note._id;
  },
});

export const removeCover = mutation({
  args: { id: v.id("notes") },
  handler: async (ctx, args) => {
    const { note } = await requireOwnedNote(ctx, args.id);
    await ctx.db.patch(note._id, {
      coverImage: undefined,
      updatedAt: Date.now(),
    });
    return note._id;
  },
});

// ------------------------- Queries -------------------------

export const listByFolder = query({
  args: { folderId: v.optional(v.id("folders")) },
  handler: async (ctx, args) => {
    const userId = await requireUser(ctx);
    const rows = await ctx.db
      .query("notes")
      .withIndex("by_user_folder", (q) =>
        q.eq("userId", userId).eq("folderId", args.folderId),
      )
      .filter((q) => q.eq(q.field("isArchived"), false))
      .order("desc")
      .collect();
    return rows;
  },
});

export const listAll = query({
  args: {},
  handler: async (ctx) => {
    const userId = await requireUser(ctx);
    return await ctx.db
      .query("notes")
      .withIndex("by_user_archived", (q) =>
        q.eq("userId", userId).eq("isArchived", false),
      )
      .order("desc")
      .collect();
  },
});

export const listArchived = query({
  args: {},
  handler: async (ctx) => {
    const userId = await requireUser(ctx);
    return await ctx.db
      .query("notes")
      .withIndex("by_user_archived", (q) =>
        q.eq("userId", userId).eq("isArchived", true),
      )
      .order("desc")
      .collect();
  },
});

export const listByTag = query({
  args: { tag: v.string() },
  handler: async (ctx, args) => {
    const userId = await requireUser(ctx);
    const rows = await ctx.db
      .query("notes")
      .withIndex("by_user_archived", (q) =>
        q.eq("userId", userId).eq("isArchived", false),
      )
      .collect();
    return rows.filter((r) => r.tags.includes(args.tag));
  },
});

export const listTags = query({
  args: {},
  handler: async (ctx) => {
    const userId = await requireUser(ctx);
    const rows = await ctx.db
      .query("notes")
      .withIndex("by_user_archived", (q) =>
        q.eq("userId", userId).eq("isArchived", false),
      )
      .collect();
    const counts = new Map<string, number>();
    for (const r of rows) {
      for (const t of r.tags) {
        counts.set(t, (counts.get(t) ?? 0) + 1);
      }
    }
    return Array.from(counts.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
  },
});

export const searchNotes = query({
  args: { query: v.string() },
  handler: async (ctx, args) => {
    const userId = await requireUser(ctx);
    const q = args.query.trim();
    if (!q) {
      return await ctx.db
        .query("notes")
        .withIndex("by_user_archived", (qb) =>
          qb.eq("userId", userId).eq("isArchived", false),
        )
        .order("desc")
        .take(20);
    }
    const titleMatches = await ctx.db
      .query("notes")
      .withSearchIndex("search_title", (qb) =>
        qb.search("title", q).eq("userId", userId).eq("isArchived", false),
      )
      .take(20);
    const contentMatches = await ctx.db
      .query("notes")
      .withSearchIndex("search_content", (qb) =>
        qb.search("content", q).eq("userId", userId).eq("isArchived", false),
      )
      .take(20);
    const seen = new Set<string>();
    const merged: Doc<"notes">[] = [];
    for (const n of [...titleMatches, ...contentMatches]) {
      if (seen.has(n._id)) continue;
      seen.add(n._id);
      merged.push(n);
    }
    return merged.slice(0, 20);
  },
});

export const getById = query({
  args: { id: v.id("notes") },
  handler: async (ctx, args) => {
    const note = await ctx.db.get(args.id);
    if (!note) return null;
    if (note.isPublished && !note.isArchived) {
      return note;
    }
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    if (note.userId !== identity.subject) throw new Error("Unauthorized");
    return note;
  },
});
