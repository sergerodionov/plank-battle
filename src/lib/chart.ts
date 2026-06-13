import { addDays, dayDiff } from './dates'

export type Point = [number, number]

// One day on the shared challenge timeline. `dayIndex` is 0-based from the
// challenge start; `value` is that day's plank seconds (0 = missed that day).
export interface DayPoint {
  dayIndex: number
  value: number
}

const round = (n: number) => Math.round(n * 100) / 100

// Catmull-Rom spline → SVG cubic-bézier segments (no leading "M").
// When yMin/yMax are given, control points are clamped to that band so sharp
// drops to the baseline (missed days) don't overshoot outside the plot.
export function smoothCurve(pts: Point[], yMin?: number, yMax?: number): string {
  const clampY = (y: number) =>
    yMin == null || yMax == null ? y : Math.max(yMin, Math.min(yMax, y))
  let d = ''
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i]
    const p1 = pts[i]
    const p2 = pts[i + 1]
    const p3 = pts[i + 2] ?? pts[i + 1]
    const c1x = p1[0] + (p2[0] - p0[0]) / 6
    const c1y = clampY(p1[1] + (p2[1] - p0[1]) / 6)
    const c2x = p2[0] - (p3[0] - p1[0]) / 6
    const c2y = clampY(p2[1] - (p3[1] - p1[1]) / 6)
    d += ` C ${round(c1x)} ${round(c1y)} ${round(c2x)} ${round(c2y)} ${round(p2[0])} ${round(p2[1])}`
  }
  return d
}

// Full smooth path through the points, starting with a move command.
export function smoothPath(pts: Point[], yMin?: number, yMax?: number): string {
  if (pts.length === 0) return ''
  return `M ${round(pts[0][0])} ${round(pts[0][1])}` + smoothCurve(pts, yMin, yMax)
}

// 1-based challenge day for `today`, clamped to 1..length.
export function challengeDay(start: string, today: string, length: number): number {
  return Math.min(length, Math.max(1, dayDiff(today, start) + 1))
}

// Each athlete's daily results across the shared timeline — from the day they
// joined (their first plank, clamped to the challenge start) through today.
// Missed days come back as value 0 so the line drops to the baseline.
export function dailySeries(
  byDate: Record<string, number>,
  firstDate: string | null,
  start: string,
  today: string,
): DayPoint[] {
  if (!firstDate) return []
  const from = firstDate < start ? start : firstDate
  const startIdx = Math.max(0, dayDiff(from, start))
  const endIdx = dayDiff(today, start)
  if (endIdx < startIdx) return []
  const out: DayPoint[] = []
  for (let i = startIdx; i <= endIdx; i++) {
    out.push({ dayIndex: i, value: byDate[addDays(start, i)] ?? 0 })
  }
  return out
}
