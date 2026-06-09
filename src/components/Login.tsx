import { useState } from 'react'
import { supabase } from '../supabaseClient'
import logo from '../assets/logo.svg'

export default function Login() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const signIn = async () => {
    setLoading(true)
    setError(null)
    const { error: authError } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin + import.meta.env.BASE_URL },
    })
    if (authError) {
      setError(authError.message)
      setLoading(false)
    }
  }

  return (
    <div className="login">
      <div className="login-top">
        <span>PLANK CHALLENGE</span>
        <span className="v">v1.0</span>
      </div>
      <div className="divider" />

      <div className="login-mid">
        <span className="login-kicker">DAILY</span>
        <img src={logo} className="login-logo" alt="plank" />
        <p className="login-sub">
          How long can you last?
          <br />
          Sign in to join the tournament
        </p>
        <button className="btn-google" onClick={signIn} disabled={loading}>
          <span>{loading ? 'CONNECTING…' : 'CONTINUE WITH GOOGLE'}</span>
          <span>→</span>
        </button>
        {error && <p className="error">{error}</p>}
      </div>

      <div className="login-foot">SECURE · GOOGLE OAUTH</div>
    </div>
  )
}
