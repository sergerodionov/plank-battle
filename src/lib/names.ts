// First name only — the first whitespace-separated word of a full name.
// Returns '' for empty/missing input so callers can fall back cleanly.
export function firstName(fullName: string | null | undefined): string {
  return fullName?.trim().split(/\s+/)[0] ?? ''
}
