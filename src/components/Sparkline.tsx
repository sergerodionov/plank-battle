import { useId } from 'react'
import { smoothPath, smoothCurve } from '../lib/chart'
import type { DayPoint, Point } from '../lib/chart'

interface Props {
  points: DayPoint[] // this athlete's daily series on the shared timeline
  best: number // their best single day — the top of the y-axis
  totalDays: number // shared domain length (today's challenge day)
  width?: number
  height?: number
}

// A tiny per-athlete daily-results chart: white line + soft gradient fill, a dot
// on today. Self-normalized so their best day touches the top; missed days (0)
// drop to the baseline. The x-axis is shared across rows (challenge day 1 → today),
// so a later joiner's line simply starts further to the right.
export default function Sparkline({ points, best, totalDays, width = 132, height = 34 }: Props) {
  const gradId = useId()
  // Insets leave room so the line cap and the today dot never clip at the edges.
  const PADT = 5
  const PADB = 4
  const PADL = 3
  const PADR = 4
  const plotH = height - PADT - PADB
  const baseline = PADT + plotH
  const denom = Math.max(1, totalDays - 1)
  const xAt = (i: number) => PADL + (i / denom) * (width - PADL - PADR)
  const yAt = (v: number) => (best > 0 ? PADT + plotH * (1 - v / best) : baseline)

  const pts: Point[] = points.map((p) => [xAt(p.dayIndex), yAt(p.value)])

  if (pts.length === 0) {
    return <svg className="spark" width={width} height={height} aria-hidden="true" />
  }

  const last = pts[pts.length - 1]
  const line = smoothPath(pts, PADT, baseline)
  const area =
    pts.length > 1
      ? `M ${pts[0][0]} ${baseline} L ${pts[0][0]} ${pts[0][1]}` +
        smoothCurve(pts, PADT, baseline) +
        ` L ${last[0]} ${baseline} Z`
      : ''

  return (
    <svg
      className="spark"
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fff" stopOpacity="0.22" />
          <stop offset="100%" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
      </defs>
      {area && <path d={area} fill={`url(#${gradId})`} />}
      <path
        d={line}
        fill="none"
        stroke="#fff"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx={last[0]} cy={last[1]} r="2" fill="#fff" />
    </svg>
  )
}
