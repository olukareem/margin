"use client";

import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";
import { useSaveStatus } from "@/hook/use-save-status";

function formatRelative(then: number, now: number): string {
  const diff = Math.max(0, now - then);
  if (diff < 5_000) return "just now";
  if (diff < 60_000) return `${Math.floor(diff / 1000)}s ago`;
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`;
  return new Date(then).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export const SaveIndicator = () => {
  const state = useSaveStatus((s) => s.state);
  const lastSavedAt = useSaveStatus((s) => s.lastSavedAt);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 15_000);
    return () => clearInterval(id);
  }, []);

  let label: string;
  let tone: string;

  switch (state) {
    case "saving":
      label = "Saving";
      tone = "text-muted-foreground";
      break;
    case "saved":
      label = lastSavedAt ? `Saved ${formatRelative(lastSavedAt, now)}` : "Saved";
      tone = "text-muted-foreground";
      break;
    case "error":
      label = "Save failed";
      tone = "text-rose-500";
      break;
    default:
      label = lastSavedAt ? `Saved ${formatRelative(lastSavedAt, now)}` : "";
      tone = "text-muted-foreground";
  }

  if (!label) return null;

  return (
    <span
      className={cn("flex items-center gap-x-2 text-xs tabular-nums", tone)}
      aria-live="polite"
    >
      <span
        className={cn(
          "h-1.5 w-1.5 rounded-full",
          state === "saving" && "bg-amber-400 animate-pulse",
          state === "saved" && "bg-emerald-500",
          state === "error" && "bg-rose-500",
          state === "idle" && "bg-muted-foreground/40",
        )}
      />
      {label}
    </span>
  );
};
