import { useMemo } from 'react'
import { currentStreak } from '../lib/leaderboard'
import { longestStreak } from '../lib/stats'
import { formatDuration } from '../lib/dates'
import Heatmap from './Heatmap'
import type { PlankResult } from '../types'

interface Props {
  results: PlankResult[] // the current athlete's own results, newest-first
}

export default function FormView({ results }: Props) {
  const stats = useMemo(() => {
    const dates = results.map((r) => r.local_date)
    const total = results.reduce((sum, r) => sum + r.duration_seconds, 0)
    const days = results.length
    const best = results.reduce((max, r) => Math.max(max, r.duration_seconds), 0)
    return {
      current: currentStreak(dates),
      longest: longestStreak(dates),
      days,
      best,
      total,
      average: days > 0 ? total / days : 0,
    }
  }, [results])

  if (results.length === 0) {
    return (
      <div className="card">
        <h2 className="section-title">Your form</h2>
        <p className="muted">Log your first plank to start building your form. 🔥</p>
      </div>
    )
  }

  const cards: { label: string; value: string }[] = [
    { label: 'Current streak', value: `${stats.current}d` },
    { label: 'Longest streak', value: `${stats.longest}d` },
    { label: 'Active days', value: `${stats.days}` },
    { label: 'Best plank', value: formatDuration(stats.best) },
    { label: 'Total time', value: formatDuration(stats.total) },
    { label: 'Average', value: formatDuration(stats.average) },
  ]

  return (
    <>
      <div className="stat-grid">
        {cards.map((c) => (
          <div key={c.label} className="stat-card">
            <span className="stat-label">{c.label}</span>
            <span className="stat-value">{c.value}</span>
          </div>
        ))}
      </div>

      <div className="card">
        <h2 className="section-title">Your form</h2>
        <Heatmap results={results} />
      </div>
    </>
  )
}
