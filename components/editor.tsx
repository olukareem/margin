"use client";

import "@blocknote/core/fonts/inter.css";
import "@blocknote/mantine/style.css";

import { type BlockNoteEditor, type PartialBlock } from "@blocknote/core";
import { BlockNoteView } from "@blocknote/mantine";
import { useCreateBlockNote } from "@blocknote/react";
import { useTheme } from "next-themes";

import { useDebouncedCallback } from "@/hook/use-debounced-callback";
import { useSaveStatus } from "@/hook/use-save-status";
import { useEdgeStore } from "@/lib/edgestore";

interface EditorProps {
  onChange?: (value: string) => void;
  initialContent?: string;
  editable?: boolean;
}

const Editor = ({ onChange = () => {}, initialContent, editable }: EditorProps) => {
  const { resolvedTheme } = useTheme();
  const { edgestore } = useEdgeStore();
  const setState = useSaveStatus((s) => s.setState);
  const markSaved = useSaveStatus((s) => s.markSaved);

  const handleUpload = async (file: File) => {
    const response = await edgestore.publicFiles.upload({ file });
    return response.url;
  };

  const editor: BlockNoteEditor = useCreateBlockNote({
    initialContent: initialContent
      ? (JSON.parse(initialContent) as PartialBlock[])
      : undefined,
    uploadFile: handleUpload,
  });

  const debouncedSave = useDebouncedCallback<[string]>((value: string) => {
    try {
      onChange(value);
      markSaved();
    } catch {
      setState("error");
    }
  }, 500);

  return (
    <div>
      <BlockNoteView
        editor={editor}
        theme={resolvedTheme === "dark" ? "dark" : "light"}
        editable={editable}
        onChange={() => {
          if (editable === false) return;
          // Defer the save-status update out of BlockNote's emit frame.
          // BlockNote dispatches onChange inside its internal setState, so
          // calling Zustand synchronously here can chain into the same
          // render pass and trip React's "max update depth" guard.
          queueMicrotask(() => setState("saving"));
          debouncedSave(JSON.stringify(editor.document));
        }}
      />
    </div>
  );
};

export default Editor;
