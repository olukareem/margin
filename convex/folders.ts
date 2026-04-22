import { v } from "convex/values";
import { mutation, query, type QueryCtx } from "./_generated/server";
import type { Doc, Id } from "./_generated/dataModel";

async function requireUser(ctx: QueryCtx): Promise<string> {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error("Not authenticated");
  return identity.subject;
}

async function requireOwnedFolder(
  ctx: QueryCtx,
  folderId: Id<"folders">,
): Promise<{ userId: string; folder: Doc<"folders"> }> {
  const userId = await requireUser(ctx);
  const folder = await ctx.db.get(folderId);
  if (!folder) throw new Error("Folder not found");
  if (folder.userId !== userId) throw new Error("Unauthorized");
  return { userId, folder };
}

// ------------------------- Mutations -------------------------

export const createFolder = mutation({
  args: {
    name: v.string(),
    parentFolderId: v.optional(v.id("folders")),
  },
  handler: async (ctx, args) => {
    const userId = await requireUser(ctx);
    const name = args.name.trim();
    if (!name) throw new Error("Folder name cannot be empty");
    if (name.length > 64) throw new Error("Folder name too long");
    if (args.parentFolderId) {
      const parent = await ctx.db.get(args.parentFolderId);
      if (!parent || parent.userId !== userId) {
        throw new Error("Parent folder not found or unauthorized");
      }
    }
    const siblings = await ctx.db
      .query("folders")
      .withIndex("by_user_parent", (q) =>
        q.eq("userId", userId).eq("parentFolderId", args.parentFolderId),
      )
      .collect();
    const nextOrder =
      siblings.reduce((m, s) => Math.max(m, s.orderIndex), -1) + 1;
    return await ctx.db.insert("folders", {
      userId,
      name,
      parentFolderId: args.parentFolderId,
      icon: undefined,
      orderIndex: nextOrder,
    });
  },
});

export const renameFolder = mutation({
  args: { id: v.id("folders"), name: v.string() },
  handler: async (ctx, args) => {
    const name = args.name.trim();
    if (!name) throw new Error("Folder name cannot be empty");
    if (name.length > 64) throw new Error("Folder name too long");
    const { folder } = await requireOwnedFolder(ctx, args.id);
    await ctx.db.patch(folder._id, { name });
    return folder._id;
  },
});

export const setFolderIcon = mutation({
  args: { id: v.id("folders"), icon: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const { folder } = await requireOwnedFolder(ctx, args.id);
    await ctx.db.patch(folder._id, { icon: args.icon });
    return folder._id;
  },
});

export const moveFolder = mutation({
  args: {
    id: v.id("folders"),
    parentFolderId: v.optional(v.id("folders")),
  },
  handler: async (ctx, args) => {
    const { userId, folder } = await requireOwnedFolder(ctx, args.id);
    if (args.parentFolderId) {
      if (args.parentFolderId === folder._id) {
        throw new Error("Cannot move folder into itself");
      }
      const parent = await ctx.db.get(args.parentFolderId);
      if (!parent || parent.userId !== userId) {
        throw new Error("Parent folder not found or unauthorized");
      }
    }
    await ctx.db.patch(folder._id, { parentFolderId: args.parentFolderId });
    return folder._id;
  },
});

export const deleteFolder = mutation({
  args: { id: v.id("folders") },
  handler: async (ctx, args) => {
    const { userId, folder } = await requireOwnedFolder(ctx, args.id);
    // Unparent child notes (send them to root).
    const childNotes = await ctx.db
      .query("notes")
      .withIndex("by_user_folder", (q) =>
        q.eq("userId", userId).eq("folderId", folder._id),
      )
      .collect();
    for (const note of childNotes) {
      await ctx.db.patch(note._id, {
        folderId: undefined,
        updatedAt: Date.now(),
      });
    }
    // Unparent child folders.
    const childFolders = await ctx.db
      .query("folders")
      .withIndex("by_user_parent", (q) =>
        q.eq("userId", userId).eq("parentFolderId", folder._id),
      )
      .collect();
    for (const child of childFolders) {
      await ctx.db.patch(child._id, { parentFolderId: undefined });
    }
    await ctx.db.delete(folder._id);
    return folder._id;
  },
});

// ------------------------- Queries -------------------------

export const listFolders = query({
  args: {},
  handler: async (ctx) => {
    const userId = await requireUser(ctx);
    const folders = await ctx.db
      .query("folders")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
    return folders.sort(
      (a, b) => a.orderIndex - b.orderIndex || a.name.localeCompare(b.name),
    );
  },
});

export const getById = query({
  args: { id: v.id("folders") },
  handler: async (ctx, args) => {
    const userId = await requireUser(ctx);
    const folder = await ctx.db.get(args.id);
    if (!folder) return null;
    if (folder.userId !== userId) throw new Error("Unauthorized");
    return folder;
  },
});
