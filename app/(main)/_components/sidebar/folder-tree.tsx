"use client";

import { useMutation, useQuery } from "convex/react";
import { FolderPlus, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/convex/_generated/api";

import { FolderRow } from "./folder-row";
import { NoteRow } from "./note-row";

export const FolderTree = () => {
  const router = useRouter();
  const folders = useQuery(api.folders.listFolders);
  const rootNotes = useQuery(api.notes.listByFolder, { folderId: undefined });
  const createNote = useMutation(api.notes.createNote);
  const createFolder = useMutation(api.folders.createFolder);

  const [folderName, setFolderName] = useState("");
  const [folderPopoverOpen, setFolderPopoverOpen] = useState(false);

  const onCreateNote = async () => {
    const promise = createNote({}).then((id) => router.push(`/notes/${id}`));
    toast.promise(promise, {
      loading: "Creating note",
      success: "Note created",
      error: "Could not create note",
    });
  };

  const onCreateFolder = async () => {
    const name = folderName.trim();
    if (!name) return;
    const promise = createFolder({ name }).then(() => {
      setFolderName("");
      setFolderPopoverOpen(false);
    });
    toast.promise(promise, {
      loading: "Creating folder",
      success: "Folder created",
      error: "Could not create folder",
    });
  };

  const isLoading = folders === undefined || rootNotes === undefined;

  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between px-3 pt-3 pb-1">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Notes
        </p>
        <div className="flex items-center gap-x-1">
          <Button
            size="icon"
            variant="ghost"
            className="h-6 w-6"
            onClick={onCreateNote}
            aria-label="New note"
          >
            <Plus className="h-4 w-4 text-muted-foreground" />
          </Button>
          <Popover
            open={folderPopoverOpen}
            onOpenChange={setFolderPopoverOpen}
          >
            <PopoverTrigger asChild>
              <Button
                size="icon"
                variant="ghost"
                className="h-6 w-6"
                aria-label="New folder"
              >
                <FolderPlus className="h-4 w-4 text-muted-foreground" />
              </Button>
            </PopoverTrigger>
            <PopoverContent align="start" className="w-64">
              <div className="flex flex-col gap-y-2">
                <p className="text-xs text-muted-foreground">
                  Name your folder
                </p>
                <Input
                  value={folderName}
                  onChange={(e) => setFolderName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") onCreateFolder();
                  }}
                  placeholder="Research"
                  autoFocus
                />
                <Button size="sm" onClick={onCreateFolder}>
                  Create folder
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {isLoading && (
        <div className="px-3 py-1 space-y-2">
          <Skeleton className="h-5 w-4/5" />
          <Skeleton className="h-5 w-3/5" />
          <Skeleton className="h-5 w-2/3" />
        </div>
      )}

      {!isLoading && folders && folders.length === 0 && rootNotes!.length === 0 && (
        <p className="px-3 py-2 text-xs text-muted-foreground">
          No notes yet. Press{" "}
          <kbd className="rounded border px-1 py-0.5 text-[10px]">⌘N</kbd> to
          start.
        </p>
      )}

      <div className="flex flex-col">
        {folders?.map((folder) => (
          <FolderRow key={folder._id} folder={folder} />
        ))}
        {rootNotes?.map((note) => (
          <NoteRow key={note._id} note={note} />
        ))}
      </div>
    </div>
  );
};
