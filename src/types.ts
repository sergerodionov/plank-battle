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

// One of the last 7 calendar days for an athlete's "form" strip.
export interface FormDay {
  date: string // YYYY-MM-DD
  done: boolean // did they plank that day?
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
  last7: FormDay[] // oldest → today
  formScore: number // count of planked days in the last 7
}

export type LeaderboardMetric = 'total' | 'average' | 'streak' | 'form'
