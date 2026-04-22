"use client";

import { useMutation } from "convex/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { ConfirmModal } from "@/components/modals/confirm-modal";
import { Button } from "@/components/ui/button";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";

interface BannerProps {
  noteId: Id<"notes">;
}

export const Banner = ({ noteId }: BannerProps) => {
  const router = useRouter();
  const remove = useMutation(api.notes.deleteNote);
  const restore = useMutation(api.notes.restoreNote);

  const onRemove = () => {
    const promise = remove({ id: noteId }).then(() => router.push("/notes"));
    toast.promise(promise, {
      loading: "Deleting note",
      success: "Note deleted",
      error: "Could not delete note",
    });
  };

  const onRestore = () => {
    const promise = restore({ id: noteId });
    toast.promise(promise, {
      loading: "Restoring note",
      success: "Note restored",
      error: "Could not restore note",
    });
  };

  return (
    <div className="w-full bg-rose-500 text-center text-sm py-2 text-white flex items-center gap-x-2 justify-center">
      <p>This note is in the trash.</p>
      <Button
        size="sm"
        onClick={onRestore}
        variant="outline"
        className="border-white bg-transparent hover:bg-primary/5 text-white hover:text-white p-1 px-2 h-auto font-normal"
      >
        Restore
      </Button>
      <ConfirmModal onConfirm={onRemove}>
        <Button
          size="sm"
          variant="outline"
          className="border-white bg-transparent hover:bg-primary/5 text-white hover:text-white p-1 px-2 h-auto font-normal"
        >
          Delete forever
        </Button>
      </ConfirmModal>
    </div>
  );
};
