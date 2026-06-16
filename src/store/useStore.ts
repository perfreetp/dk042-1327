import { create } from 'zustand'
import {
  type ParentSettings,
  type NightRecord,
  type SoundMix,
  type CustomGuideTexts,
  loadSettings,
  saveSettings,
  loadRecords,
  saveRecords,
  loadSoundMix,
  saveSoundMix,
  loadGuideTexts,
  saveGuideTexts,
  getToday,
  getParentUnlocked,
  setParentUnlocked,
} from '@/data/storage'
import { scenes, getSoundVolume } from '@/data/scenes'

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
  parentUnlocked: boolean
  soundMix: SoundMix
  customGuideTexts: CustomGuideTexts

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

  unlockParent: () => boolean
  lockParent: () => void

  setSoundVolume: (sceneId: string, soundId: string, volume: number) => void
  getSceneSoundVolumes: (sceneId: string) => { id: string; name: string; volume: number }[]

  setGuideTexts: (sceneId: string, texts: string[]) => void
  getGuideTexts: (sceneId: string) => string[]
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
  parentUnlocked: getParentUnlocked(),
  soundMix: loadSoundMix(),
  customGuideTexts: loadGuideTexts(),

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

  unlockParent: () => {
    setParentUnlocked()
    set({ parentUnlocked: true })
    return true
  },

  lockParent: () => {
    set({ parentUnlocked: false })
  },

  setSoundVolume: (sceneId, soundId, volume) => {
    const { soundMix } = get()
    const sceneMix = soundMix[sceneId] || {}
    const nextSceneMix = { ...sceneMix, [soundId]: volume }
    const nextMix = { ...soundMix, [sceneId]: nextSceneMix }
    saveSoundMix(nextMix)
    set({ soundMix: nextMix })
  },

  getSceneSoundVolumes: (sceneId) => {
    const { soundMix } = get()
    const scene = scenes.find((s) => s.id === sceneId)
    if (!scene) return []
    return scene.sounds.map((s) => ({
      id: s.id,
      name: s.name,
      volume: getSoundVolume(sceneId, s.id, soundMix),
    }))
  },

  setGuideTexts: (sceneId, texts) => {
    const { customGuideTexts } = get()
    const next = { ...customGuideTexts, [sceneId]: texts }
    saveGuideTexts(next)
    set({ customGuideTexts: next })
  },

  getGuideTexts: (sceneId) => {
    const { customGuideTexts } = get()
    const custom = customGuideTexts[sceneId]
    if (custom && custom.length > 0) return custom
    const scene = scenes.find((s) => s.id === sceneId)
    return scene?.guideTexts || []
  },
}))
