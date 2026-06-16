import { motion, AnimatePresence } from 'framer-motion'
import { Settings, X, Volume2, Clock, Music, MessageCircle, Lock, Unlock } from 'lucide-react'
import { useState } from 'react'
import { useStore } from '@/store/useStore'
import { scenes } from '@/data/scenes'
import ParentLock from '@/components/ParentLock'

interface ParentSettingsProps {
  open: boolean
  onClose: () => void
}

type Tab = 'basic' | 'sound' | 'guide'

export default function ParentSettings({ open, onClose }: ParentSettingsProps) {
  const settings = useStore((s) => s.settings)
  const updateSettings = useStore((s) => s.updateSettings)
  const unlockParent = useStore((s) => s.unlockParent)
  const parentUnlocked = useStore((s) => s.parentUnlocked)
  const soundMix = useStore((s) => s.soundMix)
  const setSoundVolume = useStore((s) => s.setSoundVolume)
  const customGuideTexts = useStore((s) => s.customGuideTexts)
  const setGuideTexts = useStore((s) => s.setGuideTexts)

  const [tab, setTab] = useState<Tab>('basic')
  const [showLock, setShowLock] = useState(false)
  const [activeScene, setActiveScene] = useState(scenes[0].id)
  const [guideTextsInput, setGuideTextsInput] = useState(customGuideTexts[activeScene]?.join('\n') || scenes[0].guideTexts.join('\n'))

  const durations = [15, 30, 45, 60]

  const handleOpen = () => {
    if (!parentUnlocked) {
      setShowLock(true)
    }
  }

  const handleUnlockSuccess = () => {
    unlockParent()
  }

  const handleClose = () => {
    onClose()
  }

  const handleSoundVolumeChange = (sceneId: string, soundId: string, volume: number) => {
    setSoundVolume(sceneId, soundId, volume)
  }

  const handleSceneSelect = (sceneId: string) => {
    setActiveScene(sceneId)
    const custom = customGuideTexts[sceneId]
    const scene = scenes.find((s) => s.id === sceneId)
    if (custom && custom.length > 0) {
      setGuideTextsInput(custom.join('\n'))
    } else if (scene) {
      setGuideTextsInput(scene.guideTexts.join('\n'))
    }
  }

  const handleSaveGuideTexts = () => {
    const lines = guideTextsInput.split('\n').filter((l) => l.trim().length > 0)
    setGuideTexts(activeScene, lines)
  }

  const getSoundVolume = (sceneId: string, soundId: string, defaultVolume: number) => {
    const sceneMix = soundMix[sceneId]
    if (sceneMix && sceneMix[soundId] !== undefined) {
      return sceneMix[soundId]
    }
    return defaultVolume
  }

  return (
    <>
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
              onClick={handleClose}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 z-40 flex h-full w-full max-w-md flex-col bg-slate-900/95 shadow-2xl backdrop-blur-lg"
              onClick={(e) => e.stopPropagation()}
            >
              {!parentUnlocked ? (
                <div className="flex flex-1 flex-col items-center justify-center p-8">
                  <Lock className="mb-4 h-12 w-12 text-slate-500" />
                  <h2 className="mb-2 text-xl font-bold text-white">家长设置已锁定</h2>
                  <p className="mb-6 text-center text-sm text-slate-400">
                    请家长回答问题后解锁，防止小朋友不小心改到设置
                  </p>
                  <button
                    onClick={() => setShowLock(true)}
                    className="min-h-[48px] rounded-2xl bg-[#ffd97d] px-8 py-3 text-base font-bold text-slate-900 transition-opacity hover:opacity-90"
                  >
                    家长验证解锁
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
                    <div className="flex items-center gap-3">
                      <Settings className="h-5 w-5 text-[#ffd97d]" />
                      <h2 className="text-lg font-bold text-white">家长设置</h2>
                    </div>
                    <button
                      onClick={handleClose}
                      className="flex h-10 w-10 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-white/10 hover:text-white"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>

                  <div className="flex gap-1 border-b border-white/10 px-4 py-2">
                    {[
                      { id: 'basic', label: '基础', icon: Clock },
                      { id: 'sound', label: '声音', icon: Music },
                      { id: 'guide', label: '引导语', icon: MessageCircle },
                    ].map((t) => (
                      <button
                        key={t.id}
                        onClick={() => setTab(t.id as Tab)}
                        className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2.5 text-sm font-medium transition-colors ${
                          tab === t.id
                            ? 'bg-[#ffd97d]/10 text-[#ffd97d]'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        <t.icon className="h-4 w-4" />
                        {t.label}
                      </button>
                    ))}
                  </div>

                  <div className="flex-1 overflow-y-auto p-6">
                    {tab === 'basic' && (
                      <div className="space-y-6">
                        <div>
                          <label className="mb-3 flex items-center gap-2 text-sm font-medium text-slate-300">
                            <Clock className="h-4 w-4" />
                            播放时长
                          </label>
                          <div className="grid grid-cols-4 gap-2">
                            {durations.map((d) => (
                              <button
                                key={d}
                                onClick={() => updateSettings({ duration: d })}
                                className={`min-h-[48px] rounded-xl text-sm font-semibold transition-colors ${
                                  settings.duration === d
                                    ? 'bg-[#ffd97d] text-slate-900'
                                    : 'bg-white/10 text-white/70 hover:bg-white/20'
                                }`}
                              >
                                {d} 分钟
                              </button>
                            ))}
                          </div>
                        </div>

                        <div>
                          <label className="mb-3 flex items-center gap-2 text-sm font-medium text-slate-300">
                            <Volume2 className="h-4 w-4" />
                            最大音量
                          </label>
                          <div className="flex items-center gap-4">
                            <input
                              type="range"
                              min={0.2}
                              max={1}
                              step={0.05}
                              value={settings.maxVolume}
                              onChange={(e) =>
                                updateSettings({ maxVolume: parseFloat(e.target.value) })
                              }
                              className="flex-1"
                            />
                            <span className="w-16 text-right text-sm text-slate-400">
                              {Math.round(settings.maxVolume * 100)}%
                            </span>
                          </div>
                        </div>

                        <div className="rounded-2xl bg-white/5 p-4">
                          <div className="mb-2 flex items-center gap-2 text-sm text-slate-400">
                            <Unlock className="h-4 w-4" />
                            <span>今日已解锁</span>
                          </div>
                          <p className="text-xs text-slate-500">
                            今日内无需再次验证，明天打开会自动重新锁定
                          </p>
                        </div>
                      </div>
                    )}

                    {tab === 'sound' && (
                      <div className="space-y-6">
                        <p className="text-sm text-slate-400">
                          调整每个场景里不同声音的大小，改完会自动保存，下次还是这个效果
                        </p>
                        {scenes.map((scene) => (
                          <div
                            key={scene.id}
                            className="rounded-2xl bg-white/5 p-4"
                          >
                            <div className="mb-4 flex items-center gap-3">
                              <span className="text-2xl">{scene.icon}</span>
                              <span className="font-semibold text-white">{scene.name}</span>
                            </div>
                            <div className="space-y-3">
                              {scene.sounds.map((sound) => (
                                <div key={sound.id} className="flex items-center gap-3">
                                  <span className="w-14 text-sm text-slate-400">
                                    {sound.name}
                                  </span>
                                  <input
                                    type="range"
                                    min={0}
                                    max={1}
                                    step={0.05}
                                    value={getSoundVolume(scene.id, sound.id, sound.defaultVolume)}
                                    onChange={(e) =>
                                      handleSoundVolumeChange(
                                        scene.id,
                                        sound.id,
                                        parseFloat(e.target.value)
                                      )
                                    }
                                    className="flex-1"
                                  />
                                  <span className="w-12 text-right text-xs text-slate-500">
                                    {Math.round(getSoundVolume(scene.id, sound.id, sound.defaultVolume) * 100)}%
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {tab === 'guide' && (
                      <div className="space-y-4">
                        <p className="text-sm text-slate-400">
                          自定义每个场景的睡前引导语，按行分隔，播放时会轻声出现，不会很频繁
                        </p>
                        <div className="flex gap-2">
                          {scenes.map((scene) => (
                            <button
                              key={scene.id}
                              onClick={() => handleSceneSelect(scene.id)}
                              className={`flex-1 rounded-xl py-2.5 text-sm font-medium transition-colors ${
                                activeScene === scene.id
                                  ? 'bg-[#ffd97d]/10 text-[#ffd97d]'
                                  : 'bg-white/5 text-slate-400 hover:bg-white/10'
                              }`}
                            >
                              {scene.name}
                            </button>
                          ))}
                        </div>
                        <div className="rounded-2xl bg-white/5 p-4">
                          <label className="mb-2 block text-sm font-medium text-slate-300">
                            引导语（每行一句）
                          </label>
                          <textarea
                            value={guideTextsInput}
                            onChange={(e) => setGuideTextsInput(e.target.value)}
                            rows={5}
                            className="w-full resize-none rounded-xl bg-slate-800 p-3 text-sm text-white placeholder:text-slate-500 outline-none focus:ring-2 focus:ring-[#ffd97d]/30"
                            placeholder="每行写一句温柔的话..."
                          />
                          <button
                            onClick={handleSaveGuideTexts}
                            className="mt-3 min-h-[44px] w-full rounded-xl bg-[#ffd97d] py-2.5 text-sm font-bold text-slate-900 transition-opacity hover:opacity-90"
                          >
                            保存引导语
                          </button>
                        </div>
                        <div className="rounded-2xl bg-white/5 p-4">
                          <p className="text-xs text-slate-500">
                            💡 小贴士：引导语会每隔 45 秒左右轻声出现一句，
                            建议写 3-5 句就好，内容要简短柔和，不要太刺激孩子的注意力
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {tab === 'basic' && parentUnlocked && (
                    <div className="border-t border-white/10 p-6">
                      <button
                        onClick={handleClose}
                        className="min-h-[52px] w-full rounded-2xl bg-[#ffd97d] text-lg font-bold text-slate-900 transition-opacity hover:opacity-90"
                      >
                        完成，去选场景 ✨
                      </button>
                    </div>
                  )}
                </>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <ParentLock
        open={showLock}
        onClose={() => setShowLock(false)}
        onSuccess={handleUnlockSuccess}
      />
    </>
  )
}
