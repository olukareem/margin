import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  notes: defineTable({
    userId: v.string(),
    folderId: v.optional(v.id("folders")),
    title: v.string(),
    content: v.optional(v.string()),
    tags: v.array(v.string()),
    icon: v.optional(v.string()),
    coverImage: v.optional(v.string()),
    isArchived: v.boolean(),
    isPublished: v.boolean(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_folder", ["userId", "folderId"])
    .index("by_user_archived", ["userId", "isArchived"])
    .index("by_user_updated", ["userId", "updatedAt"])
    .searchIndex("search_title", {
      searchField: "title",
      filterFields: ["userId", "isArchived"],
    })
    .searchIndex("search_content", {
      searchField: "content",
      filterFields: ["userId", "isArchived"],
    }),

  folders: defineTable({
    userId: v.string(),
    name: v.string(),
    parentFolderId: v.optional(v.id("folders")),
    icon: v.optional(v.string()),
    orderIndex: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_parent", ["userId", "parentFolderId"]),
});
