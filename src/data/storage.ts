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

export interface SoundMix {
  [sceneId: string]: {
    [soundId: string]: number
  }
}

export interface CustomGuideTexts {
  [sceneId: string]: string[]
}

const SETTINGS_KEY = 'goodnight_settings'
const RECORDS_KEY = 'goodnight_records'
const SOUND_MIX_KEY = 'goodnight_soundmix'
const GUIDE_TEXTS_KEY = 'goodnight_guidetexts'
const PARENT_UNLOCK_KEY = 'goodnight_parentunlock'

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

export function loadSoundMix(): SoundMix {
  try {
    const raw = localStorage.getItem(SOUND_MIX_KEY)
    if (raw) return JSON.parse(raw)
  } catch {}
  return {}
}

export function saveSoundMix(mix: SoundMix): void {
  localStorage.setItem(SOUND_MIX_KEY, JSON.stringify(mix))
}

export function loadGuideTexts(): CustomGuideTexts {
  try {
    const raw = localStorage.getItem(GUIDE_TEXTS_KEY)
    if (raw) return JSON.parse(raw)
  } catch {}
  return {}
}

export function saveGuideTexts(texts: CustomGuideTexts): void {
  localStorage.setItem(GUIDE_TEXTS_KEY, JSON.stringify(texts))
}

export function getParentUnlocked(): boolean {
  try {
    const raw = localStorage.getItem(PARENT_UNLOCK_KEY)
    if (raw) {
      const data = JSON.parse(raw)
      return data.date === getToday()
    }
  } catch {}
  return false
}

export function setParentUnlocked(): void {
  localStorage.setItem(PARENT_UNLOCK_KEY, JSON.stringify({ date: getToday() }))
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

export function getMonthDays(year: number, month: number): string[] {
  const days: string[] = []
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const startPadding = firstDay.getDay()
  for (let i = 0; i < startPadding; i++) {
    const d = new Date(year, month, -startPadding + i + 1)
    days.push(d.toISOString().slice(0, 10))
  }
  for (let d = 1; d <= lastDay.getDate(); d++) {
    const date = new Date(year, month, d)
    days.push(date.toISOString().slice(0, 10))
  }
  const endPadding = 42 - days.length
  for (let i = 1; i <= endPadding; i++) {
    const d = new Date(year, month + 1, i)
    days.push(d.toISOString().slice(0, 10))
  }
  return days
}

export function isCurrentMonth(dateStr: string, year: number, month: number): boolean {
  const d = new Date(dateStr)
  return d.getFullYear() === year && d.getMonth() === month
}

export function getConsecutiveStreakDays(records: NightRecord[], refDate: string): string[] {
  const days: string[] = []
  const ref = new Date(refDate + 'T00:00:00')
  for (let i = 0; i < 365; i++) {
    const d = new Date(ref)
    d.setDate(d.getDate() - i)
    const dateStr = d.toISOString().slice(0, 10)
    const rec = records.find((r) => r.date === dateStr)
    if (rec && rec.liedDownOnTime && rec.noCallOut) {
      days.unshift(dateStr)
    } else {
      break
    }
  }
  return days
}
