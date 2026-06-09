import { useCallback, useEffect, useState } from 'react'
import type { Session } from '@supabase/supabase-js'
import { isSupabaseConfigured, supabase } from './supabaseClient'
import { localDateKey } from './lib/dates'
import { currentStreak } from './lib/leaderboard'
import { firstName } from './lib/names'
import type { PlankResult, ResultWithProfile } from './types'
import Login from './components/Login'
import Header from './components/Header'
import logo from './assets/logo.svg'
import Timer from './components/Timer'
import MyResults from './components/MyResults'
import Leaderboard from './components/Leaderboard'
import History from './components/History'
import './App.css'

type View = 'home' | 'history'

function App() {
  const [session, setSession] = useState<Session | null>(null)
  const [authReady, setAuthReady] = useState(false)
  const [myResults, setMyResults] = useState<PlankResult[]>([])
  const [allResults, setAllResults] = useState<ResultWithProfile[]>([])
  const [loadingData, setLoadingData] = useState(false)
  const [view, setView] = useState<View>('home')

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setAuthReady(true)
      return
    }
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setAuthReady(true)
    })
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s))
    return () => sub.subscription.unsubscribe()
  }, [])

  const userId = session?.user?.id ?? null

  const loadData = useCallback(async () => {
    if (!userId) return
    setLoadingData(true)
    const [resultsRes, profilesRes] = await Promise.all([
      supabase.from('plank_results').select('*').order('local_date', { ascending: false }),
      supabase.from('profiles').select('id, display_name, avatar_url, email'),
    ])
    const results = (resultsRes.data ?? []) as PlankResult[]
    const profilesById = new Map((profilesRes.data ?? []).map((p) => [p.id, p]))
    setAllResults(results.map((r) => ({ ...r, profiles: profilesById.get(r.user_id) ?? null })))
    setMyResults(results.filter((r) => r.user_id === userId))
    setLoadingData(false)
  }, [userId])

  useEffect(() => {
    if (userId) loadData()
  }, [userId, loadData])

  if (!isSupabaseConfigured) {
    return (
      <div className="center-screen">
        <img src={logo} className="login-logo" alt="plank" />
        <p className="login-sub">
          Supabase isn't configured. Copy <code>.env.example</code> to <code>.env.local</code>,
          add your keys, then restart <code>npm run dev</code>.
        </p>
      </div>
    )
  }

  if (!authReady) {
    return (
      <div className="center-screen">
        <img src={logo} className="login-logo" alt="plank" />
      </div>
    )
  }

  if (!session || !userId) return <Login />

  const today = localDateKey()
  const todayResult = myResults.find((r) => r.local_date === today) ?? null
  // "DAY N" = which day of the current streak today is. If today isn't logged
  // yet but the streak is alive (planked yesterday), today would extend it → +1.
  const streak = currentStreak(
    myResults.map((r) => r.local_date),
    today,
  )
  const streakDay = todayResult ? streak : streak + 1
  const displayName =
    firstName(session.user.user_metadata?.full_name as string | undefined) ||
    session.user.email ||
    'Athlete'

  return (
    <div className="app">
      <Header name={displayName} />
      <div className="divider" />

      {view === 'home' && (
        <>
          <Timer userId={userId} todayResult={todayResult} day={streakDay} onSaved={loadData} />
          <div className="divider" />
          <Leaderboard rows={allResults} currentUserId={userId} />
          <div className="divider" />
          {loadingData && myResults.length === 0 ? (
            <p className="muted">Loading your results…</p>
          ) : (
            <MyResults results={myResults} onCheckHistory={() => setView('history')} />
          )}
        </>
      )}

      {view === 'history' && <History results={myResults} onBack={() => setView('home')} />}

      <footer className="app-footer">PLANK CHALLENGE · ONE PLANK A DAY</footer>
    </div>
  )
}

export default App
