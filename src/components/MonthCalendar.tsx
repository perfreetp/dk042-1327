import { motion } from 'framer-motion'
import { Star, ChevronLeft, ChevronRight } from 'lucide-react'
import type { NightRecord } from '@/data/storage'
import { getMonthDays, isCurrentMonth, getToday, getConsecutiveStreakDays } from '@/data/storage'
import { scenes } from '@/data/scenes'
import { getSticker } from '@/data/stickers'

interface MonthCalendarProps {
  records: NightRecord[]
  year: number
  month: number
  onMonthChange: (year: number, month: number) => void
}

export default function MonthCalendar({ records, year, month, onMonthChange }: MonthCalendarProps) {
  const today = getToday()
  const days = getMonthDays(year, month)
  const streakDays = getConsecutiveStreakDays(records)
  const streakSet = new Set(streakDays)

  const monthName = new Date(year, month).toLocaleDateString('zh-CN', { year: 'numeric', month: 'long' })

  const prevMonth = () => {
    if (month === 0) {
      onMonthChange(year - 1, 11)
    } else {
      onMonthChange(year, month - 1)
    }
  }

  const nextMonth = () => {
    if (month === 11) {
      onMonthChange(year + 1, 0)
    } else {
      onMonthChange(year, month + 1)
    }
  }

  const weekdays = ['日', '一', '二', '三', '四', '五', '六']

  const getSceneIcon = (sceneId: string) => scenes.find((s) => s.id === sceneId)?.icon || '🌙'
  const getStickerEmoji = (stickerId: string) => getSticker(stickerId)?.emoji || '⭐'

  return (
    <div className="w-full max-w-lg">
      <div className="mb-4 flex items-center justify-between">
        <button
          onClick={prevMonth}
          className="flex h-10 w-10 items-center justify-center rounded-full text-white/50 transition-colors hover:bg-white/10 hover:text-white"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <h3 className="text-lg font-semibold text-white">{monthName}</h3>
        <button
          onClick={nextMonth}
          className="flex h-10 w-10 items-center justify-center rounded-full text-white/50 transition-colors hover:bg-white/10 hover:text-white"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      <div className="mb-2 grid grid-cols-7 gap-1">
        {weekdays.map((w) => (
          <div key={w} className="py-2 text-center text-xs text-white/40">
            {w}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1.5">
        {days.map((date) => {
          const inMonth = isCurrentMonth(date, year, month)
          const record = records.find((r) => r.date === date)
          const isToday = date === today
          const isComplete = record && record.liedDownOnTime && record.noCallOut
          const isStreakDay = streakSet.has(date) && inMonth
          const dateNum = new Date(date + 'T00:00:00').getDate()

          const hasMorningCheck = record && (record.liedDownOnTime !== null || record.noCallOut !== null)

          return (
            <motion.div
              key={date}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2 }}
              className={`relative flex aspect-square flex-col items-center justify-center rounded-xl ${
                !inMonth ? 'opacity-20' : ''
              } ${isToday ? 'ring-2 ring-[#ffd97d]' : ''}`}
              style={{
                background: isStreakDay
                  ? 'linear-gradient(135deg, rgba(255,217,125,0.15), rgba(255,217,125,0.05))'
                  : 'rgba(255,255,255,0.03)',
              }}
            >
              {isStreakDay && (
                <Star className="absolute right-0.5 top-0.5 h-2.5 w-2.5 fill-[#ffd97d] text-[#ffd97d]" />
              )}
              <span
                className={`text-xs ${
                  isToday ? 'font-bold text-[#ffd97d]' : 'text-white/50'
                }`}
              >
                {dateNum}
              </span>
              {record && (
                <div className="mt-0.5 flex items-center gap-0.5 text-[10px]">
                  <span>{getSceneIcon(record.sceneId)}</span>
                  <span>{getStickerEmoji(record.stickerId)}</span>
                </div>
              )}
              {hasMorningCheck && (
                <div className="mt-0.5 flex gap-0.5">
                  <span
                    className={`inline-block h-1.5 w-1.5 rounded-full ${
                      record!.liedDownOnTime ? 'bg-emerald-400' : 'bg-orange-400'
                    }`}
                    title={record!.liedDownOnTime ? '按时躺好' : '没按时躺好'}
                  />
                  <span
                    className={`inline-block h-1.5 w-1.5 rounded-full ${
                      record!.noCallOut ? 'bg-sky-400' : 'bg-orange-400'
                    }`}
                    title={record!.noCallOut ? '没有喊人' : '喊人了'}
                  />
                </div>
              )}
            </motion.div>
          )
        })}
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs text-white/40">
        <div className="flex items-center gap-1.5">
          <span className="inline-block h-2 w-2 rounded-full bg-emerald-400" />
          <span>按时躺好</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="inline-block h-2 w-2 rounded-full bg-sky-400" />
          <span>没有喊人</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="inline-block h-2 w-2 rounded-full bg-orange-400" />
          <span>未达成</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Star className="h-3 w-3 fill-[#ffd97d] text-[#ffd97d]" />
          <span>连续星星路</span>
        </div>
      </div>
    </div>
  )
}
