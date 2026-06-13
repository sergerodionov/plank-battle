import { formatDateLabel, formatDuration, localDateKey } from '../lib/dates'
import { buildLeaderboard } from '../lib/leaderboard'
import { challengeDay, dailySeries } from '../lib/chart'
import { CHALLENGE_LENGTH, CHALLENGE_START } from '../lib/challenge'
import DailyChart from './DailyChart'
import type { PlankResult, ResultWithProfile } from '../types'

interface Props {
  results: PlankResult[] // your planks, newest-first
  allResults: ResultWithProfile[] // everyone's planks, for the comparison graph
  currentUserId: string
  onBack: () => void
}

export default function History({ results, allResults, currentUserId, onBack }: Props) {
  const best = results.reduce((m, r) => Math.max(m, r.duration_seconds), 0)

  // Build the daily-results comparison: you vs the athlete with the best total.
  const today = localDateKey()
  const totalDays = challengeDay(CHALLENGE_START, today, CHALLENGE_LENGTH)
  const board = buildLeaderboard(allResults, 'total', today)
  const me = board.find((r) => r.userId === currentUserId) ?? null
  const top = board[0] ?? null
  const other = top && top.userId !== currentUserId ? top : board[1] ?? null
  const youSeries = me ? dailySeries(me.byDate, me.firstDate, CHALLENGE_START, today) : []
  const otherSeries = other ? dailySeries(other.byDate, other.firstDate, CHALLENGE_START, today) : []
  const otherLabel = other
    ? `${other.name} (${other.userId === top?.userId ? 'BEST TOTAL' : '2ND TOTAL'})`.toUpperCase()
    : ''

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
      {youSeries.length > 0 && (
        <>
          <div className="divider" />
          <DailyChart
            you={youSeries}
            other={otherSeries}
            otherLabel={otherLabel}
            totalDays={totalDays}
          />
        </>
      )}
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
