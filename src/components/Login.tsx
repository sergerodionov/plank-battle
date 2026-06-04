import { useState } from 'react'
import { supabase } from '../supabaseClient'

export default function Login() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const signIn = async () => {
    setLoading(true)
    setError(null)
    const { error: authError } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin },
    })
    if (authError) {
      setError(authError.message)
      setLoading(false)
    }
    // On success the browser redirects to Google, so no further work here.
  }

  return (
    <div className="login-screen">
      <div className="logo">🧘</div>
      <h1 className="title">Plank Battle</h1>
      <p className="subtitle">One plank a day. Settle who's strongest.</p>
      <button className="btn btn-google btn-lg" onClick={signIn} disabled={loading}>
        <span className="g-mark">G</span>
        {loading ? 'Connecting…' : 'Continue with Google'}
      </button>
      {error && <p className="error">{error}</p>}
    </div>
  )
}
