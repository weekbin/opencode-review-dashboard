// R14 #23: pure client-side sort reducer for the Conversation panel.
// 4 modes: "newest" (default, preserves pre-R14 chronological order),
// "oldest" (reverse of newest), "severity" (high→low, then newest tie-break),
// "file" (file path A–Z case-insensitive, then line, then newest tie-break).
// Exported via __test for unit tests; safe to call with an empty array.

export type SortFindingsBy = "newest" | "oldest" | "severity" | "file";

export const SEVERITY_RANK: Record<string, number> = { high: 0, medium: 1, low: 2 };

export type SortableFinding = {
  round: number;
  file: string;
  start_line: number;
  severity: string;
  created_at: number;
};

export function sortConversationEntries<T extends SortableFinding>(
  entries: T[],
  by: SortFindingsBy,
): T[] {
  if (by === "newest") {
    return [...entries].sort((a, b) => {
      if (a.round !== b.round) return b.round - a.round;
      return a.created_at - b.created_at;
    });
  }
  if (by === "oldest") {
    return [...entries].sort((a, b) => {
      if (a.round !== b.round) return a.round - b.round;
      return a.created_at - b.created_at;
    });
  }
  if (by === "severity") {
    return [...entries].sort((a, b) => {
      const sa = SEVERITY_RANK[a.severity] ?? 99;
      const sb = SEVERITY_RANK[b.severity] ?? 99;
      if (sa !== sb) return sa - sb;
      if (a.round !== b.round) return b.round - a.round;
      return a.created_at - b.created_at;
    });
  }
  // "file" — case-insensitive A–Z by file path, then start_line, then round DESC.
  return [...entries].sort((a, b) => {
    const fa = a.file.toLowerCase();
    const fb = b.file.toLowerCase();
    if (fa !== fb) return fa.localeCompare(fb);
    if (a.start_line !== b.start_line) return a.start_line - b.start_line;
    if (a.round !== b.round) return b.round - a.round;
    return a.created_at - b.created_at;
  });
}
