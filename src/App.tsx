import { useCallback, useEffect, useState } from 'react'
import type { Session } from '@supabase/supabase-js'
import { isSupabaseConfigured, supabase } from './supabaseClient'
import { localDateKey } from './lib/dates'
import { firstName } from './lib/names'
import type { PlankResult, ResultWithProfile } from './types'
import Login from './components/Login'
import Timer from './components/Timer'
import MyResults from './components/MyResults'
import Leaderboard from './components/Leaderboard'
import './App.css'

type View = 'home' | 'history'

function App() {
  const [session, setSession] = useState<Session | null>(null)
  const [authReady, setAuthReady] = useState(false)

  const [myResults, setMyResults] = useState<PlankResult[]>([])
  const [allResults, setAllResults] = useState<ResultWithProfile[]>([])
  const [loadingData, setLoadingData] = useState(false)
  const [view, setView] = useState<View>('home')

  // Track the auth session and react to login/logout.
  useEffect(() => {
    if (!isSupabaseConfigured) {
      setAuthReady(true)
      return
    }
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setAuthReady(true)
    })
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s)
    })
    return () => sub.subscription.unsubscribe()
  }, [])

  const userId = session?.user?.id ?? null

  const loadData = useCallback(async () => {
    if (!userId) return
    setLoadingData(true)
    // Fetch results and profiles separately and merge in JS. (We can't use a
    // PostgREST embedded join here: plank_results and profiles both reference
    // auth.users but not each other, so there's no relationship to embed.)
    const [resultsRes, profilesRes] = await Promise.all([
      supabase.from('plank_results').select('*').order('local_date', { ascending: false }),
      supabase.from('profiles').select('id, display_name, avatar_url, email'),
    ])
    const results = (resultsRes.data ?? []) as PlankResult[]
    const profilesById = new Map((profilesRes.data ?? []).map((p) => [p.id, p]))
    const withProfiles: ResultWithProfile[] = results.map((r) => ({
      ...r,
      profiles: profilesById.get(r.user_id) ?? null,
    }))
    setAllResults(withProfiles)
    setMyResults(results.filter((r) => r.user_id === userId))
    setLoadingData(false)
  }, [userId])

  useEffect(() => {
    if (userId) loadData()
  }, [userId, loadData])

  if (!isSupabaseConfigured) {
    return (
      <div className="login-screen">
        <div className="logo">⚙️</div>
        <h1 className="title">Almost there</h1>
        <p className="subtitle">
          Supabase isn't configured yet. Copy <code>.env.example</code> to{' '}
          <code>.env.local</code>, paste your project URL and anon key, then restart{' '}
          <code>npm run dev</code>. See <code>SETUP.md</code> for the walkthrough.
        </p>
      </div>
    )
  }

  if (!authReady) {
    return (
      <div className="login-screen">
        <div className="logo">🧘</div>
        <p className="subtitle">Loading…</p>
      </div>
    )
  }

  if (!session || !userId) return <Login />

  const today = localDateKey()
  const todayResult = myResults.find((r) => r.local_date === today) ?? null
  const displayName =
    firstName(session.user.user_metadata?.full_name as string | undefined) ||
    session.user.email ||
    'Athlete'

  return (
    <div className="app">
      <header className="app-header">
        <span className="brand">🧘 Plank Battle</span>
        <span className="header-user">
          <span className="header-name">{displayName}</span>
          <button className="btn btn-ghost btn-sm" onClick={() => supabase.auth.signOut()}>
            Sign out
          </button>
        </span>
      </header>

      <main className="app-main">
        {view === 'home' && (
          <>
            <Timer userId={userId} todayResult={todayResult} onSaved={loadData} />
            {loadingData && myResults.length === 0 ? (
              <div className="card">
                <p className="muted">Loading your results…</p>
              </div>
            ) : (
              <MyResults
                results={myResults}
                limit={3}
                headerAction={
                  myResults.length > 0
                    ? { label: 'History →', onClick: () => setView('history') }
                    : undefined
                }
              />
            )}
            <Leaderboard rows={allResults} currentUserId={userId} />
          </>
        )}

        {view === 'history' && (
          <MyResults
            results={myResults}
            title="History"
            headerAction={{ label: '← Dashboard', onClick: () => setView('home') }}
          />
        )}
      </main>
    </div>
  )
}

export default App
