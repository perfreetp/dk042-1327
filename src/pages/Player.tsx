import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useState, useRef, useCallback } from 'react'
import { Pause, Play, Volume2, ChevronLeft } from 'lucide-react'
import { useStore } from '@/store/useStore'
import { getScene } from '@/data/scenes'
import { stickers } from '@/data/stickers'
import { audioEngine } from '@/utils/audioEngine'

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

  const [volume, setVolume] = useState(settings.maxVolume)
  const [showStickerPicker, setShowStickerPicker] = useState(false)
  const [guideText, setGuideText] = useState<string | null>(null)
  const [selectedStickerEmoji, setSelectedStickerEmoji] = useState<string | null>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const guideIndexRef = useRef(0)

  const startPlayback = useCallback(() => {
    if (!scene) return
    const totalSeconds = settings.duration * 60
    setRemainingSeconds(totalSeconds)
    setPlaying(true)
    audioEngine.play(scene.sounds as any[], settings.maxVolume)
  }, [scene, settings, setRemainingSeconds, setPlaying])

  useEffect(() => {
    startPlayback()
  }, [startPlayback])

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
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [remainingSeconds, isPlaying, setPlaying])

  useEffect(() => {
    if (!scene || !isPlaying) return
    const interval = setInterval(() => {
      guideIndexRef.current = (guideIndexRef.current + 1) % scene.guideTexts.length
      setGuideText(scene.guideTexts[guideIndexRef.current])
      setTimeout(() => setGuideText(null), 4000)
    }, 45000)
    return () => clearInterval(interval)
  }, [scene, isPlaying])

  useEffect(() => {
    return () => {
      audioEngine.stop()
      setPlaying(false)
    }
  }, [setPlaying])

  const togglePlay = () => {
    if (isPlaying) {
      audioEngine.stop()
      setPlaying(false)
      if (timerRef.current) clearInterval(timerRef.current)
    } else {
      startPlayback()
    }
  }

  const handleVolumeChange = (v: number) => {
    const clamped = Math.min(v, settings.maxVolume)
    setVolume(clamped)
    audioEngine.setVolume(clamped)
  }

  const handleStickerSelect = (stickerId: string) => {
    selectSticker(stickerId)
    const s = stickers.find((st) => st.id === stickerId)
    setSelectedStickerEmoji(s?.emoji || null)
    setShowStickerPicker(false)
    saveNightRecord()
  }

  const handleBack = () => {
    audioEngine.stop()
    setPlaying(false)
    navigate('/')
  }

  if (!scene) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#1a1a3e] text-white">
        场景不存在
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
    </div>
  )
}
