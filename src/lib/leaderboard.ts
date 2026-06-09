import type { FormDay, LeaderboardMetric, LeaderboardRow, ResultWithProfile } from '../types'
import { addDays, dayDiff, localDateKey } from './dates'
import { firstName } from './names'

// The last 7 calendar days (oldest → today), flagged done if the athlete
// planked that day. `formScore` is how many of the 7 they hit.
function buildLast7(dateSet: Set<string>, today: string): FormDay[] {
  const days: FormDay[] = []
  for (let i = 6; i >= 0; i--) {
    const date = addDays(today, -i)
    days.push({ date, done: dateSet.has(date) })
  }
  return days
}

// Length of the consecutive-day run ending at the athlete's most recent entry.
// Counts as a "current" streak only if that latest entry is today or yesterday;
// an older run is considered broken (returns 0), which is what a daily challenge wants.
export function currentStreak(dateKeys: string[], today: string = localDateKey()): number {
  if (dateKeys.length === 0) return 0
  const unique = Array.from(new Set(dateKeys)).sort() // ascending
  const latest = unique[unique.length - 1]
  if (dayDiff(today, latest) > 1) return 0 // last plank was before yesterday → streak broken

  let streak = 1
  for (let i = unique.length - 1; i > 0; i--) {
    if (dayDiff(unique[i], unique[i - 1]) === 1) streak++
    else break
  }
  return streak
}

// Roll the flat result rows up into one ranked row per athlete.
export function buildLeaderboard(
  rows: ResultWithProfile[],
  metric: LeaderboardMetric,
  today: string = localDateKey(),
): LeaderboardRow[] {
  const byUser = new Map<string, ResultWithProfile[]>()
  for (const row of rows) {
    const list = byUser.get(row.user_id) ?? []
    list.push(row)
    byUser.set(row.user_id, list)
  }

  const leaderboard: LeaderboardRow[] = []
  for (const [userId, userRows] of byUser) {
    const totalSeconds = userRows.reduce((sum, r) => sum + r.duration_seconds, 0)
    const days = userRows.length
    const bestSeconds = userRows.reduce((max, r) => Math.max(max, r.duration_seconds), 0)
    const profile = userRows[0].profiles
    const name =
      firstName(profile?.display_name) ||
      profile?.email?.split('@')[0] ||
      'Anonymous'
    const last7 = buildLast7(new Set(userRows.map((r) => r.local_date)), today)
    leaderboard.push({
      userId,
      name,
      avatarUrl: profile?.avatar_url ?? null,
      totalSeconds,
      days,
      averageSeconds: days > 0 ? totalSeconds / days : 0,
      bestSeconds,
      currentStreak: currentStreak(userRows.map((r) => r.local_date), today),
      last7,
      formScore: last7.filter((d) => d.done).length,
    })
  }

  const sortKey: Record<LeaderboardMetric, (r: LeaderboardRow) => number> = {
    total: (r) => r.totalSeconds,
    average: (r) => r.averageSeconds,
    streak: (r) => r.currentStreak,
    form: (r) => r.formScore,
  }
  const key = sortKey[metric]
  // Sort by the chosen metric; break ties with total time so the ranking is stable.
  return leaderboard.sort((a, b) => key(b) - key(a) || b.totalSeconds - a.totalSeconds)
}
