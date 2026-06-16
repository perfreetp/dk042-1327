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

export interface BedtimePlan {
  weekday: {
    duration: number
    maxVolume: number
    defaultScene: string
    defaultSticker: string
  }
  weekend: {
    duration: number
    maxVolume: number
    defaultScene: string
    defaultSticker: string
  }
}

const SETTINGS_KEY = 'goodnight_settings'
const RECORDS_KEY = 'goodnight_records'
const SOUND_MIX_KEY = 'goodnight_soundmix'
const GUIDE_TEXTS_KEY = 'goodnight_guidetexts'
const PARENT_UNLOCK_KEY = 'goodnight_parentunlock'
const BEDTIME_PLAN_KEY = 'goodnight_bedtimeplan'

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

export function loadBedtimePlan(): BedtimePlan {
  try {
    const raw = localStorage.getItem(BEDTIME_PLAN_KEY)
    if (raw) return JSON.parse(raw)
  } catch {}
  return {
    weekday: { duration: 30, maxVolume: 0.7, defaultScene: '', defaultSticker: '' },
    weekend: { duration: 45, maxVolume: 0.7, defaultScene: '', defaultSticker: '' },
  }
}

export function saveBedtimePlan(plan: BedtimePlan): void {
  localStorage.setItem(BEDTIME_PLAN_KEY, JSON.stringify(plan))
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

export function isWeekend(dateStr?: string): boolean {
  const d = dateStr ? new Date(dateStr + 'T00:00:00') : new Date()
  const day = d.getDay()
  return day === 0 || day === 6
}

export function getStreak(records: NightRecord[]): number {
  let streak = 0
  const today = new Date()
  let started = false
  for (let i = 0; i < 365; i++) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    const dateStr = d.toISOString().slice(0, 10)
    const rec = records.find((r) => r.date === dateStr)
    if (rec && rec.liedDownOnTime && rec.noCallOut) {
      streak++
      started = true
    } else if (!started && i === 0) {
      continue
    } else if (started) {
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

export function getConsecutiveStreakDays(records: NightRecord[]): string[] {
  const days: string[] = []
  const today = new Date()
  let startIdx = 0
  for (let i = 0; i < 365; i++) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    const dateStr = d.toISOString().slice(0, 10)
    const rec = records.find((r) => r.date === dateStr)
    if (rec && rec.liedDownOnTime && rec.noCallOut) {
      startIdx = i
      break
    }
    if (i === 0 && (!rec || rec.liedDownOnTime === null || rec.noCallOut === null)) {
      continue
    }
    if (!rec || !(rec.liedDownOnTime && rec.noCallOut)) {
      startIdx = i
      break
    }
  }
  for (let i = startIdx; i < 365; i++) {
    const d = new Date(today)
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

export interface SleepReport {
  totalNights: number
  completeNights: number
  liedDownCount: number
  noCallOutCount: number
  sceneCounts: Record<string, number>
  stickerCounts: Record<string, number>
  streakChange: number
  summary: string
}

export function generateSleepReport(records: NightRecord[], days: string[]): SleepReport {
  const recs = days
    .map((d) => records.find((r) => r.date === d))
    .filter((r): r is NightRecord => !!r)

  const totalNights = recs.length
  const completeNights = recs.filter((r) => r.liedDownOnTime && r.noCallOut).length
  const liedDownCount = recs.filter((r) => r.liedDownOnTime === true).length
  const noCallOutCount = recs.filter((r) => r.noCallOut === true).length

  const sceneCounts: Record<string, number> = {}
  const stickerCounts: Record<string, number> = {}
  for (const r of recs) {
    sceneCounts[r.sceneId] = (sceneCounts[r.sceneId] || 0) + 1
    stickerCounts[r.stickerId] = (stickerCounts[r.stickerId] || 0) + 1
  }

  const streakNow = getStreak(records)
  const streakBefore = computeStreakBefore(records, days.length)
  const streakChange = streakNow - streakBefore

  let summary = ''
  if (completeNights === totalNights && totalNights > 0) {
    summary = '太棒了！每天都乖乖睡觉，真是一个小榜样！🌟'
  } else if (completeNights >= totalNights * 0.7) {
    summary = `大部分晚上都睡得很好呢，再努力一点点就能全满星啦！💪`
  } else if (completeNights > 0) {
    summary = `有${completeNights}天乖乖睡觉了，每天进步一点点！🌱`
  } else if (totalNights > 0) {
    summary = '新的一周开始啦，今晚试试早点躺下吧～🌙'
  }

  return { totalNights, completeNights, liedDownCount, noCallOutCount, sceneCounts, stickerCounts, streakChange, summary }
}

function computeStreakBefore(records: NightRecord[], offsetDays: number): number {
  let streak = 0
  const ref = new Date()
  ref.setDate(ref.getDate() - offsetDays)
  for (let i = 0; i < 365; i++) {
    const d = new Date(ref)
    d.setDate(d.getDate() - i)
    const dateStr = d.toISOString().slice(0, 10)
    const rec = records.find((r) => r.date === dateStr)
    if (rec && rec.liedDownOnTime && rec.noCallOut) {
      streak++
    } else {
      break
    }
  }
  return streak
}

export function getMonthRange(year: number, month: number): string[] {
  const days: string[] = []
  const lastDay = new Date(year, month + 1, 0).getDate()
  for (let d = 1; d <= lastDay; d++) {
    const date = new Date(year, month, d)
    days.push(date.toISOString().slice(0, 10))
  }
  return days
}
