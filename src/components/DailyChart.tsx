import { useId } from 'react'
import { smoothPath, smoothCurve } from '../lib/chart'
import { formatDuration } from '../lib/dates'
import type { DayPoint, Point } from '../lib/chart'

interface Props {
  you: DayPoint[] // your daily results on the shared timeline
  other: DayPoint[] // the best-by-total athlete's daily results
  otherLabel: string // e.g. "ANN (BEST TOTAL)"
  totalDays: number // shared domain length (today's challenge day)
}

// Geometry in SVG user units (the viewBox). Plot occupies x:0..PW, y:TOP..BASE;
// the right gutter holds each line's "today" value, the row below holds day marks.
const VW = 350
const VH = 176
const PW = 300
const TOP = 8
const BASE = 140

// Your daily plank times vs the leader's, day by day, on one shared challenge
// timeline. Each line starts on that athlete's join day and drops to the floor
// on missed days. Smooth (Catmull-Rom) curves; your line carries a gradient fill.
export default function DailyChart({ you, other, otherLabel, totalDays }: Props) {
  const gradId = useId()
  const denom = Math.max(1, totalDays - 1)
  const maxV = Math.max(1, ...you.map((p) => p.value), ...other.map((p) => p.value))
  const max = maxV * 1.12
  const xAt = (i: number) => (i / denom) * PW
  const yAt = (v: number) => TOP + (1 - v / max) * (BASE - TOP)

  const toPts = (s: DayPoint[]): Point[] => s.map((p) => [xAt(p.dayIndex), yAt(p.value)])
  const youPts = toPts(you)
  const otherPts = toPts(other)

  const youLast = youPts[youPts.length - 1]
  const otherLast = otherPts[otherPts.length - 1]
  const youArea =
    youPts.length > 1
      ? `M ${youPts[0][0]} ${BASE} L ${youPts[0][0]} ${youPts[0][1]}` +
        smoothCurve(youPts, TOP, BASE) +
        ` L ${youLast[0]} ${BASE} Z`
      : ''

  // Intermediate day marks (only when the window is wide enough to read them).
  const marks: number[] = []
  if (totalDays >= 8) {
    marks.push(Math.round((totalDays - 1) / 3), Math.round((totalDays - 1) * 2 / 3))
  }

  // Keep the two value labels from colliding.
  let youLblY = youLast ? youLast[1] : 0
  let otherLblY = otherLast ? otherLast[1] : 0
  if (youLast && otherLast && Math.abs(youLblY - otherLblY) < 12) {
    if (youLblY <= otherLblY) otherLblY = Math.min(BASE, youLblY + 12)
    else youLblY = Math.min(BASE, otherLblY + 12)
  }

  return (
    <section className="daily">
      <div className="daily-cap">DAILY RESULT</div>
      <svg
        className="daily-chart"
        viewBox={`0 0 ${VW} ${VH}`}
        width="100%"
        preserveAspectRatio="xMidYMid meet"
        role="img"
        aria-label="Your daily plank times compared with the leader"
      >
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fff" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#fff" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* plot frame */}
        <line x1="0" y1={TOP} x2={PW} y2={TOP} className="daily-grid" />
        <line x1="0" y1={BASE} x2={PW} y2={BASE} className="daily-grid" />

        {/* leader (best total) — thin gray line */}
        {otherPts.length > 0 && (
          <path d={smoothPath(otherPts, TOP, BASE)} fill="none" className="daily-other" />
        )}

        {/* you — gradient area + bold white line */}
        {youArea && <path d={youArea} fill={`url(#${gradId})`} />}
        {youPts.length > 0 && (
          <path d={smoothPath(youPts, TOP, BASE)} fill="none" className="daily-you" />
        )}

        {/* day marks */}
        <line x1="0" y1={BASE} x2="0" y2={BASE + 5} className="daily-tick" />
        <line x1={PW} y1={BASE} x2={PW} y2={BASE + 5} className="daily-tick" />
        <text x="0" y={BASE + 18} className="daily-axis" textAnchor="start">DAY 1</text>
        <text x={PW} y={BASE + 18} className="daily-axis" textAnchor="end">TODAY</text>
        {marks.map((idx) => (
          <g key={idx}>
            <line x1={xAt(idx)} y1={BASE} x2={xAt(idx)} y2={BASE + 5} className="daily-tick" />
            <text x={xAt(idx)} y={BASE + 18} className="daily-axis" textAnchor="middle">
              DAY {idx + 1}
            </text>
          </g>
        ))}

        {/* today value labels + dots */}
        {otherLast && (
          <>
            <circle cx={otherLast[0]} cy={otherLast[1]} r="2.5" className="dot-other" />
            <text x={PW + 6} y={otherLblY + 4} className="daily-val daily-val--other">
              {formatDuration(other[other.length - 1].value)}
            </text>
          </>
        )}
        {youLast && (
          <>
            <circle cx={youLast[0]} cy={youLast[1]} r="3" className="dot-you" />
            <text x={PW + 6} y={youLblY + 4} className="daily-val daily-val--you">
              {formatDuration(you[you.length - 1].value)}
            </text>
          </>
        )}
      </svg>

      <div className="daily-legend">
        <span className="daily-leg"><i className="dot-you" />YOU</span>
        {otherLabel && <span className="daily-leg"><i className="dot-other" />{otherLabel}</span>}
      </div>
    </section>
  )
}
