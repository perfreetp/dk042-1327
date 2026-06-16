export interface NightRecord {
  date: string
  sceneId: string
  stickerId: string
  liedDownOnTime: boolean | null
  noCallOut: boolean | null
  timestamp: number
}

export interface ParentSettings {
  maxVolume: number
  duration: number
  lastUpdated: string
}

const SETTINGS_KEY = 'goodnight_settings'
const RECORDS_KEY = 'goodnight_records'

export function loadSettings(): ParentSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY)
    if (raw) return JSON.parse(raw)
  } catch {}
  return { maxVolume: 0.7, duration: 30, lastUpdated: '' }
}

export function saveSettings(settings: ParentSettings): void {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings))
}

export function loadRecords(): NightRecord[] {
  try {
    const raw = localStorage.getItem(RECORDS_KEY)
    if (raw) return JSON.parse(raw)
  } catch {}
  return []
}

export function saveRecords(records: NightRecord[]): void {
  localStorage.setItem(RECORDS_KEY, JSON.stringify(records))
}

export function getToday(): string {
  return new Date().toISOString().slice(0, 10)
}

export function getYesterday(): string {
  const d = new Date()
  d.setDate(d.getDate() - 1)
  return d.toISOString().slice(0, 10)
}

export function getLast7Days(): string[] {
  const days: string[] = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    days.push(d.toISOString().slice(0, 10))
  }
  return days
}

export function getStreak(records: NightRecord[]): number {
  let streak = 0
  const today = new Date()
  for (let i = 0; i < 365; i++) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    const dateStr = d.toISOString().slice(0, 10)
    const rec = records.find((r) => r.date === dateStr)
    if (rec && rec.liedDownOnTime && rec.noCallOut) {
      streak++
    } else if (i === 0 && (!rec || rec.liedDownOnTime === null || rec.noCallOut === null)) {
      continue
    } else {
      break
    }
  }
  return streak
}
