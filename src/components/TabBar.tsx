export type View = 'home' | 'history' | 'form'

interface Props {
  active: View
  onChange: (view: View) => void
}

const TABS: { key: View; label: string; icon: string }[] = [
  { key: 'home', label: 'Home', icon: '🏋️' },
  { key: 'form', label: 'Form', icon: '📊' },
  { key: 'history', label: 'History', icon: '📅' },
]

export default function TabBar({ active, onChange }: Props) {
  return (
    <nav className="tab-bar">
      {TABS.map((t) => (
        <button
          key={t.key}
          className={`tab ${active === t.key ? 'active' : ''}`}
          onClick={() => onChange(t.key)}
          aria-current={active === t.key}
        >
          <span className="tab-icon">{t.icon}</span>
          <span className="tab-label">{t.label}</span>
        </button>
      ))}
    </nav>
  )
}
