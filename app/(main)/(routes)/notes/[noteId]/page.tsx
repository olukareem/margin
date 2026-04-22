"use client";

import { useMutation, useQuery } from "convex/react";
import dynamic from "next/dynamic";
import { useMemo } from "react";

import { Cover } from "@/components/cover";
import { Skeleton } from "@/components/ui/skeleton";
import { Toolbar } from "@/components/toolbar";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";

import { TagInput } from "../../../_components/sidebar/tag-input";

interface NotePageProps {
  params: { noteId: string };
}

const NotePage = ({ params }: NotePageProps) => {
  const Editor = useMemo(
    () => dynamic(() => import("@/components/editor"), { ssr: false }),
    [],
  );

  const note = useQuery(api.notes.getById, {
    id: params.noteId as Id<"notes">,
  });
  const update = useMutation(api.notes.updateNote);

  const onChange = (content: string) => {
    update({ id: params.noteId as Id<"notes">, content });
  };

  if (note === undefined) {
    return (
      <div>
        <Cover.Skeleton />
        <div className="md:max-w-3xl lg:max-w-4xl mx-auto mt-10">
          <div className="space-y-4 pl-8 pt-4">
            <Skeleton className="h-14 w-[50%]" />
            <Skeleton className="h-4 w-[80%]" />
            <Skeleton className="h-4 w-[40%]" />
            <Skeleton className="h-4 w-[60%]" />
          </div>
        </div>
      </div>
    );
  }

  if (note === null) {
    return (
      <div className="h-full flex items-center justify-center p-8 text-center">
        <p className="text-muted-foreground text-sm">Note not found.</p>
      </div>
    );
  }

  return (
    <div className="pb-40">
      <Cover url={note.coverImage} />
      <div className="md:max-w-3xl lg:max-w-4xl mx-auto">
        <Toolbar initialData={note} />
        <div className="px-[54px] pb-6">
          <TagInput note={note} />
        </div>
        <Editor onChange={onChange} initialContent={note.content} />
      </div>
    </div>
  );
};

export default NotePage;
