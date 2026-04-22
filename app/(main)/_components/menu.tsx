"use client";

import { useUser } from "@clerk/clerk-react";
import { useMutation } from "convex/react";
import { MoreHorizontal, Trash } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";

interface MenuProps {
  noteId: Id<"notes">;
}

export const Menu = ({ noteId }: MenuProps) => {
  const router = useRouter();
  const { user } = useUser();
  const archive = useMutation(api.notes.archiveNote);

  const onArchive = () => {
    const promise = archive({ id: noteId }).then(() => router.push("/notes"));
    toast.promise(promise, {
      loading: "Moving to trash",
      success: "Moved to trash",
      error: "Could not archive note",
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="sm" variant="ghost" aria-label="Note actions">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-60"
        align="end"
        alignOffset={8}
        forceMount
      >
        <DropdownMenuItem onClick={onArchive}>
          <Trash className="h-4 w-4 mr-2" />
          Move to trash
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <div className="text-xs text-muted-foreground p-2">
          Last edited by {user?.fullName ?? "you"}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

Menu.Skeleton = function MenuSkeleton() {
  return <Skeleton className="h-10 w-10" />;
};
