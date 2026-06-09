import { useMemo } from 'react'
import { buildHeatmap } from '../lib/stats'
import { formatDuration, localDateKey } from '../lib/dates'
import type { PlankResult } from '../types'

interface Props {
  results: PlankResult[] // the current athlete's own results
  weeks?: number
}

const WEEKDAYS = ['Mon', '', 'Wed', '', 'Fri', '', '']

export default function Heatmap({ results, weeks = 18 }: Props) {
  const today = localDateKey()
  const columns = useMemo(() => {
    const byDate = new Map(results.map((r) => [r.local_date, r.duration_seconds]))
    return buildHeatmap(byDate, weeks, today)
  }, [results, weeks, today])

  return (
    <div className="heatmap">
      <div className="heatmap-grid-wrap">
        <div className="heatmap-days">
          {WEEKDAYS.map((d, i) => (
            <span key={i} className="heatmap-day-label">
              {d}
            </span>
          ))}
        </div>
        <div className="heatmap-cols">
          {columns.map((col, ci) => (
            <div key={ci} className="heatmap-col">
              {col.map((cell) =>
                cell.future ? (
                  <span key={cell.date} className="heat-cell heat-future" />
                ) : (
                  <span
                    key={cell.date}
                    className={`heat-cell heat-l${cell.level}`}
                    title={
                      cell.seconds
                        ? `${cell.date}: ${formatDuration(cell.seconds)}`
                        : `${cell.date}: no plank`
                    }
                  />
                ),
              )}
            </div>
          ))}
        </div>
      </div>
      <div className="heatmap-legend">
        <span>Less</span>
        <span className="heat-cell heat-l0" />
        <span className="heat-cell heat-l1" />
        <span className="heat-cell heat-l2" />
        <span className="heat-cell heat-l3" />
        <span className="heat-cell heat-l4" />
        <span>More</span>
      </div>
    </div>
  )
}
