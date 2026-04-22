"use client";

import { useMutation, useQuery } from "convex/react";
import { Search, Trash, Undo } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { ConfirmModal } from "@/components/modals/confirm-modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";

import { EmptyState } from "../../_components/empty-state";

const TrashPage = () => {
  const router = useRouter();
  const notes = useQuery(api.notes.listArchived);
  const restore = useMutation(api.notes.restoreNote);
  const remove = useMutation(api.notes.deleteNote);

  const [search, setSearch] = useState("");

  const onRestore = (id: Id<"notes">) => {
    const promise = restore({ id });
    toast.promise(promise, {
      loading: "Restoring",
      success: "Restored",
      error: "Could not restore",
    });
  };

  const onRemove = (id: Id<"notes">) => {
    const promise = remove({ id });
    toast.promise(promise, {
      loading: "Deleting",
      success: "Deleted",
      error: "Could not delete",
    });
  };

  if (notes === undefined) {
    return (
      <div className="p-8 space-y-3">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-10 w-full max-w-md" />
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
      </div>
    );
  }

  const filtered = notes.filter((n) =>
    n.title.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <h1 className="text-2xl font-medium mb-6">Trash</h1>
      <div className="relative mb-4">
        <Search className="h-4 w-4 absolute left-3 top-3 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Filter by title"
          className="pl-9"
        />
      </div>

      {notes.length === 0 ? (
        <EmptyState
          icon={Trash}
          title="Trash is empty"
          description="Archived notes show up here. Restore them, or delete them for good."
        />
      ) : (
        <div className="divide-y rounded-md border">
          {filtered.map((note) => (
            <div
              key={note._id}
              className="flex items-center gap-x-3 px-4 py-2 hover:bg-muted/50 cursor-pointer"
              onClick={() => router.push(`/notes/${note._id}`)}
            >
              <span className="w-4 text-center text-muted-foreground">
                {note.icon ?? "·"}
              </span>
              <span className="flex-1 truncate">
                {note.title || "Untitled"}
              </span>
              <Button
                size="icon"
                variant="ghost"
                onClick={(e) => {
                  e.stopPropagation();
                  onRestore(note._id);
                }}
                aria-label="Restore"
              >
                <Undo className="h-4 w-4" />
              </Button>
              <ConfirmModal onConfirm={() => onRemove(note._id)}>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={(e) => e.stopPropagation()}
                  aria-label="Delete forever"
                >
                  <Trash className="h-4 w-4 text-rose-500" />
                </Button>
              </ConfirmModal>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TrashPage;
