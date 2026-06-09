import { supabase } from '../supabaseClient'
import logo from '../assets/logo.svg'

interface Props {
  name: string
}

export default function Header({ name }: Props) {
  return (
    <header className="app-header">
      <img src={logo} className="brand-logo" alt="plank" />
      <span className="header-user">
        <span className="header-name">{name}</span>
        <button className="btn-signout" onClick={() => supabase.auth.signOut()}>
          Sign out
        </button>
      </span>
    </header>
  )
}
