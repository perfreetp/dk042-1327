import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Calculator } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ParentLockProps {
  open: boolean
  onClose: () => void
  onSuccess: () => void
}

function generateProblem() {
  const a = 3 + Math.floor(Math.random() * 7)
  const b = 2 + Math.floor(Math.random() * 7)
  const ops = ['+', '-'] as const
  const op = ops[Math.floor(Math.random() * ops.length)]
  let answer: number
  if (op === '+') {
    answer = a + b
  } else {
    answer = a - b
  }
  return { a, b, op, answer }
}

export default function ParentLock({ open, onClose, onSuccess }: ParentLockProps) {
  const [problem, setProblem] = useState(generateProblem)
  const [input, setInput] = useState('')
  const [error, setError] = useState(false)

  useEffect(() => {
    if (open) {
      setProblem(generateProblem())
      setInput('')
      setError(false)
    }
  }, [open])

  const handleSubmit = () => {
    const num = parseInt(input, 10)
    if (num === problem.answer) {
      onSuccess()
      onClose()
    } else {
      setError(true)
      setTimeout(() => {
        setError(false)
        setInput('')
      }, 800)
    }
  }

  const handleClose = () => {
    setInput('')
    setError(false)
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
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
            onClick={handleClose}
          >
            <motion.div
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.85, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 250 }}
              className="relative w-[90%] max-w-sm rounded-3xl bg-slate-900/95 p-6 shadow-2xl backdrop-blur-lg"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={handleClose}
                className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-800 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#ffd97d]/20">
                  <Calculator className="h-5 w-5 text-[#ffd97d]" />
                </div>
                <h2 className="text-xl font-bold text-white">家长验证</h2>
              </div>

              <p className="mb-5 text-sm text-slate-400">
                请回答下面的题目来解锁设置：
              </p>

              <div
                className={cn(
                  'mb-5 rounded-2xl bg-slate-800 py-6 text-center text-3xl font-bold text-white transition-colors',
                  error && 'bg-red-900/40 text-red-300'
                )}
              >
                {problem.a} {problem.op} {problem.b} = ?
              </div>

              <input
                type="number"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSubmit()
                }}
                placeholder="输入答案"
                className={cn(
                  'mb-5 w-full rounded-2xl bg-slate-800 px-5 py-3.5 text-center text-xl text-white outline-none transition-colors placeholder:text-slate-500',
                  'focus:ring-2 focus:ring-[#ffd97d]/50'
                )}
              />

              <button
                onClick={handleSubmit}
                disabled={!input}
                className="min-h-[48px] w-full rounded-2xl bg-[#ffd97d] py-3 text-lg font-bold text-slate-900 transition-all hover:opacity-90 active:opacity-80 disabled:opacity-40"
              >
                确认
              </button>

              <p className="mt-3 text-center text-xs text-slate-500">
                答对一次后，今日内无需重复验证
              </p>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
