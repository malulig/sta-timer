export const mmss = (ms: number) => {
  const s = Math.floor(ms / 1000),
    m = Math.floor(s / 60),
    r = s % 60;
  return `${String(m).padStart(2, "0")}:${String(r).padStart(2, "0")}`;
};
