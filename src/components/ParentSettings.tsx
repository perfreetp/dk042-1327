import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Settings, X } from 'lucide-react'
import { useStore } from '@/store/useStore'
import { cn } from '@/lib/utils'

const DURATIONS = [15, 30, 45, 60]

interface ParentSettingsProps {
  open: boolean
  onClose: () => void
}

export default function ParentSettings({ open, onClose }: ParentSettingsProps) {
  const settings = useStore((s) => s.settings)
  const updateSettings = useStore((s) => s.updateSettings)

  const [duration, setDuration] = useState(settings.duration)
  const [maxVolume, setMaxVolume] = useState(settings.maxVolume)

  useEffect(() => {
    if (open) {
      setDuration(settings.duration)
      setMaxVolume(settings.maxVolume)
    }
  }, [open, settings.duration, settings.maxVolume])

  const handleConfirm = () => {
    updateSettings({ duration, maxVolume })
    onClose()
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/50"
            onClick={onClose}
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 bottom-0 z-50 flex w-full max-w-sm flex-col rounded-l-3xl bg-slate-900/95 backdrop-blur-lg"
          >
            <div className="flex items-center justify-between px-6 py-5">
              <div className="flex items-center gap-3">
                <Settings className="h-6 w-6 text-[#ffd97d]" />
                <h2 className="text-xl font-bold text-white">家长设置</h2>
              </div>
              <button
                onClick={onClose}
                className="flex h-12 w-12 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-800 hover:text-white"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 pb-6">
              <section className="mb-8">
                <h3 className="mb-4 text-lg font-semibold text-slate-300">播放时长</h3>
                <div className="flex flex-wrap gap-3">
                  {DURATIONS.map((d) => (
                    <button
                      key={d}
                      onClick={() => setDuration(d)}
                      className={cn(
                        'min-h-[48px] min-w-[48px] rounded-full px-5 py-2.5 text-base font-medium transition-colors',
                        duration === d
                          ? 'bg-[#ffd97d] text-slate-900'
                          : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                      )}
                    >
                      {d}分钟
                    </button>
                  ))}
                </div>
              </section>

              <section className="mb-8">
                <h3 className="mb-4 text-lg font-semibold text-slate-300">最大音量</h3>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.05}
                    value={maxVolume}
                    onChange={(e) => setMaxVolume(parseFloat(e.target.value))}
                    className="h-2 w-full cursor-pointer appearance-none rounded-full bg-slate-700 accent-[#ffd97d]"
                  />
                  <span className="min-w-[3rem] text-right text-base font-medium text-slate-300">
                    {Math.round(maxVolume * 100)}%
                  </span>
                </div>
              </section>
            </div>

            <div className="px-6 pb-8 pt-4">
              <button
                onClick={handleConfirm}
                className="min-h-[48px] w-full rounded-2xl bg-[#ffd97d] py-3 text-lg font-bold text-slate-900 transition-opacity hover:opacity-90 active:opacity-80"
              >
                确认
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
