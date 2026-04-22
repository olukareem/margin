import { create } from "zustand";

export type SaveState = "idle" | "saving" | "saved" | "error";

type SaveStatusStore = {
  state: SaveState;
  lastSavedAt: number | null;
  setState: (s: SaveState) => void;
  markSaved: () => void;
};

export const useSaveStatus = create<SaveStatusStore>((set) => ({
  state: "idle",
  lastSavedAt: null,
  setState: (s) => set({ state: s }),
  markSaved: () => set({ state: "saved", lastSavedAt: Date.now() }),
}));
