"use client";

import { useMutation } from "convex/react";
import { ImageIcon, Smile, X } from "lucide-react";
import { type ElementRef, useRef, useState } from "react";
import TextareaAutoSize from "react-textarea-autosize";

import { Button } from "@/components/ui/button";
import { api } from "@/convex/_generated/api";
import type { Doc } from "@/convex/_generated/dataModel";
import { useCoverImage } from "@/hook/use-cover-image";
import { useDebouncedCallback } from "@/hook/use-debounced-callback";
import { useSaveStatus } from "@/hook/use-save-status";

import { IconPicker } from "./icon-picker";

interface ToolbarProps {
  initialData: Doc<"notes">;
  preview?: boolean;
}

export const Toolbar = ({ initialData, preview }: ToolbarProps) => {
  const inputRef = useRef<ElementRef<"textarea">>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(initialData.title);

  const update = useMutation(api.notes.updateNote);
  const removeIcon = useMutation(api.notes.removeIcon);
  const coverImage = useCoverImage();
  const setState = useSaveStatus((s) => s.setState);
  const markSaved = useSaveStatus((s) => s.markSaved);

  const debouncedUpdate = useDebouncedCallback<[string]>(async (next) => {
    try {
      await update({ id: initialData._id, title: next || "Untitled" });
      markSaved();
    } catch {
      setState("error");
    }
  }, 400);

  const enableInput = () => {
    if (preview) return;
    setIsEditing(true);
    setTimeout(() => {
      setValue(initialData.title);
      inputRef.current?.focus();
    }, 0);
  };

  const disableInput = () => setIsEditing(false);

  const onInput = (next: string) => {
    setValue(next);
    setState("saving");
    debouncedUpdate(next);
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      disableInput();
    }
  };

  const onIconSelect = async (icon: string) => {
    setState("saving");
    try {
      await update({ id: initialData._id, icon });
      markSaved();
    } catch {
      setState("error");
    }
  };

  const onRemoveIcon = async () => {
    setState("saving");
    try {
      await removeIcon({ id: initialData._id });
      markSaved();
    } catch {
      setState("error");
    }
  };

  return (
    <div className="pl-[54px] group relative">
      {!!initialData.icon && !preview && (
        <div className="flex items-center gap-x-2 group/icon pt-6">
          <IconPicker onChange={onIconSelect}>
            <p className="text-6xl hover:opacity-75 transition">
              {initialData.icon}
            </p>
          </IconPicker>
          <Button
            onClick={onRemoveIcon}
            className="rounded-full opacity-0 group-hover/icon:opacity-100 transition text-muted-foreground text-xs"
            variant="outline"
            size="icon"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}
      {!!initialData.icon && preview && (
        <p className="text-6xl pt-6">{initialData.icon}</p>
      )}

      <div className="opacity-0 group-hover:opacity-100 flex items-center gap-x-1 py-4">
        {!initialData.icon && !preview && (
          <IconPicker asChild onChange={onIconSelect}>
            <Button
              className="text-muted-foreground text-xs"
              variant="outline"
              size="sm"
            >
              <Smile className="h-4 w-4 mr-2" />
              Add icon
            </Button>
          </IconPicker>
        )}
        {!initialData.coverImage && !preview && (
          <Button
            onClick={coverImage.onOpen}
            className="text-muted-foreground text-xs"
            variant="outline"
            size="sm"
          >
            <ImageIcon className="h-4 w-4 mr-2" />
            Add cover
          </Button>
        )}
      </div>
      {isEditing && !preview ? (
        <TextareaAutoSize
          ref={inputRef}
          onBlur={disableInput}
          onKeyDown={onKeyDown}
          value={value}
          onChange={(e) => onInput(e.target.value)}
          className="text-5xl bg-transparent font-bold break-words outline-none text-foreground resize-none"
        />
      ) : (
        <div
          onClick={enableInput}
          className="pb-[11.5px] text-5xl font-bold break-words outline-none text-foreground"
        >
          {initialData.title}
        </div>
      )}
    </div>
  );
};
