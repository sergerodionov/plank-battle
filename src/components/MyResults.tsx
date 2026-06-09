import { formatDateLabel, formatDuration } from '../lib/dates'
import type { PlankResult } from '../types'

interface Props {
  results: PlankResult[] // newest-first
  onCheckHistory: () => void
}

export default function MyResults({ results, onCheckHistory }: Props) {
  const best = results.reduce((m, r) => Math.max(m, r.duration_seconds), 0)
  const total = results.reduce((s, r) => s + r.duration_seconds, 0)
  const last3 = results.slice(0, 3)

  return (
    <>
      <div className="sec-head">
        <span className="sec-title">MY RESULTS</span>
      </div>
      <div className="divider" />
      {results.length === 0 ? (
        <p className="muted">No planks yet. Hit START above to log your first.</p>
      ) : (
        <>
          {last3.map((r, i) => (
            <div key={r.id}>
              {i > 0 && <div className="divider" />}
              <div className="result-row">
                <span className="result-date">{formatDateLabel(r.local_date)}</span>
                <span className="result-time">
                  {r.duration_seconds === best && <span className="pr-tag">PR</span>}
                  <span className="result-val">{formatDuration(r.duration_seconds)}</span>
                </span>
              </div>
            </div>
          ))}
          <div className="divider" />
          <div className="mr-summary">
            <button className="btn-inline" onClick={onCheckHistory}>
              CHECK HISTORY
            </button>
            <span className="summary-text">
              {results.length} {results.length === 1 ? 'PLANK' : 'PLANKS'} · {formatDuration(total)}
            </span>
          </div>
        </>
      )}
    </>
  )
}
