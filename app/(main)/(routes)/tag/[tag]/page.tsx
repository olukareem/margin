"use client";

import { useQuery } from "convex/react";
import { Hash } from "lucide-react";
import { useRouter } from "next/navigation";

import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/convex/_generated/api";

import { EmptyState } from "../../../_components/empty-state";

interface TagPageProps {
  params: { tag: string };
}

const TagPage = ({ params }: TagPageProps) => {
  const router = useRouter();
  const tag = decodeURIComponent(params.tag);
  const notes = useQuery(api.notes.listByTag, { tag });

  if (notes === undefined) {
    return (
      <div className="p-8 space-y-3 max-w-3xl mx-auto">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
      </div>
    );
  }

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <div className="flex items-center gap-x-2 mb-6">
        <Hash className="h-5 w-5 text-muted-foreground" />
        <h1 className="text-2xl font-medium">{tag}</h1>
        <span className="text-sm text-muted-foreground tabular-nums">
          {notes.length}
        </span>
      </div>

      {notes.length === 0 ? (
        <EmptyState
          icon={Hash}
          title={`No notes tagged "${tag}"`}
          description="Tag a note from its page to make it show up here."
        />
      ) : (
        <div className="divide-y rounded-md border">
          {notes.map((note) => (
            <div
              key={note._id}
              role="button"
              tabIndex={0}
              onClick={() => router.push(`/notes/${note._id}`)}
              onKeyDown={(e) => {
                if (e.key === "Enter") router.push(`/notes/${note._id}`);
              }}
              className="flex items-center gap-x-3 px-4 py-2 hover:bg-muted/50 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <span className="w-4 text-center text-muted-foreground">
                {note.icon ?? "·"}
              </span>
              <span className="flex-1 truncate">
                {note.title || "Untitled"}
              </span>
              <span className="text-xs text-muted-foreground">
                {new Date(note.updatedAt).toLocaleDateString()}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TagPage;
