"use client";

import { Plus, Search, Settings, Trash } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation } from "convex/react";
import { toast } from "sonner";

import { api } from "@/convex/_generated/api";
import { useSearch } from "@/hook/use-search";
import { useSettings } from "@/hook/use-settings";

import { UserItem } from "../user-items";

export const SidebarHeader = () => {
  const router = useRouter();
  const openSearch = useSearch((s) => s.onOpen);
  const openSettings = useSettings((s) => s.onOpen);
  const createNote = useMutation(api.notes.createNote);

  const onNew = async () => {
    const promise = createNote({}).then((id) => router.push(`/notes/${id}`));
    toast.promise(promise, {
      loading: "Creating note",
      success: "Note created",
      error: "Could not create note",
    });
  };

  return (
    <div className="flex flex-col">
      <UserItem />
      <nav className="flex flex-col px-1 pb-2">
        <button
          type="button"
          onClick={openSearch}
          className="flex items-center gap-x-2 px-3 py-1 text-sm text-muted-foreground hover:bg-primary/5 rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Search className="h-4 w-4" />
          <span className="flex-1 text-left">Search</span>
          <kbd className="hidden md:inline rounded border px-1.5 py-0.5 text-[10px] tabular-nums">
            ⌘K
          </kbd>
        </button>
        <button
          type="button"
          onClick={openSettings}
          className="flex items-center gap-x-2 px-3 py-1 text-sm text-muted-foreground hover:bg-primary/5 rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Settings className="h-4 w-4" />
          <span className="flex-1 text-left">Settings</span>
        </button>
        <button
          type="button"
          onClick={onNew}
          className="flex items-center gap-x-2 px-3 py-1 text-sm text-muted-foreground hover:bg-primary/5 rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Plus className="h-4 w-4" />
          <span className="flex-1 text-left">New note</span>
          <kbd className="hidden md:inline rounded border px-1.5 py-0.5 text-[10px] tabular-nums">
            ⌘N
          </kbd>
        </button>
        <Link
          href="/trash"
          className="flex items-center gap-x-2 px-3 py-1 text-sm text-muted-foreground hover:bg-primary/5 rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Trash className="h-4 w-4" />
          <span className="flex-1 text-left">Trash</span>
        </Link>
      </nav>
    </div>
  );
};
