"use client";

import { useQuery } from "convex/react";
import dynamic from "next/dynamic";
import { useMemo } from "react";

import { Cover } from "@/components/cover";
import { Toolbar } from "@/components/toolbar";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";

interface PreviewPageProps {
  params: { noteId: string };
}

const PreviewPage = ({ params }: PreviewPageProps) => {
  const Editor = useMemo(
    () => dynamic(() => import("@/components/editor"), { ssr: false }),
    [],
  );

  const note = useQuery(api.notes.getById, {
    id: params.noteId as Id<"notes">,
  });

  if (note === undefined) {
    return (
      <div>
        <Cover.Skeleton />
        <div className="md:max-w-3xl lg:max-w-4xl mx-auto mt-10">
          <div className="space-y-4 pl-8 pt-4">
            <Skeleton className="h-14 w-[50%]" />
            <Skeleton className="h-4 w-[80%]" />
            <Skeleton className="h-4 w-[40%]" />
          </div>
        </div>
      </div>
    );
  }

  if (note === null) {
    return (
      <div className="h-full flex items-center justify-center p-8 text-center">
        <p className="text-muted-foreground text-sm">
          This note does not exist or has been removed.
        </p>
      </div>
    );
  }

  return (
    <div className="pb-40">
      <Cover preview url={note.coverImage} />
      <div className="md:max-w-3xl lg:max-w-4xl mx-auto">
        <Toolbar preview initialData={note} />
        <Editor editable={false} initialContent={note.content} />
      </div>
    </div>
  );
};

export default PreviewPage;
