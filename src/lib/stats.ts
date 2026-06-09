import { addDays, dayDiff, weekdayMon0 } from './dates'

// Longest run of consecutive calendar days anywhere in the history.
export function longestStreak(dateKeys: string[]): number {
  if (dateKeys.length === 0) return 0
  const unique = Array.from(new Set(dateKeys)).sort()
  let best = 1
  let run = 1
  for (let i = 1; i < unique.length; i++) {
    run = dayDiff(unique[i], unique[i - 1]) === 1 ? run + 1 : 1
    if (run > best) best = run
  }
  return best
}

// Bucket a plank duration into a 0–4 intensity for the heatmap colour scale.
export function heatLevel(seconds: number | null): 0 | 1 | 2 | 3 | 4 {
  if (!seconds) return 0
  if (seconds < 30) return 1
  if (seconds < 60) return 2
  if (seconds < 120) return 3
  return 4
}

export interface HeatCell {
  date: string
  seconds: number | null
  future: boolean
  level: 0 | 1 | 2 | 3 | 4
}

// Build a GitHub-style grid: `weeks` columns, each a Mon→Sun run of 7 days,
// with the current week as the last column. Cells after today are `future`.
export function buildHeatmap(
  secondsByDate: Map<string, number>,
  weeks: number,
  today: string,
): HeatCell[][] {
  const mondayThisWeek = addDays(today, -weekdayMon0(today))
  const firstMonday = addDays(mondayThisWeek, -(weeks - 1) * 7)
  const columns: HeatCell[][] = []
  for (let c = 0; c < weeks; c++) {
    const col: HeatCell[] = []
    for (let r = 0; r < 7; r++) {
      const date = addDays(firstMonday, c * 7 + r)
      const future = dayDiff(date, today) > 0
      const seconds = secondsByDate.get(date) ?? null
      col.push({ date, seconds, future, level: future ? 0 : heatLevel(seconds) })
    }
    columns.push(col)
  }
  return columns
}
