"use client";

import { useQuery } from "convex/react";
import { useParams } from "next/navigation";

import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";

import { Banner } from "./banner";
import { Menu } from "./menu";
import { Publish } from "./publish";
import { SaveIndicator } from "./save-indicator";
import { Title } from "./title";

export const Navbar = () => {
  const params = useParams<{ noteId?: string }>();
  const note = useQuery(
    api.notes.getById,
    params.noteId ? { id: params.noteId as Id<"notes"> } : "skip",
  );

  if (note === undefined) {
    return (
      <nav className="bg-background px-3 py-2 w-full flex items-center justify-between border-b">
        <Title.Skeleton />
        <div className="flex items-center gap-x-2">
          <Menu.Skeleton />
        </div>
      </nav>
    );
  }

  if (note === null) return null;

  return (
    <>
      <nav className="bg-background px-3 py-2 w-full flex items-center gap-x-4 border-b">
        <div className="flex items-center justify-between w-full gap-x-3">
          <Title initialData={note} />
          <div className="flex items-center gap-x-3">
            <SaveIndicator />
            <Publish initialData={note} />
            <Menu noteId={note._id} />
          </div>
        </div>
      </nav>
      {note.isArchived && <Banner noteId={note._id} />}
    </>
  );
};
