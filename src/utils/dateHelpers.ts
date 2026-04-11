/** Returns today's date in the user's local timezone as YYYY-MM-DD */
export function today(): string {
  const d = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

export function formatDate(date: string): string {
  const d = new Date(date + 'T00:00:00')
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

export function formatTime(datetime: string): string {
  const d = new Date(datetime)
  return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
}

export function formatRelative(datetime: string): string {
  const now = new Date()
  const d = new Date(datetime)
  const diffMs = now.getTime() - d.getTime()
  const diffSec = Math.floor(diffMs / 1000)
  const diffMin = Math.floor(diffSec / 60)
  const diffHours = Math.floor(diffMin / 60)

  if (diffSec < 60) return 'Just now'
  if (diffMin < 60) return `${diffMin} min ago`
  if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`

  const todayStr = today()
  const pad = (n: number) => String(n).padStart(2, '0')
  const dStr = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`

  const todayDate = new Date(todayStr + 'T00:00:00')
  const yesterdayDate = new Date(todayDate.getTime() - 86400000)
  const yd = yesterdayDate
  const yesterdayStr = `${yd.getFullYear()}-${pad(yd.getMonth() + 1)}-${pad(yd.getDate())}`

  if (dStr === yesterdayStr) return 'Yesterday'

  return d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })
}

export function getDayOfWeek(date: string): string {
  const d = new Date(date + 'T00:00:00')
  return d.toLocaleDateString('en-US', { weekday: 'short' })
}

export function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}

export function isSameDay(a: string, b: string): boolean {
  return a.slice(0, 10) === b.slice(0, 10)
}

export function startOfDay(date: string): string {
  return `${date.slice(0, 10)}T00:00:00`
}

export function endOfDay(date: string): string {
  return `${date.slice(0, 10)}T23:59:59`
}

export function last7Days(): string[] {
  const days: string[] = []
  const pad = (n: number) => String(n).padStart(2, '0')
  for (let i = 6; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    days.push(`${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`)
  }
  return days
}
