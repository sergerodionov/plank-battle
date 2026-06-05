import { useEffect } from 'react'

// Minimal typing for the Screen Wake Lock API (not in all TS lib versions).
interface WakeLockSentinelLike {
  release: () => Promise<void>
}
interface WakeLockNavigator {
  wakeLock?: { request: (type: 'screen') => Promise<WakeLockSentinelLike> }
}

/**
 * Keep the screen awake while `active` is true (e.g. the plank timer running).
 *
 * iOS/Safari automatically releases the lock when the page is hidden, so we
 * re-acquire it whenever the page becomes visible again while still active.
 * No-ops gracefully where the API is unavailable (old browsers, non-HTTPS).
 */
export function useWakeLock(active: boolean): void {
  useEffect(() => {
    if (!active) return
    const wakeLock = (navigator as Navigator & WakeLockNavigator).wakeLock
    if (!wakeLock) return

    let sentinel: WakeLockSentinelLike | null = null
    let cancelled = false

    const acquire = async () => {
      try {
        const s = await wakeLock.request('screen')
        if (cancelled) {
          s.release().catch(() => {})
        } else {
          sentinel = s
        }
      } catch {
        // User gesture missing, battery saver, etc. — safe to ignore.
      }
    }

    const onVisibility = () => {
      if (document.visibilityState === 'visible') acquire()
    }

    acquire()
    document.addEventListener('visibilitychange', onVisibility)

    return () => {
      cancelled = true
      document.removeEventListener('visibilitychange', onVisibility)
      sentinel?.release().catch(() => {})
    }
  }, [active])
}
