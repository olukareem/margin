"use client";

import { useMutation, useQuery } from "convex/react";
import { FolderOpen, PlusCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";

import { EmptyState } from "../../../_components/empty-state";

interface FolderPageProps {
  params: { folderId: string };
}

const FolderPage = ({ params }: FolderPageProps) => {
  const router = useRouter();
  const folderId = params.folderId as Id<"folders">;

  const folder = useQuery(api.folders.getById, { id: folderId });
  const notes = useQuery(api.notes.listByFolder, { folderId });
  const createNote = useMutation(api.notes.createNote);

  const onCreate = () => {
    const promise = createNote({ folderId }).then((id) =>
      router.push(`/notes/${id}`),
    );
    toast.promise(promise, {
      loading: "Creating note",
      success: "Note created",
      error: "Could not create note",
    });
  };

  if (folder === undefined || notes === undefined) {
    return (
      <div className="p-8 space-y-3 max-w-3xl mx-auto">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-8 w-full" />
      </div>
    );
  }

  if (folder === null) {
    return (
      <div className="p-8 max-w-3xl mx-auto">
        <EmptyState
          icon={FolderOpen}
          title="Folder not found"
          description="It may have been deleted."
        />
      </div>
    );
  }

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-x-2">
          {folder.icon && <span className="text-xl">{folder.icon}</span>}
          <h1 className="text-2xl font-medium">{folder.name}</h1>
        </div>
        <Button size="sm" onClick={onCreate}>
          <PlusCircle className="h-4 w-4 mr-2" />
          New note
        </Button>
      </div>

      {notes.length === 0 ? (
        <EmptyState
          icon={FolderOpen}
          title="This folder is empty"
          description="Drop a note in here from the sidebar, or create a new one."
          action={
            <Button size="sm" variant="outline" onClick={onCreate}>
              <PlusCircle className="h-4 w-4 mr-2" />
              New note
            </Button>
          }
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

export default FolderPage;
