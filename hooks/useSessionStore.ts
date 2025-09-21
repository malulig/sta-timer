import { create } from "zustand";
const TICK_MS = 200;

type S = {
  running: boolean;
  startedAt: number | null;
  firstContractionAt: number | null;
  elapsedTotal: number;
  elapsedPost: number;
  targetPost: number;
  intervalId: any | null;
};
type A = {
  setTargetPost: (ms: number) => void;
  start: () => void;
  pause: () => void;
  stop: () => { elapsedTotal: number; elapsedPost: number; firstContractionAt: number | null };
  markFirstContraction: () => void;
  tick: () => void;
};

export const useSessionStore = create<S & A>((set, get) => ({
  running: false,
  startedAt: null,
  firstContractionAt: null,
  elapsedTotal: 0,
  elapsedPost: 0,
  targetPost: 90_000,
  intervalId: null,

  setTargetPost: (ms) => set({ targetPost: ms }),

  start: () => {
    if (get().running) return;
    const id = setInterval(() => get().tick(), TICK_MS);
    set({
      running: true,
      startedAt: Date.now(),
      firstContractionAt: null,
      elapsedTotal: 0,
      elapsedPost: 0,
      intervalId: id,
    });
  },

  pause: () => {
    const id = get().intervalId;
    if (id) clearInterval(id);
    set({ running: false, intervalId: null });
  },

  stop: () => {
    const { intervalId, elapsedTotal, elapsedPost, firstContractionAt } = get();
    if (intervalId) clearInterval(intervalId);
    set({ running: false, intervalId: null, startedAt: null, firstContractionAt: null });
    return { elapsedTotal, elapsedPost, firstContractionAt };
  },

  markFirstContraction: () => {
    if (!get().running || get().firstContractionAt) return;
    set({ firstContractionAt: Date.now() });
  },

  tick: () => {
    const { startedAt, firstContractionAt } = get();
    if (!startedAt) return;
    const now = Date.now();
    const elapsedTotal = now - startedAt;
    const elapsedPost = firstContractionAt ? now - firstContractionAt : 0;
    set({ elapsedTotal, elapsedPost });
  },
}));
