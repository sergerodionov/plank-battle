import { formatDateLabel, formatDuration } from '../lib/dates'
import type { PlankResult } from '../types'

interface Props {
  results: PlankResult[] // expected newest-first
}

export default function MyResults({ results }: Props) {
  if (results.length === 0) {
    return (
      <div className="card">
        <p className="muted">No planks yet. Your history will show up here, newest on top.</p>
      </div>
    )
  }

  const best = results.reduce((max, r) => Math.max(max, r.duration_seconds), 0)

  return (
    <div className="card list-card">
      <h2 className="section-title">My results</h2>
      <ul className="result-list">
        {results.map((r) => (
          <li key={r.id} className="result-row">
            <span className="result-date">{formatDateLabel(r.local_date)}</span>
            <span className="result-time">
              {formatDuration(r.duration_seconds)}
              {r.duration_seconds === best && <span className="pr-tag">PR</span>}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}
