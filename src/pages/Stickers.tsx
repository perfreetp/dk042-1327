import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Star, Check } from 'lucide-react'
import { useStore } from '@/store/useStore'
import { scenes } from '@/data/scenes'
import { getSticker } from '@/data/stickers'
import { getLast7Days, getStreak, getYesterday, type NightRecord } from '@/data/storage'
import { useEffect, useState } from 'react'
import StarField from '@/components/StarField'

export default function Stickers() {
  const navigate = useNavigate()
  const records = useStore((s) => s.records)
  const updateMorningRecord = useStore((s) => s.updateMorningRecord)

  const last7 = getLast7Days()
  const yesterday = getYesterday()
  const yesterdayRecord = records.find((r) => r.date === yesterday)

  const [liedDown, setLiedDown] = useState<boolean | null>(yesterdayRecord?.liedDownOnTime ?? null)
  const [noCall, setNoCall] = useState<boolean | null>(yesterdayRecord?.noCallOut ?? null)
  const [showSaved, setShowSaved] = useState(false)

  useEffect(() => {
    if (yesterdayRecord) {
      setLiedDown(yesterdayRecord.liedDownOnTime)
      setNoCall(yesterdayRecord.noCallOut)
    }
  }, [yesterdayRecord?.liedDownOnTime, yesterdayRecord?.noCallOut])

  const trySave = (newLiedDown: boolean | null, newNoCall: boolean | null) => {
    if (newLiedDown !== null && newNoCall !== null && yesterdayRecord) {
      updateMorningRecord(yesterday, newLiedDown, newNoCall)
      setShowSaved(true)
      setTimeout(() => setShowSaved(false), 2000)
    }
  }

  const handleLiedDownClick = (v: boolean) => {
    setLiedDown(v)
    trySave(v, noCall)
  }

  const handleNoCallClick = (v: boolean) => {
    setNoCall(v)
    trySave(liedDown, v)
  }

  const getRecordForDay = (date: string): NightRecord | undefined => {
    return records.find((r) => r.date === date)
  }

  const sceneIcon = (id: string) => scenes.find((s) => s.id === id)?.icon || '🌙'
  const stickerEmoji = (id: string) => getSticker(id)?.emoji || '⭐'
  const streak = getStreak(records)

  const needsMorningCheck = yesterdayRecord && (yesterdayRecord.liedDownOnTime === null || yesterdayRecord.noCallOut === null)

  return (
    <div className="relative flex min-h-screen flex-col items-center overflow-hidden bg-gradient-to-b from-[#0a0a2e] via-[#1a1a3e] to-[#0d0d35]">
      <StarField />

      <button
        onClick={() => navigate('/')}
        className="fixed left-6 top-6 z-30 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white/60 backdrop-blur-sm transition-colors hover:bg-white/20 hover:text-[#ffd97d]"
      >
        <ArrowLeft className="h-5 w-5" />
      </button>

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 mt-20 mb-8 text-center"
      >
        <h1 className="mb-2 text-3xl font-bold text-white" style={{ fontFamily: "'Caveat', cursive" }}>
          我的贴纸墙
        </h1>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
        className="relative z-10 mb-8 flex flex-col items-center rounded-3xl bg-white/5 px-8 py-6 backdrop-blur-sm"
      >
        <div className="flex items-center gap-2 text-[#ffd97d]">
          <Star className="h-6 w-6 fill-current" />
          <span key={streak} className="text-4xl font-bold">
            <motion.span
              key={streak}
              initial={{ scale: 0.5 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 10 }}
            >
              {streak}
            </motion.span>
          </span>
        </div>
        <p className="mt-1 text-sm text-white/50">连续乖乖睡觉天数</p>
        <div className="mt-3 flex gap-1">
          {Array.from({ length: 7 }).map((_, i) => (
            <motion.div
              key={i}
              initial={{ width: 0 }}
              animate={{ width: '1.5rem' }}
              transition={{ delay: 0.3 + i * 0.1 }}
              className={`h-2 w-6 rounded-full transition-colors duration-500 ${i < streak ? 'bg-[#ffd97d]' : 'bg-white/10'}`}
            />
          ))}
        </div>
      </motion.div>

      {needsMorningCheck && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="relative z-10 mb-8 w-full max-w-md rounded-3xl bg-white/5 px-6 py-6 backdrop-blur-sm"
        >
          <h2 className="mb-4 text-center text-lg font-semibold text-white">昨晚睡得好吗？</h2>
          <div className="mb-4 flex items-center gap-3 text-white/60">
            <span className="text-2xl">{sceneIcon(yesterdayRecord!.sceneId)}</span>
            <span className="text-sm">{stickerEmoji(yesterdayRecord!.stickerId)}</span>
          </div>

          <div className="space-y-4">
            <div>
              <p className="mb-2 text-sm text-white/70">按时躺好了吗？</p>
              <div className="flex gap-3">
                <button
                  onClick={() => handleLiedDownClick(true)}
                  className={`relative flex-1 rounded-2xl py-3 text-base font-medium transition-colors ${
                    liedDown === true
                      ? 'bg-[#ffd97d] text-slate-900'
                      : 'bg-white/10 text-white/60 hover:bg-white/15'
                  }`}
                >
                  😊 躺好了
                  {liedDown === true && (
                    <Check className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2" />
                  )}
                </button>
                <button
                  onClick={() => handleLiedDownClick(false)}
                  className={`relative flex-1 rounded-2xl py-3 text-base font-medium transition-colors ${
                    liedDown === false
                      ? 'bg-orange-400/80 text-slate-900'
                      : 'bg-white/10 text-white/60 hover:bg-white/15'
                  }`}
                >
                  😴 还没呢
                  {liedDown === false && (
                    <Check className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <p className="mb-2 text-sm text-white/70">中途有没有喊人？</p>
              <div className="flex gap-3">
                <button
                  onClick={() => handleNoCallClick(true)}
                  className={`relative flex-1 rounded-2xl py-3 text-base font-medium transition-colors ${
                    noCall === true
                      ? 'bg-[#ffd97d] text-slate-900'
                      : 'bg-white/10 text-white/60 hover:bg-white/15'
                  }`}
                >
                  😊 没有哦
                  {noCall === true && (
                    <Check className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2" />
                  )}
                </button>
                <button
                  onClick={() => handleNoCallClick(false)}
                  className={`relative flex-1 rounded-2xl py-3 text-base font-medium transition-colors ${
                    noCall === false
                      ? 'bg-orange-400/80 text-slate-900'
                      : 'bg-white/10 text-white/60 hover:bg-white/15'
                  }`}
                >
                  😴 喊了
                  {noCall === false && (
                    <Check className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      <AnimatePresence>
        {showSaved && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed left-1/2 top-1/2 z-40 -translate-x-1/2 -translate-y-1/2 rounded-3xl bg-[#ffd97d] px-8 py-6 text-slate-900 shadow-2xl"
          >
            <div className="flex flex-col items-center gap-2">
              <Star className="h-10 w-10 fill-current" />
              <span className="text-xl font-bold">记录成功！</span>
              <span className="text-sm opacity-70">贴纸已收入星星墙 ✨</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="relative z-10 w-full max-w-lg px-6 pb-12"
      >
        <h2 className="mb-4 text-center text-lg font-semibold text-white/70">近 7 天</h2>
        <div className="flex justify-between gap-2">
          {last7.map((date) => {
            const rec = getRecordForDay(date)
            const isComplete = rec && rec.liedDownOnTime && rec.noCallOut
            const dayLabel = new Date(date + 'T00:00:00').toLocaleDateString('zh-CN', { weekday: 'short' })

            return (
              <motion.div
                key={date}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.7 + (last7.indexOf(date)) * 0.08 }}
                className="flex flex-1 flex-col items-center gap-2 rounded-2xl bg-white/5 py-3"
              >
                <span className="text-xs text-white/40">{dayLabel}</span>
                {rec ? (
                  <>
                    <span className="text-lg">{sceneIcon(rec.sceneId)}</span>
                    <span className="text-sm">{stickerEmoji(rec.stickerId)}</span>
                    {isComplete ? (
                      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.9 }}>
                        <Star className="h-3 w-3 fill-[#ffd97d] text-[#ffd97d]" />
                      </motion.div>
                    ) : null}
                  </>
                ) : (
                  <span className="text-lg text-white/10">—</span>
                )}
              </motion.div>
            )
          })}
        </div>
      </motion.div>
    </div>
  )
}
