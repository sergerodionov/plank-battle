export interface Profile {
  id: string
  email: string | null
  display_name: string | null
  avatar_url: string | null
}

export interface PlankResult {
  id: string
  user_id: string
  local_date: string // YYYY-MM-DD (the athlete's local calendar day)
  duration_seconds: number
  created_at: string
}

// A result row joined with its owner's profile, used by the leaderboard.
export interface ResultWithProfile extends PlankResult {
  profiles: Pick<Profile, 'display_name' | 'avatar_url' | 'email'> | null
}

export interface LeaderboardRow {
  userId: string
  name: string
  avatarUrl: string | null
  totalSeconds: number
  days: number
  averageSeconds: number
  bestSeconds: number
  currentStreak: number
}

export type LeaderboardMetric = 'total' | 'average' | 'streak'
