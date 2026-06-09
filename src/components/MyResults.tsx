import { formatDateLabel, formatDuration } from '../lib/dates'
import type { PlankResult } from '../types'

interface Props {
  results: PlankResult[] // expected newest-first
  title?: string
  limit?: number // when set, show only the most recent N
  headerAction?: { label: string; onClick: () => void } // link shown top-right of the header
}

export default function MyResults({ results, title = 'My results', limit, headerAction }: Props) {
  // "Best" is computed across the full history so the PR tag is always correct,
  // even when only the most recent few rows are shown.
  const best = results.reduce((max, r) => Math.max(max, r.duration_seconds), 0)
  const shown = limit ? results.slice(0, limit) : results

  return (
    <div className="card list-card">
      <div className="list-head">
        <h2 className="section-title">{title}</h2>
        {headerAction && (
          <button className="link-btn" onClick={headerAction.onClick}>
            {headerAction.label}
          </button>
        )}
      </div>

      {results.length === 0 ? (
        <p className="muted">No planks yet. Your history will show up here, newest on top.</p>
      ) : (
        <ul className="result-list">
          {shown.map((r) => (
            <li key={r.id} className="result-row">
              <span className="result-date">{formatDateLabel(r.local_date)}</span>
              <span className="result-time">
                {formatDuration(r.duration_seconds)}
                {r.duration_seconds === best && <span className="pr-tag">PR</span>}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
