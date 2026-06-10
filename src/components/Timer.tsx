import { useEffect, useRef, useState } from 'react'
import { supabase } from '../supabaseClient'
import { formatDuration, localDateKey } from '../lib/dates'
import { useWakeLock } from '../lib/useWakeLock'
import type { PlankResult } from '../types'

interface Props {
  userId: string
  todayResult: PlankResult | null
  day: number
  totalDays: number
  onSaved: () => void
}

type Phase = 'idle' | 'running' | 'stopped'

export default function Timer({ userId, todayResult, day, totalDays, onSaved }: Props) {
  const [phase, setPhase] = useState<Phase>('idle')
  const [elapsedMs, setElapsedMs] = useState(0)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  // Locks the timer the moment a plank is saved, without waiting for the
  // server round-trip — so the UI can never sit on REDO/SAVE after a save.
  const [savedDuration, setSavedDuration] = useState<number | null>(null)
  const startRef = useRef<number>(0)
  const rafRef = useRef<number>(0)

  useWakeLock(phase === 'running')

  useEffect(() => {
    if (phase !== 'running') return
    const tick = () => {
      setElapsedMs(Date.now() - startRef.current)
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [phase])

  const elapsedSeconds = Math.floor(elapsedMs / 1000)
  // "Done for today" — whether from a loaded result or a save we just made.
  const lockedDuration = todayResult?.duration_seconds ?? savedDuration
  const done = lockedDuration != null

  const start = () => {
    setError(null)
    startRef.current = Date.now()
    setElapsedMs(0)
    setPhase('running')
  }
  const stop = () => {
    setElapsedMs(Date.now() - startRef.current)
    setPhase('stopped')
  }
  const reset = () => {
    setElapsedMs(0)
    setPhase('idle')
  }
  const save = async () => {
    if (elapsedSeconds <= 0) {
      setError('That plank was too short to count!')
      return
    }
    setSaving(true)
    setError(null)
    const { error: insertError } = await supabase.from('plank_results').insert({
      user_id: userId,
      local_date: localDateKey(),
      duration_seconds: elapsedSeconds,
    })
    setSaving(false)
    // 23505 = already logged today: not an error to surface — just lock the UI.
    if (insertError && insertError.code !== '23505') {
      setError(insertError.message)
      return
    }
    setSavedDuration(elapsedSeconds)
    onSaved()
  }

  return (
    <div className="hero">
      <div className="hero-row">
        <span className="hero-label">TODAY'S PLANK</span>
        <span className="hero-day">DAY {day}/{totalDays}</span>
      </div>
      <div className={`big-time ${!done && phase === 'running' ? 'live' : ''} ${done ? 'done' : ''}`}>
        {done ? formatDuration(lockedDuration!) : formatDuration(elapsedSeconds)}
      </div>

      {done ? (
        <button className="btn btn-outline" disabled>
          DONE · COME BACK TOMORROW
        </button>
      ) : phase === 'idle' ? (
        <button className="btn btn-primary" onClick={start}>
          START PLANK
        </button>
      ) : phase === 'running' ? (
        <button className="btn btn-primary" onClick={stop}>
          STOP
        </button>
      ) : (
        <div className="row" style={{ padding: 0 }}>
          <button className="btn btn-outline" onClick={reset} disabled={saving}>
            REDO
          </button>
          <button className="btn btn-primary" onClick={save} disabled={saving}>
            {saving ? 'SAVING…' : 'SAVE'}
          </button>
        </div>
      )}

      {!done && error && <p className="hero-error">{error}</p>}
    </div>
  )
}
