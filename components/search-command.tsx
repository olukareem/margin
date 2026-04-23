"use client";

import { useQuery } from "convex/react";
import { File } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { api } from "@/convex/_generated/api";
import { useSearch } from "@/hook/use-search";

export const SearchCommand = () => {
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);

  const isOpen = useSearch((s) => s.isOpen);
  const onClose = useSearch((s) => s.onClose);
  const query = useSearch((s) => s.query);
  const setQuery = useSearch((s) => s.setQuery);

  const [debouncedQuery, setDebouncedQuery] = useState(query);
  useEffect(() => {
    const id = setTimeout(() => setDebouncedQuery(query), 180);
    return () => clearTimeout(id);
  }, [query]);

  const results = useQuery(api.notes.searchNotes, { query: debouncedQuery });

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  const onSelect = (id: string) => {
    router.push(`/notes/${id}`);
    onClose();
  };

  return (
    <CommandDialog
      open={isOpen}
      onOpenChange={onClose}
      shouldFilter={false}
      label="Search notes"
    >
      <CommandInput
        placeholder="Search your notes"
        value={query}
        onValueChange={setQuery}
      />
      <CommandList>
        {results === undefined ? (
          <div className="py-6 text-center text-sm text-muted-foreground">
            Searching…
          </div>
        ) : results.length === 0 ? (
          <CommandEmpty>No notes match that query.</CommandEmpty>
        ) : (
          <CommandGroup heading={debouncedQuery ? "Results" : "Recent"}>
            {results.map((note) => (
              <CommandItem
                key={note._id}
                value={note._id}
                onSelect={() => onSelect(note._id)}
              >
                {note.icon ? (
                  <p className="mr-2 text-[18px]">{note.icon}</p>
                ) : (
                  <File className="mr-2 h-4 w-4" />
                )}
                <span>{note.title || "Untitled"}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        )}
      </CommandList>
    </CommandDialog>
  );
};
