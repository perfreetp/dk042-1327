import { create } from 'zustand'
import { type ParentSettings, type NightRecord, loadSettings, saveSettings, loadRecords, saveRecords, getToday } from '@/data/storage'

interface AppState {
  settings: ParentSettings
  records: NightRecord[]
  selectedScene: string | null
  selectedSticker: string | null
  isPlaying: boolean
  remainingSeconds: number
  showParentPanel: boolean
  showStoryGuide: boolean
  currentGuideIndex: number

  updateSettings: (s: Partial<ParentSettings>) => void
  selectScene: (id: string) => void
  selectSticker: (id: string) => void
  setPlaying: (v: boolean) => void
  setRemainingSeconds: (s: number) => void
  tick: () => void
  setShowParentPanel: (v: boolean) => void
  setShowStoryGuide: (v: boolean) => void
  setCurrentGuideIndex: (i: number) => void
  saveNightRecord: () => void
  updateMorningRecord: (date: string, liedDown: boolean, noCall: boolean) => void
  resetNight: () => void
}

export const useStore = create<AppState>((set, get) => ({
  settings: loadSettings(),
  records: loadRecords(),
  selectedScene: null,
  selectedSticker: null,
  isPlaying: false,
  remainingSeconds: 0,
  showParentPanel: false,
  showStoryGuide: false,
  currentGuideIndex: 0,

  updateSettings: (partial) => {
    const next = { ...get().settings, ...partial, lastUpdated: getToday() }
    saveSettings(next)
    set({ settings: next })
  },

  selectScene: (id) => set({ selectedScene: id }),
  selectSticker: (id) => set({ selectedSticker: id }),
  setPlaying: (v) => set({ isPlaying: v }),
  setRemainingSeconds: (s) => set({ remainingSeconds: s }),

  tick: () => {
    const { remainingSeconds, isPlaying } = get()
    if (!isPlaying || remainingSeconds <= 0) return
    set({ remainingSeconds: remainingSeconds - 1 })
  },

  setShowParentPanel: (v) => set({ showParentPanel: v }),
  setShowStoryGuide: (v) => set({ showStoryGuide: v }),
  setCurrentGuideIndex: (i) => set({ currentGuideIndex: i }),

  saveNightRecord: () => {
    const { selectedScene, selectedSticker, records } = get()
    if (!selectedScene || !selectedSticker) return
    const today = getToday()
    const existing = records.findIndex((r) => r.date === today)
    const record: NightRecord = {
      date: today,
      sceneId: selectedScene,
      stickerId: selectedSticker,
      liedDownOnTime: null,
      noCallOut: null,
      timestamp: Date.now(),
    }
    const next = [...records]
    if (existing >= 0) {
      next[existing] = { ...next[existing], ...record }
    } else {
      next.push(record)
    }
    saveRecords(next)
    set({ records: next })
  },

  updateMorningRecord: (date, liedDown, noCall) => {
    const { records } = get()
    const idx = records.findIndex((r) => r.date === date)
    if (idx < 0) return
    const next = [...records]
    next[idx] = { ...next[idx], liedDownOnTime: liedDown, noCallOut: noCall }
    saveRecords(next)
    set({ records: next })
  },

  resetNight: () =>
    set({
      selectedScene: null,
      selectedSticker: null,
      isPlaying: false,
      remainingSeconds: 0,
      showStoryGuide: false,
      currentGuideIndex: 0,
    }),
}))
