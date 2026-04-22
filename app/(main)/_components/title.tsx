"use client";

import { useMutation } from "convex/react";
import { useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/convex/_generated/api";
import type { Doc } from "@/convex/_generated/dataModel";
import { useDebouncedCallback } from "@/hook/use-debounced-callback";
import { useSaveStatus } from "@/hook/use-save-status";

interface TitleProps {
  initialData: Doc<"notes">;
}

export const Title = ({ initialData }: TitleProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const update = useMutation(api.notes.updateNote);
  const setState = useSaveStatus((s) => s.setState);
  const markSaved = useSaveStatus((s) => s.markSaved);

  const [title, setTitle] = useState(initialData.title || "Untitled");
  const [isEditing, setIsEditing] = useState(false);

  const debouncedUpdate = useDebouncedCallback<[string]>(async (next) => {
    try {
      await update({ id: initialData._id, title: next || "Untitled" });
      markSaved();
    } catch {
      setState("error");
    }
  }, 400);

  const enableInput = () => {
    setTitle(initialData.title);
    setIsEditing(true);
    setTimeout(() => {
      inputRef.current?.focus();
      inputRef.current?.setSelectionRange(0, inputRef.current.value.length);
    }, 0);
  };

  const disableInput = () => setIsEditing(false);

  const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const next = event.target.value;
    setTitle(next);
    setState("saving");
    debouncedUpdate(next);
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") disableInput();
  };

  return (
    <div className="flex items-center gap-x-1">
      {!!initialData.icon && <p>{initialData.icon}</p>}
      {isEditing ? (
        <Input
          ref={inputRef}
          onClick={enableInput}
          onBlur={disableInput}
          onChange={onChange}
          onKeyDown={onKeyDown}
          value={title}
          className="h-7 px-2 focus-visible:ring-transparent"
        />
      ) : (
        <Button
          onClick={enableInput}
          variant="ghost"
          size="sm"
          className="font-normal h-auto p-1"
        >
          <span className="truncate">{initialData.title}</span>
        </Button>
      )}
    </div>
  );
};

Title.Skeleton = function TitleSkeleton() {
  return <Skeleton className="h-9 w-20 rounded-md" />;
};
