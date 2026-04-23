"use client";

import { MoreHorizontal, Trash } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { useMutation } from "convex/react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { api } from "@/convex/_generated/api";
import type { Doc } from "@/convex/_generated/dataModel";
import { cn } from "@/lib/utils";

interface NoteRowProps {
  note: Doc<"notes">;
  depth?: number;
}

export const NoteRow = ({ note, depth = 0 }: NoteRowProps) => {
  const router = useRouter();
  const params = useParams<{ noteId?: string }>();
  const archive = useMutation(api.notes.archiveNote);

  const isActive = params.noteId === note._id;

  const onArchive = (e: React.MouseEvent) => {
    e.stopPropagation();
    const promise = archive({ id: note._id });
    toast.promise(promise, {
      loading: "Moving to trash",
      success: "Moved to trash",
      error: "Could not archive note",
    });
  };

  const paddingLeft = 12 + depth * 14;

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => router.push(`/notes/${note._id}`)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          router.push(`/notes/${note._id}`);
        }
      }}
      style={{ paddingLeft }}
      className={cn(
        "group flex items-center gap-x-2 py-1 pr-2 text-sm rounded-sm hover:bg-sidebar-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        isActive && "bg-sidebar-hover text-sidebar-foreground",
      )}
    >
      <span className="w-4 text-center text-muted-foreground">
        {note.icon ?? "·"}
      </span>
      <span className="flex-1 truncate">{note.title || "Untitled"}</span>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            size="icon"
            variant="ghost"
            onClick={(e) => e.stopPropagation()}
            className="h-6 w-6 opacity-0 group-hover:opacity-100"
            aria-label="Note actions"
          >
            <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" side="right">
          <DropdownMenuItem onClick={onArchive} className="text-sm">
            <Trash className="mr-2 h-4 w-4" />
            Move to trash
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
