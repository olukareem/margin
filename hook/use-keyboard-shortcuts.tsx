"use client";

import { useEffect } from "react";

export type Shortcut = {
  key: string;
  meta?: boolean;
  shift?: boolean;
  alt?: boolean;
  handler: (event: KeyboardEvent) => void;
  preventDefault?: boolean;
  allowInInput?: boolean;
};

function isInsideEditable(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  if (tag === "INPUT" || tag === "TEXTAREA") return true;
  if (target.isContentEditable) return true;
  return false;
}

export function useKeyboardShortcuts(shortcuts: Shortcut[]): void {
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      for (const s of shortcuts) {
        const metaMatch = s.meta
          ? event.metaKey || event.ctrlKey
          : !event.metaKey && !event.ctrlKey;
        const shiftMatch = (s.shift ?? false) === event.shiftKey;
        const altMatch = (s.alt ?? false) === event.altKey;
        const keyMatch = event.key.toLowerCase() === s.key.toLowerCase();
        if (!keyMatch || !metaMatch || !shiftMatch || !altMatch) continue;
        if (!s.allowInInput && isInsideEditable(event.target)) continue;
        if (s.preventDefault !== false) event.preventDefault();
        s.handler(event);
        return;
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [shortcuts]);
}
