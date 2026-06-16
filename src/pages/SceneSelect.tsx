import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Settings, BookOpen, Lock, ShieldCheck } from 'lucide-react'
import { useState, useEffect, useRef } from 'react'
import { useStore } from '@/store/useStore'
import { scenes } from '@/data/scenes'
import StarField from '@/components/StarField'
import ParentSettings from '@/components/ParentSettings'
import StoryGuide from '@/components/StoryGuide'

export default function SceneSelect() {
  const navigate = useNavigate()
  const selectScene = useStore((s) => s.selectScene)
  const settings = useStore((s) => s.settings)
  const getGuideTexts = useStore((s) => s.getGuideTexts)
  const pendingSceneId = useStore((s) => s.pendingSceneId)
  const setPendingSceneId = useStore((s) => s.setPendingSceneId)
  const applyTodayPlan = useStore((s) => s.applyTodayPlan)
  const [showParent, setShowParent] = useState(false)
  const [guideScene, setGuideScene] = useState<string | null>(null)
  const confirmedRef = useRef(!!settings.lastUpdated)

  const hasConfirmed = !!settings.lastUpdated

  useEffect(() => {
    if (!hasConfirmed) {
      setShowParent(true)
    }
  }, [hasConfirmed])

  useEffect(() => {
    if (hasConfirmed && !confirmedRef.current) {
      confirmedRef.current = true
      applyTodayPlan()
    }
  }, [hasConfirmed, applyTodayPlan])

  useEffect(() => {
    if (hasConfirmed && pendingSceneId) {
      const scene = scenes.find((s) => s.id === pendingSceneId)
      if (scene) {
        const id = pendingSceneId
        setPendingSceneId(null)
        selectScene(id)
        setGuideScene(id)
      } else {
        setPendingSceneId(null)
      }
    }
  }, [hasConfirmed, pendingSceneId, setPendingSceneId, selectScene])

  const handleParentClose = () => {
    setShowParent(false)
    if (hasConfirmed && pendingSceneId) {
      const scene = scenes.find((s) => s.id === pendingSceneId)
      if (scene) {
        const id = pendingSceneId
        setPendingSceneId(null)
        selectScene(id)
        setGuideScene(id)
      }
    }
  }

  const handleSceneClick = (sceneId: string) => {
    if (!hasConfirmed) {
      setShowParent(true)
      return
    }
    selectScene(sceneId)
    setGuideScene(sceneId)
  }

  const handleGuideComplete = () => {
    setGuideScene(null)
    navigate(`/player/${guideScene}`)
  }

  const guideSceneData = guideScene ? scenes.find((s) => s.id === guideScene) : null

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-gradient-to-b from-[#0a0a2e] via-[#1a1a3e] to-[#0d0d35]">
      <StarField />

      <button
        onClick={() => setShowParent(true)}
        className="fixed right-6 top-6 z-30 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white/60 backdrop-blur-sm transition-colors hover:bg-white/20 hover:text-[#ffd97d]"
      >
        <Settings className="h-5 w-5" />
      </button>

      <button
        onClick={() => navigate('/stickers')}
        className="fixed left-6 top-6 z-30 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white/60 backdrop-blur-sm transition-colors hover:bg-white/20 hover:text-[#ffd97d]"
      >
        <BookOpen className="h-5 w-5" />
      </button>

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2, ease: 'easeOut' }}
        className="relative z-10 mb-8 text-center"
      >
        <h1 className="mb-3 text-4xl font-bold text-white md:text-5xl" style={{ fontFamily: "'Caveat', cursive" }}>
          今晚去哪里睡觉？
        </h1>
        {hasConfirmed ? (
          <p className="text-lg text-white/50">选一个喜欢的地方，开始今晚的冒险吧</p>
        ) : (
          <div className="flex items-center justify-center gap-2 text-[#ffd97d]">
            <ShieldCheck className="h-5 w-5" />
            <p className="text-lg">请家长先完成设置</p>
          </div>
        )}
      </motion.div>

      <div className="relative z-10 flex flex-col gap-6 px-6 md:flex-row md:gap-8">
        {scenes.map((scene, i) => (
          <motion.button
            key={scene.id}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: hasConfirmed ? 1 : 0.5, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 + i * 0.15, ease: 'easeOut' }}
            whileHover={hasConfirmed ? { y: -8, scale: 1.03 } : {}}
            whileTap={hasConfirmed ? { scale: 0.97 } : {}}
            onClick={() => handleSceneClick(scene.id)}
            disabled={!hasConfirmed}
            className={`group relative flex min-h-[220px] w-[260px] flex-col items-center justify-center rounded-3xl bg-gradient-to-br ${scene.bgGradient} p-6 shadow-2xl transition-all duration-300 ${hasConfirmed ? 'hover:shadow-[0_0_40px_rgba(255,217,125,0.2)] cursor-pointer' : 'cursor-not-allowed'}`}
          >
            <div className="absolute inset-0 rounded-3xl border border-white/10" />
            {!hasConfirmed && (
              <div className="absolute inset-0 z-10 flex items-center justify-center rounded-3xl bg-black/30 backdrop-blur-[2px]">
                <Lock className="h-8 w-8 text-white/50" />
              </div>
            )}
            <span className="mb-4 text-6xl drop-shadow-lg transition-transform duration-300 group-hover:scale-110">
              {scene.icon}
            </span>
            <h2 className="mb-2 text-xl font-bold text-white">{scene.name}</h2>
            <p className="text-sm leading-relaxed text-white/60">{scene.description}</p>
            <div
              className="mt-4 h-1 w-12 rounded-full opacity-0 transition-opacity duration-300 group-hover:opacity-100"
              style={{ backgroundColor: scene.color }}
            />
          </motion.button>
        ))}
      </div>

      {hasConfirmed && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="relative z-10 mt-10 text-sm text-white/30"
        >
          时长 {settings.duration} 分钟 · 音量 {Math.round(settings.maxVolume * 100)}%
        </motion.p>
      )}

      <ParentSettings open={showParent} onClose={handleParentClose} />

      {guideSceneData && (
        <StoryGuide texts={getGuideTexts(guideScene)} onComplete={handleGuideComplete} />
      )}
    </div>
  )
}
