"use client";

import { MoreHorizontal, Trash } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
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
  const params = useParams<{ noteId?: string }>();
  const archive = useMutation(api.notes.archiveNote);

  const isActive = params.noteId === note._id;

  const onArchive = () => {
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
      className={cn(
        "group flex items-center gap-x-2 py-1 pr-2 text-sm rounded-sm hover:bg-sidebar-hover",
        isActive && "bg-sidebar-hover text-sidebar-foreground",
      )}
      style={{ paddingLeft }}
    >
      <Link
        href={`/notes/${note._id}`}
        className="flex flex-1 items-center gap-x-2 min-w-0 rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <span className="w-4 text-center text-muted-foreground">
          {note.icon ?? "·"}
        </span>
        <span className="flex-1 truncate">{note.title || "Untitled"}</span>
      </Link>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            size="icon"
            variant="ghost"
            className="h-6 w-6 shrink-0 opacity-0 group-hover:opacity-100 focus-visible:opacity-100"
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
