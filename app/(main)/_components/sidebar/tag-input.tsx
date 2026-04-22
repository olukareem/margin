"use client";

import { useMutation } from "convex/react";
import { Hash, X } from "lucide-react";
import { type KeyboardEvent, useState } from "react";
import { toast } from "sonner";

import { api } from "@/convex/_generated/api";
import type { Doc } from "@/convex/_generated/dataModel";

interface TagInputProps {
  note: Doc<"notes">;
}

export const TagInput = ({ note }: TagInputProps) => {
  const addTag = useMutation(api.notes.addTag);
  const removeTag = useMutation(api.notes.removeTag);
  const [value, setValue] = useState("");

  const onKeyDown = async (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== "Enter" && e.key !== ",") return;
    e.preventDefault();
    const tag = value.trim().toLowerCase();
    if (!tag) return;
    setValue("");
    try {
      await addTag({ id: note._id, tag });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not add tag");
    }
  };

  const onRemove = async (tag: string) => {
    try {
      await removeTag({ id: note._id, tag });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not remove tag");
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      {note.tags.map((tag) => (
        <span
          key={tag}
          className="group inline-flex items-center gap-x-1 rounded-full border bg-muted px-2 py-0.5 text-xs text-muted-foreground"
        >
          <Hash className="h-3 w-3" />
          {tag}
          <button
            type="button"
            onClick={() => onRemove(tag)}
            className="ml-1 rounded-full opacity-60 group-hover:opacity-100 hover:bg-primary/10"
            aria-label={`Remove ${tag}`}
          >
            <X className="h-3 w-3" />
          </button>
        </span>
      ))}
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={onKeyDown}
        placeholder={note.tags.length ? "Add tag" : "Add tags"}
        className="h-6 min-w-[80px] bg-transparent text-xs text-foreground placeholder:text-muted-foreground outline-none"
      />
    </div>
  );
};
