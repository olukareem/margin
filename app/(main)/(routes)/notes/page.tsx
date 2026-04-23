"use client";

import { useUser } from "@clerk/clerk-react";
import { useMutation } from "convex/react";
import { NotebookPen, PlusCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { api } from "@/convex/_generated/api";

const NotesPage = () => {
  const { user } = useUser();
  const router = useRouter();
  const createNote = useMutation(api.notes.createNote);

  const onCreate = () => {
    const promise = createNote({}).then((id) => router.push(`/notes/${id}`));
    toast.promise(promise, {
      loading: "Creating note",
      success: "Note created",
      error: "Could not create note",
    });
  };

  return (
    <div className="h-full flex flex-col items-center justify-center gap-y-6 px-6 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
        <NotebookPen className="h-6 w-6 text-muted-foreground" />
      </div>
      <div className="space-y-2 max-w-md">
        <h2 className="text-xl font-semibold tracking-tight">
          Welcome{user?.firstName ? `, ${user.firstName}` : ""}.
        </h2>
        <p className="text-sm text-muted-foreground">
          Start a note, drop it in a folder, or tag it for later. Margin keeps
          the writing out of the way.
        </p>
      </div>
      <Button onClick={onCreate}>
        <PlusCircle className="h-4 w-4 mr-2" />
        Create a note
      </Button>
      <p className="text-xs text-muted-foreground">
        Or press{" "}
        <kbd className="rounded border px-1 py-0.5 text-[10px]">⌘N</kbd>
      </p>
    </div>
  );
};

export default NotesPage;
