import { create } from "zustand";
type S = { haptics: boolean; splitEveryMs: number | null };
type A = { toggleHaptics: () => void; setSplitEvery: (ms: number | null) => void };
export const useSettingsStore = create<S & A>((set) => ({
  haptics: true,
  splitEveryMs: 60_000,
  toggleHaptics: () => set((s) => ({ haptics: !s.haptics })),
  setSplitEvery: (ms) => set({ splitEveryMs: ms }),
}));
