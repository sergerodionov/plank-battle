import { useEffect, useRef, useState } from 'react'
import { supabase } from '../supabaseClient'
import { formatDuration, localDateKey } from '../lib/dates'
import { useWakeLock } from '../lib/useWakeLock'
import type { PlankResult } from '../types'

interface Props {
  userId: string
  todayResult: PlankResult | null
  onSaved: () => void
}

type Phase = 'idle' | 'running' | 'stopped'

export default function Timer({ userId, todayResult, onSaved }: Props) {
  const [phase, setPhase] = useState<Phase>('idle')
  const [elapsedMs, setElapsedMs] = useState(0)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const startRef = useRef<number>(0)
  const rafRef = useRef<number>(0)

  // Keep the screen on while the plank is being held.
  useWakeLock(phase === 'running')

  // Drive the on-screen clock while running, using wall-clock deltas so it
  // stays accurate even if the browser throttles timers in the background.
  useEffect(() => {
    if (phase !== 'running') return
    const tick = () => {
      setElapsedMs(Date.now() - startRef.current)
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [phase])

  // Already planked today → locked card, come back tomorrow.
  if (todayResult) {
    return (
      <div className="card timer-card done">
        <div className="badge">✓ Done for today</div>
        <div className="big-time">{formatDuration(todayResult.duration_seconds)}</div>
        <p className="muted">
          Nice work. Your plank is locked in — come back tomorrow to keep your streak alive. 🔥
        </p>
      </div>
    )
  }

  const elapsedSeconds = Math.floor(elapsedMs / 1000)

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
      // 23505 = unique violation → they already logged a run today on another device.
      if (insertError.code === '23505') {
        setError('You already logged a plank today. See you tomorrow!')
        onSaved()
      } else {
        setError(insertError.message)
      }
      return
    }
    onSaved()
  }

  return (
    <div className="card timer-card">
      <div className={`big-time ${phase === 'running' ? 'live' : ''}`}>
        {formatDuration(elapsedSeconds)}
      </div>

      {phase === 'idle' && (
        <>
          <p className="muted">Get into position. Hit start when you drop into your plank.</p>
          <button className="btn btn-primary btn-lg" onClick={start}>
            Start plank
          </button>
        </>
      )}

      {phase === 'running' && (
        <button className="btn btn-stop btn-lg" onClick={stop}>
          Stop
        </button>
      )}

      {phase === 'stopped' && (
        <>
          <p className="muted">Held for {formatDuration(elapsedSeconds)}. Save it to the board?</p>
          <div className="row">
            <button className="btn btn-ghost" onClick={reset} disabled={saving}>
              Redo
            </button>
            <button className="btn btn-primary" onClick={save} disabled={saving}>
              {saving ? 'Saving…' : "Save today's result"}
            </button>
          </div>
        </>
      )}

      {error && <p className="error">{error}</p>}
    </div>
  )
}
