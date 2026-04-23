"use client";

import { useMutation } from "convex/react";
import { useParams } from "next/navigation";
import { useState } from "react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { SingleImageDropzone } from "@/components/single-image-dropzone";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { useCoverImage } from "@/hook/use-cover-image";
import { useEdgeStore } from "@/lib/edgestore";

export const CoverImageModal = () => {
  const params = useParams<{ noteId?: string }>();
  const update = useMutation(api.notes.updateNote);
  const coverImage = useCoverImage();
  const { edgestore } = useEdgeStore();
  const [file, setFile] = useState<File>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onClose = () => {
    setFile(undefined);
    setIsSubmitting(false);
    coverImage.onClose();
  };

  const onChange = async (file?: File) => {
    if (!file || !params.noteId) return;
    setIsSubmitting(true);
    setFile(file);

    const res = await edgestore.publicFiles.upload({
      file,
      options: { replaceTargetUrl: coverImage.url },
    });

    await update({
      id: params.noteId as Id<"notes">,
      coverImage: res.url,
    });

    onClose();
  };

  return (
    <Dialog open={coverImage.isOpen} onOpenChange={coverImage.onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-center text-lg font-semibold">
            Cover image
          </DialogTitle>
          <DialogDescription className="sr-only">
            Upload an image to display as the cover for this note.
          </DialogDescription>
        </DialogHeader>
        <SingleImageDropzone
          className="w-full outline-none"
          disabled={isSubmitting}
          value={file}
          onChange={onChange}
        />
      </DialogContent>
    </Dialog>
  );
};
