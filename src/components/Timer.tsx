import { useEffect, useRef, useState } from 'react'
import { supabase } from '../supabaseClient'
import { formatDuration, localDateKey } from '../lib/dates'
import { useWakeLock } from '../lib/useWakeLock'
import type { PlankResult } from '../types'

interface Props {
  userId: string
  todayResult: PlankResult | null
  day: number
  onSaved: () => void
}

type Phase = 'idle' | 'running' | 'stopped'

export default function Timer({ userId, todayResult, day, onSaved }: Props) {
  const [phase, setPhase] = useState<Phase>('idle')
  const [elapsedMs, setElapsedMs] = useState(0)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
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
  const done = !!todayResult

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
    if (insertError) {
      if (insertError.code === '23505') {
        setError('You already logged a plank today.')
        onSaved()
      } else {
        setError(insertError.message)
      }
      return
    }
    onSaved()
  }

  const shown = done
    ? formatDuration(todayResult!.duration_seconds)
    : formatDuration(elapsedSeconds)

  return (
    <div className="hero">
      <div className="hero-row">
        <span className="hero-label">TODAY'S PLANK</span>
        <span className="hero-day">DAY {day}</span>
      </div>
      <div className={`big-time ${phase === 'running' ? 'live' : ''} ${done ? 'done' : ''}`}>
        {done && phase === 'idle' ? formatDuration(todayResult!.duration_seconds) : shown}
      </div>

      {done && phase === 'idle' ? (
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

      {error && <p className="error" style={{ padding: '4px 0 0' }}>{error}</p>}
    </div>
  )
}
