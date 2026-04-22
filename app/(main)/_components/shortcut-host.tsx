"use client";

import { useMutation } from "convex/react";
import { useParams, useRouter } from "next/navigation";
import { useMemo } from "react";
import { toast } from "sonner";

import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import {
  type Shortcut,
  useKeyboardShortcuts,
} from "@/hook/use-keyboard-shortcuts";
import { useSaveStatus } from "@/hook/use-save-status";
import { useSearch } from "@/hook/use-search";

export const ShortcutHost = () => {
  const router = useRouter();
  const params = useParams<{ noteId?: string }>();
  const openSearch = useSearch((s) => s.onOpen);
  const markSaved = useSaveStatus((s) => s.markSaved);

  const createNote = useMutation(api.notes.createNote);
  const archive = useMutation(api.notes.archiveNote);

  const shortcuts = useMemo<Shortcut[]>(
    () => [
      {
        key: "k",
        meta: true,
        allowInInput: true,
        handler: () => openSearch(),
      },
      {
        key: "n",
        meta: true,
        handler: async () => {
          try {
            const id = await createNote({});
            router.push(`/notes/${id}`);
          } catch {
            toast.error("Could not create note");
          }
        },
      },
      {
        key: "s",
        meta: true,
        allowInInput: true,
        handler: () => markSaved(),
      },
      {
        key: "Backspace",
        meta: true,
        handler: async () => {
          if (!params.noteId) return;
          try {
            await archive({ id: params.noteId as Id<"notes"> });
            toast.success("Moved to trash");
            router.push("/notes");
          } catch {
            toast.error("Could not archive note");
          }
        },
      },
    ],
    [openSearch, markSaved, createNote, archive, router, params.noteId],
  );

  useKeyboardShortcuts(shortcuts);
  return null;
};
