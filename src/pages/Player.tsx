import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useState, useRef, useCallback } from 'react'
import { Pause, Play, Volume2, ChevronLeft, VolumeX } from 'lucide-react'
import { useStore } from '@/store/useStore'
import { getScene } from '@/data/scenes'
import { stickers } from '@/data/stickers'
import { audioEngine, type SoundType } from '@/utils/audioEngine'

function CloudBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      {Array.from({ length: 8 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full bg-white/5"
          style={{
            width: 120 + i * 40,
            height: 60 + i * 20,
            top: `${15 + i * 10}%`,
            left: `${-10 + i * 12}%`,
            filter: 'blur(20px)',
          }}
          animate={{
            x: [0, 60, 0],
            y: [0, -10, 0],
          }}
          transition={{
            duration: 20 + i * 5,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: i * 2,
          }}
        />
      ))}
    </div>
  )
}

function WaveBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      {Array.from({ length: 5 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute bottom-0 w-[200%] rounded-[100%_100%_0_0]"
          style={{
            height: `${30 + i * 10}%`,
            left: '-50%',
            background: `rgba(125, 211, 252, ${0.03 + i * 0.015})`,
            bottom: `${-5 + i * 3}%`,
          }}
          animate={{
            x: [0, 30, -20, 0],
          }}
          transition={{
            duration: 8 + i * 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  )
}

function ForestBackground() {
  const fireflies = useRef(
    Array.from({ length: 15 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: Math.random() * 5,
      duration: 3 + Math.random() * 4,
    }))
  ).current

  return (
    <div className="absolute inset-0 overflow-hidden">
      {fireflies.map((f) => (
        <motion.div
          key={f.id}
          className="absolute h-2 w-2 rounded-full bg-green-300/60"
          style={{ left: `${f.x}%`, top: `${f.y}%`, filter: 'blur(1px)' }}
          animate={{
            opacity: [0, 0.8, 0],
            x: [0, Math.random() * 40 - 20],
            y: [0, Math.random() * 30 - 15],
          }}
          transition={{
            duration: f.duration,
            delay: f.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  )
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

export default function Player() {
  const { sceneId } = useParams<{ sceneId: string }>()
  const navigate = useNavigate()
  const scene = getScene(sceneId || '')
  const settings = useStore((s) => s.settings)
  const isPlaying = useStore((s) => s.isPlaying)
  const setPlaying = useStore((s) => s.setPlaying)
  const remainingSeconds = useStore((s) => s.remainingSeconds)
  const setRemainingSeconds = useStore((s) => s.setRemainingSeconds)
  const tick = useStore((s) => s.tick)
  const selectedSticker = useStore((s) => s.selectedSticker)
  const selectSticker = useStore((s) => s.selectSticker)
  const saveNightRecord = useStore((s) => s.saveNightRecord)
  const soundMix = useStore((s) => s.soundMix)
  const setSoundVolume = useStore((s) => s.setSoundVolume)
  const getGuideTexts = useStore((s) => s.getGuideTexts)

  const [volume, setVolume] = useState(settings.maxVolume)
  const [showStickerPicker, setShowStickerPicker] = useState(false)
  const [guideText, setGuideText] = useState<string | null>(null)
  const [selectedStickerEmoji, setSelectedStickerEmoji] = useState<string | null>(null)
  const [showSoundMixer, setShowSoundMixer] = useState(false)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const guideIndexRef = useRef(0)
  const audioStartedRef = useRef(false)

  const hasConfirmed = !!settings.lastUpdated

  useEffect(() => {
    if (!sceneId || !scene || hasConfirmed) return
    navigate('/', { replace: true })
  }, [sceneId, scene, hasConfirmed, navigate])

  const startPlayback = useCallback(() => {
    if (!scene) return
    const totalSeconds = settings.duration * 60
    setRemainingSeconds(totalSeconds)
    setPlaying(true)

    const sounds = scene.sounds.map((s) => {
      const vol = soundMix[scene.id]?.[s.id] ?? s.defaultVolume
      return { type: s.id as SoundType, volume: vol }
    })
    audioEngine.play(sounds, settings.maxVolume)
    audioStartedRef.current = true
  }, [scene, settings, soundMix, setRemainingSeconds, setPlaying])

  const resumePlayback = useCallback(() => {
    setPlaying(true)
    audioEngine.resume()
  }, [setPlaying])

  const pausePlayback = useCallback(() => {
    setPlaying(false)
    audioEngine.pause()
    if (timerRef.current) clearInterval(timerRef.current)
  }, [setPlaying])

  useEffect(() => {
    if (!hasConfirmed) return
    if (!audioStartedRef.current) {
      startPlayback()
    }
  }, [startPlayback, hasConfirmed])

  useEffect(() => {
    if (!isPlaying) return
    timerRef.current = setInterval(() => {
      tick()
    }, 1000)
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [isPlaying, tick])

  useEffect(() => {
    if (remainingSeconds <= 30 && remainingSeconds > 0 && isPlaying) {
      audioEngine.fadeOut(30)
    }
    if (remainingSeconds <= 0 && isPlaying) {
      setPlaying(false)
      audioEngine.stop()
      audioStartedRef.current = false
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [remainingSeconds, isPlaying, setPlaying])

  const guideTexts = getGuideTexts(scene?.id || '')

  useEffect(() => {
    if (!scene || !isPlaying || guideTexts.length === 0) return
    const interval = setInterval(() => {
      guideIndexRef.current = (guideIndexRef.current + 1) % guideTexts.length
      setGuideText(guideTexts[guideIndexRef.current])
      setTimeout(() => setGuideText(null), 4000)
    }, 45000)
    return () => clearInterval(interval)
  }, [scene, isPlaying, guideTexts])

  useEffect(() => {
    return () => {
      audioEngine.stop()
      audioStartedRef.current = false
      setPlaying(false)
    }
  }, [setPlaying])

  const togglePlay = () => {
    if (isPlaying) {
      pausePlayback()
    } else {
      if (audioStartedRef.current) {
        resumePlayback()
      } else {
        startPlayback()
      }
    }
  }

  const handleVolumeChange = (v: number) => {
    const clamped = Math.min(v, settings.maxVolume)
    setVolume(clamped)
    audioEngine.setMasterVolume(clamped)
  }

  const handleStickerSelect = (stickerId: string) => {
    selectSticker(stickerId)
    const s = stickers.find((st) => st.id === stickerId)
    setSelectedStickerEmoji(s?.emoji || null)
    setShowStickerPicker(false)
    saveNightRecord()
  }

  const handleTrackVolumeChange = (soundId: string, vol: number) => {
    if (!scene) return
    setSoundVolume(scene.id, soundId, vol)
    audioEngine.setTrackVolume(soundId as SoundType, vol)
  }

  const handleBack = () => {
    audioEngine.stop()
    audioStartedRef.current = false
    setPlaying(false)
    navigate('/')
  }

  if (!scene || !hasConfirmed) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#1a1a3e] text-white">
        加载中...
      </div>
    )
  }

  const BackgroundComponent =
    scene.id === 'cloud' ? CloudBackground : scene.id === 'seaside' ? WaveBackground : ForestBackground

  return (
    <div className={`relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-gradient-to-b ${scene.bgGradient}`}>
      <BackgroundComponent />

      <button
        onClick={handleBack}
        className="fixed left-6 top-6 z-30 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white/60 backdrop-blur-sm transition-colors hover:bg-white/20"
      >
        <ChevronLeft className="h-6 w-6" />
      </button>

      <button
        onClick={() => setShowSoundMixer(true)}
        className="fixed right-6 top-6 z-30 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white/60 backdrop-blur-sm transition-colors hover:bg-white/20 hover:text-white"
      >
        <Volume2 className="h-5 w-5" />
      </button>

      <div className="relative z-10 flex flex-col items-center gap-6 px-6">
        <motion.span
          className="text-7xl"
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        >
          {scene.icon}
        </motion.span>

        <h1 className="text-2xl font-bold text-white">{scene.name}</h1>

        {selectedStickerEmoji && (
          <motion.div
            initial={{ scale: 0, rotate: -20 }}
            animate={{ scale: 1, rotate: 0 }}
            className="text-5xl"
          >
            {selectedStickerEmoji}
          </motion.div>
        )}

        <AnimatePresence>
          {guideText && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="rounded-2xl bg-white/10 px-6 py-3 text-center text-lg text-white/80 backdrop-blur-sm"
              style={{ fontFamily: "'Caveat', cursive" }}
            >
              {guideText}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-20 bg-black/30 px-6 pb-8 pt-4 backdrop-blur-md">
        <div className="mx-auto flex max-w-lg items-center gap-6">
          <button
            onClick={togglePlay}
            className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-white/15 text-white transition-colors hover:bg-white/25"
          >
            {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6 ml-0.5" />}
          </button>

          <div className="flex-1 text-center">
            <p className="text-3xl font-light text-white tabular-nums">
              {formatTime(remainingSeconds)}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Volume2 className="h-4 w-4 text-white/50" />
            <input
              type="range"
              min={0}
              max={settings.maxVolume}
              step={0.05}
              value={volume}
              onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
              className="h-1.5 w-20 cursor-pointer appearance-none rounded-full bg-white/20 accent-[#ffd97d]"
            />
          </div>
        </div>

        {!selectedSticker && (
          <div className="mx-auto mt-4 max-w-lg">
            <button
              onClick={() => setShowStickerPicker(true)}
              className="w-full rounded-2xl bg-[#ffd97d]/20 py-3 text-base font-medium text-[#ffd97d] transition-colors hover:bg-[#ffd97d]/30"
            >
              选一枚贴纸带去睡觉 ✨
            </button>
          </div>
        )}
      </div>

      <AnimatePresence>
        {showStickerPicker && (
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed bottom-0 left-0 right-0 z-30 rounded-t-3xl bg-slate-900/95 px-6 pb-10 pt-6 backdrop-blur-lg"
          >
            <h3 className="mb-5 text-center text-lg font-semibold text-white">
              选一枚贴纸带去睡觉
            </h3>
            <div className="flex justify-center gap-6">
              {stickers.map((sticker) => (
                <motion.button
                  key={sticker.id}
                  whileHover={{ scale: 1.15 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleStickerSelect(sticker.id)}
                  className="flex h-20 w-20 flex-col items-center justify-center rounded-2xl bg-white/10 transition-colors hover:bg-white/20"
                >
                  <span className="text-3xl">{sticker.emoji}</span>
                  <span className="mt-1 text-xs text-white/60">{sticker.name}</span>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showSoundMixer && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
              onClick={() => setShowSoundMixer(false)}
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="fixed bottom-0 left-0 right-0 z-40 rounded-t-3xl bg-slate-900/95 px-6 pb-8 pt-6 backdrop-blur-lg"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="mb-5 flex items-center gap-2 text-lg font-semibold text-white">
                <Volume2 className="h-5 w-5 text-[#ffd97d]" />
                声音调节
              </h3>
              <div className="space-y-4">
                {scene.sounds.map((sound) => {
                  const vol = soundMix[scene.id]?.[sound.id] ?? sound.defaultVolume
                  const isMuted = vol === 0
                  return (
                    <div key={sound.id} className="flex items-center gap-3">
                      <button
                        onClick={() =>
                          handleTrackVolumeChange(
                            sound.id,
                            isMuted ? sound.defaultVolume : 0
                          )
                        }
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10 text-white/70 transition-colors hover:bg-white/20"
                      >
                        {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                      </button>
                      <div className="flex-1">
                        <div className="mb-1 flex justify-between">
                          <span className="text-sm text-white/80">{sound.name}</span>
                          <span className="text-xs text-white/40">
                            {Math.round(vol * 100)}%
                          </span>
                        </div>
                        <input
                          type="range"
                          min={0}
                          max={1}
                          step={0.05}
                          value={vol}
                          onChange={(e) =>
                            handleTrackVolumeChange(sound.id, parseFloat(e.target.value))
                          }
                          className="w-full"
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
              <button
                onClick={() => setShowSoundMixer(false)}
                className="mt-6 min-h-[48px] w-full rounded-2xl bg-[#ffd97d] text-base font-bold text-slate-900 transition-opacity hover:opacity-90"
              >
                完成
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
