import { formatDateLabel, formatDuration } from '../lib/dates'
import type { PlankResult } from '../types'

interface Props {
  results: PlankResult[] // newest-first
  onBack: () => void
}

export default function History({ results, onBack }: Props) {
  const best = results.reduce((m, r) => Math.max(m, r.duration_seconds), 0)

  return (
    <>
      <div className="back-wrap">
        <button className="btn-inline" onClick={onBack}>
          ← DASHBOARD
        </button>
      </div>
      <div className="sec-head">
        <span className="sec-title">HISTORY</span>
        <span className="sec-aside">ALL PLANKS</span>
      </div>
      <div className="divider" />
      {results.length === 0 ? (
        <p className="muted">No planks yet.</p>
      ) : (
        results.map((r, i) => (
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
        ))
      )}
    </>
  )
}
