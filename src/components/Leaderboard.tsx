import { useMemo, useState } from 'react'
import { buildLeaderboard } from '../lib/leaderboard'
import { formatDuration } from '../lib/dates'
import type { LeaderboardMetric, ResultWithProfile } from '../types'

interface Props {
  rows: ResultWithProfile[]
  currentUserId: string
}

const METRICS: { key: LeaderboardMetric; label: string }[] = [
  { key: 'total', label: 'Total time' },
  { key: 'average', label: 'Average' },
  { key: 'streak', label: 'Streak' },
]

const MEDALS = ['🥇', '🥈', '🥉']

export default function Leaderboard({ rows, currentUserId }: Props) {
  const [metric, setMetric] = useState<LeaderboardMetric>('total')
  const board = useMemo(() => buildLeaderboard(rows, metric), [rows, metric])

  const renderValue = (r: (typeof board)[number]) => {
    if (metric === 'total') return formatDuration(r.totalSeconds)
    if (metric === 'average') return formatDuration(r.averageSeconds)
    return `${r.currentStreak} ${r.currentStreak === 1 ? 'day' : 'days'} 🔥`
  }

  return (
    <div className="card list-card">
      <h2 className="section-title">Tournament</h2>
      <div className="segmented">
        {METRICS.map((m) => (
          <button
            key={m.key}
            className={`segment ${metric === m.key ? 'active' : ''}`}
            onClick={() => setMetric(m.key)}
          >
            {m.label}
          </button>
        ))}
      </div>

      {board.length === 0 ? (
        <p className="muted">No results yet. Be the first to log a plank!</p>
      ) : (
        <ol className="rank-list">
          {board.map((r, i) => (
            <li
              key={r.userId}
              className={`rank-row ${r.userId === currentUserId ? 'me' : ''}`}
            >
              <span className="rank-pos">{MEDALS[i] ?? i + 1}</span>
              <span className="rank-name">
                {r.avatarUrl && (
                  <img className="avatar" src={r.avatarUrl} alt="" referrerPolicy="no-referrer" />
                )}
                {r.name}
                {r.userId === currentUserId && <span className="you-tag">you</span>}
              </span>
              <span className="rank-value">{renderValue(r)}</span>
            </li>
          ))}
        </ol>
      )}
      <p className="muted fine">
        {METRICS.find((m) => m.key === metric)?.label} · {board.length}{' '}
        {board.length === 1 ? 'athlete' : 'athletes'}
      </p>
    </div>
  )
}
