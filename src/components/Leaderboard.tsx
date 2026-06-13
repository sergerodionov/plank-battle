import { Fragment, useMemo, useState } from 'react'
import { buildLeaderboard } from '../lib/leaderboard'
import { formatDuration, localDateKey } from '../lib/dates'
import { challengeDay, dailySeries } from '../lib/chart'
import { CHALLENGE_LENGTH, CHALLENGE_START } from '../lib/challenge'
import Sparkline from './Sparkline'
import type { FormDay, LeaderboardMetric, ResultWithProfile } from '../types'

interface Props {
  rows: ResultWithProfile[]
  currentUserId: string
}

const METRICS: { key: LeaderboardMetric; label: string }[] = [
  { key: 'total', label: 'TOTAL' },
  { key: 'average', label: 'AVG' },
  { key: 'streak', label: 'STREAK' },
  { key: 'form', label: 'FORM' },
  { key: 'progress', label: 'PROGRESS' },
]

function FormStrip({ last7, today }: { last7: FormDay[]; today: string }) {
  return (
    <span className="form-strip">
      {last7.map((d) => {
        const state = d.done ? 'done' : d.date === today ? 'pending' : 'missed'
        return <span key={d.date} className={`form-sq ${state}`} title={d.date} />
      })}
    </span>
  )
}

export default function Leaderboard({ rows, currentUserId }: Props) {
  const [metric, setMetric] = useState<LeaderboardMetric>('total')
  const board = useMemo(() => buildLeaderboard(rows, metric), [rows, metric])
  const today = localDateKey()
  const totalDays = challengeDay(CHALLENGE_START, today, CHALLENGE_LENGTH)

  const renderValue = (r: (typeof board)[number]) => {
    if (metric === 'total')
      return (
        <span className="rank-value">
          <span className="value-sub">{r.days}d</span>
          {formatDuration(r.totalSeconds)}
        </span>
      )
    if (metric === 'average') return <span className="rank-value">{formatDuration(r.averageSeconds)}</span>
    if (metric === 'streak') return <span className="rank-value">{r.currentStreak}</span>
    if (metric === 'progress')
      return (
        <Sparkline
          points={dailySeries(r.byDate, r.firstDate, CHALLENGE_START, today)}
          best={r.bestSeconds}
          totalDays={totalDays}
        />
      )
    return <FormStrip last7={r.last7} today={today} />
  }

  return (
    <>
      <div className="sec-head">
        <span className="sec-title">TOURNAMENT</span>
      </div>
      <div className="pills">
        {METRICS.map((m) => (
          <button
            key={m.key}
            className={`pill ${metric === m.key ? 'active' : ''}`}
            onClick={() => setMetric(m.key)}
          >
            {m.label}
          </button>
        ))}
      </div>

      {board.length === 0 ? (
        <p className="muted">No results yet. Be the first to log a plank.</p>
      ) : (
        <>
          <div className="divider" />
          {board.map((r, i) => (
            <Fragment key={r.userId}>
              {i > 0 && <div className="divider" />}
              <div className={`rank-row ${r.userId === currentUserId ? 'me' : ''}`}>
                <span className="rank-pos">{(i + 1).toString().padStart(2, '0')}</span>
                <div className="rank-id">
                  {r.avatarUrl ? (
                    <img
                      className="rank-avatar"
                      src={r.avatarUrl}
                      alt=""
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <span className="rank-avatar rank-avatar--fallback">
                      {r.name.charAt(0).toUpperCase()}
                    </span>
                  )}
                  <span className="rank-name">
                    {r.name}
                    {r.userId === currentUserId && <span className="you-tag">YOU</span>}
                  </span>
                </div>
                {renderValue(r)}
              </div>
            </Fragment>
          ))}
        </>
      )}
    </>
  )
}
