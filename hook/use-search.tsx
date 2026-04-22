import { create } from "zustand";

type SearchStore = {
  isOpen: boolean;
  query: string;
  onOpen: () => void;
  onClose: () => void;
  toggle: () => void;
  setQuery: (q: string) => void;
};

export const useSearch = create<SearchStore>((set, get) => ({
  isOpen: false,
  query: "",
  onOpen: () => set({ isOpen: true }),
  onClose: () => set({ isOpen: false, query: "" }),
  toggle: () => set({ isOpen: !get().isOpen, query: "" }),
  setQuery: (q) => set({ query: q }),
}));
