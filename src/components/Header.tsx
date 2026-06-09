import { supabase } from '../supabaseClient'

interface Props {
  name: string
}

export default function Header({ name }: Props) {
  return (
    <header className="app-header">
      <span className="brand">plank</span>
      <span className="header-user">
        <span className="header-name">{name}</span>
        <button className="btn-signout" onClick={() => supabase.auth.signOut()}>
          Sign out
        </button>
      </span>
    </header>
  )
}
