// The athlete's local calendar day as YYYY-MM-DD (en-CA formats that way).
export function localDateKey(d: Date = new Date()): string {
  return d.toLocaleDateString('en-CA')
}

// Difference in whole calendar days between two YYYY-MM-DD keys (a - b).
export function dayDiff(a: string, b: string): number {
  const [ay, am, ad] = a.split('-').map(Number)
  const [by, bm, bd] = b.split('-').map(Number)
  const ams = Date.UTC(ay, am - 1, ad)
  const bms = Date.UTC(by, bm - 1, bd)
  return Math.round((ams - bms) / 86_400_000)
}

// "1:23" style for short durations, "1:02:03" once we cross an hour.
export function formatDuration(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds))
  const hours = Math.floor(s / 3600)
  const minutes = Math.floor((s % 3600) / 60)
  const seconds = s % 60
  const pad = (n: number) => n.toString().padStart(2, '0')
  if (hours > 0) return `${hours}:${pad(minutes)}:${pad(seconds)}`
  return `${minutes}:${pad(seconds)}`
}

// Add (or subtract) whole days to a YYYY-MM-DD key. Uses UTC to dodge DST.
export function addDays(key: string, n: number): string {
  const [y, m, d] = key.split('-').map(Number)
  const date = new Date(Date.UTC(y, m - 1, d) + n * 86_400_000)
  const pad = (x: number) => x.toString().padStart(2, '0')
  return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())}`
}

// Day of week with Monday = 0 … Sunday = 6 (for week-aligned grids).
export function weekdayMon0(key: string): number {
  const [y, m, d] = key.split('-').map(Number)
  return (new Date(Date.UTC(y, m - 1, d)).getUTCDay() + 6) % 7
}

// Friendly "Today" / "Yesterday" / "Mon, Jun 2" label for a YYYY-MM-DD key.
export function formatDateLabel(key: string, today: string = localDateKey()): string {
  const diff = dayDiff(today, key)
  if (diff === 0) return 'Today'
  if (diff === 1) return 'Yesterday'
  const [y, m, d] = key.split('-').map(Number)
  const date = new Date(y, m - 1, d)
  return date.toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })
}
