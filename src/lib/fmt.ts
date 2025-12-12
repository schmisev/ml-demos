export function num(n: number) {
  return n.toLocaleString("en-US", { useGrouping: false, roundingPriority: "auto" });
}