import { motion } from 'framer-motion'
import { Star, ChevronLeft, ChevronRight } from 'lucide-react'
import { useState } from 'react'
import type { NightRecord } from '@/data/storage'
import { getMonthDays, isCurrentMonth, getToday, getConsecutiveStreakDays } from '@/data/storage'
import { scenes } from '@/data/scenes'
import { getSticker } from '@/data/stickers'

interface MonthCalendarProps {
  records: NightRecord[]
}

export default function MonthCalendar({ records }: MonthCalendarProps) {
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth())

  const today = getToday()
  const days = getMonthDays(year, month)
  const streakDays = getConsecutiveStreakDays(records, today)
  const streakSet = new Set(streakDays)

  const monthName = new Date(year, month).toLocaleDateString('zh-CN', { year: 'numeric', month: 'long' })

  const prevMonth = () => {
    if (month === 0) {
      setYear(year - 1)
      setMonth(11)
    } else {
      setMonth(month - 1)
    }
  }

  const nextMonth = () => {
    if (month === 11) {
      setYear(year + 1)
      setMonth(0)
    } else {
      setMonth(month + 1)
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
                <Star className="absolute right-1 top-1 h-3 w-3 fill-[#ffd97d] text-[#ffd97d]" />
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
              {isComplete && (
                <div className="absolute bottom-1 h-1 w-1 rounded-full bg-[#ffd97d]" />
              )}
            </motion.div>
          )
        })}
      </div>

      <div className="mt-4 flex items-center justify-center gap-4 text-xs text-white/40">
        <div className="flex items-center gap-1.5">
          <div className="h-2 w-2 rounded-full bg-[#ffd97d]" />
          <span>完成</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Star className="h-3 w-3 fill-[#ffd97d] text-[#ffd97d]" />
          <span>连续星星路</span>
        </div>
      </div>
    </div>
  )
}
