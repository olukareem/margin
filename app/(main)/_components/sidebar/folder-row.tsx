"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight, MoreHorizontal, Plus, Trash } from "lucide-react";
import { useMutation, useQuery } from "convex/react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";

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

import { NoteRow } from "./note-row";

interface FolderRowProps {
  folder: Doc<"folders">;
  depth?: number;
}

export const FolderRow = ({ folder, depth = 0 }: FolderRowProps) => {
  const [expanded, setExpanded] = useState(true);
  const router = useRouter();
  const params = useParams<{ folderId?: string }>();

  const notes = useQuery(api.notes.listByFolder, { folderId: folder._id });
  const createNote = useMutation(api.notes.createNote);
  const deleteFolder = useMutation(api.folders.deleteFolder);

  const isActive = params.folderId === folder._id;
  const paddingLeft = 8 + depth * 14;

  const onCreateNote = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setExpanded(true);
    const promise = createNote({ folderId: folder._id }).then((id) =>
      router.push(`/notes/${id}`),
    );
    toast.promise(promise, {
      loading: "Creating note",
      success: "Note created",
      error: "Could not create note",
    });
  };

  const onDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const promise = deleteFolder({ id: folder._id });
    toast.promise(promise, {
      loading: "Deleting folder",
      success: "Folder deleted. Notes moved to root.",
      error: "Could not delete folder",
    });
  };

  return (
    <div>
      <div
        role="button"
        tabIndex={0}
        onClick={() => {
          setExpanded((v) => !v);
          router.push(`/folder/${folder._id}`);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setExpanded((v) => !v);
          }
        }}
        style={{ paddingLeft }}
        className={cn(
          "group flex items-center gap-x-1 py-1 pr-2 text-sm rounded-sm hover:bg-sidebar-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          isActive && "bg-sidebar-hover text-sidebar-foreground",
        )}
      >
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setExpanded((v) => !v);
          }}
          className="h-5 w-5 shrink-0 rounded-sm hover:bg-sidebar-hover flex items-center justify-center"
          aria-label={expanded ? "Collapse folder" : "Expand folder"}
        >
          {expanded ? (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          )}
        </button>
        <span className="w-4 text-center text-muted-foreground">
          {folder.icon ?? ""}
        </span>
        <span className="flex-1 truncate font-medium">{folder.name}</span>
        <Button
          size="icon"
          variant="ghost"
          onClick={onCreateNote}
          className="h-6 w-6 opacity-0 group-hover:opacity-100"
          aria-label="New note in folder"
        >
          <Plus className="h-4 w-4 text-muted-foreground" />
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              size="icon"
              variant="ghost"
              onClick={(e) => e.stopPropagation()}
              className="h-6 w-6 opacity-0 group-hover:opacity-100"
              aria-label="Folder actions"
            >
              <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" side="right">
            <DropdownMenuItem onClick={onDelete} className="text-sm">
              <Trash className="mr-2 h-4 w-4" />
              Delete folder
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      {expanded && notes && notes.length > 0 && (
        <div className="flex flex-col">
          {notes.map((n) => (
            <NoteRow key={n._id} note={n} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
};
