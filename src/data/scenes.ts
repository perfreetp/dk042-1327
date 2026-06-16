export interface Scene {
  id: string
  name: string
  description: string
  icon: string
  color: string
  bgGradient: string
  sounds: string[]
  guideTexts: string[]
}

export const scenes: Scene[] = [
  {
    id: 'cloud',
    name: '云朵帐篷',
    description: '躺在软绵绵的云朵上，听风轻轻吹过',
    icon: '☁️',
    color: '#c4b5fd',
    bgGradient: 'from-indigo-950 via-purple-900 to-indigo-800',
    sounds: ['wind', 'whisper'],
    guideTexts: [
      '放下小玩具，让小手也休息一下吧',
      '闭上眼睛，听听风的声音',
      '云朵好软好软，慢慢飘呀飘……',
    ],
  },
  {
    id: 'seaside',
    name: '海边贝壳屋',
    description: '住进大海边的贝壳小屋，听浪花讲故事',
    icon: '🐚',
    color: '#7dd3fc',
    bgGradient: 'from-blue-950 via-cyan-900 to-blue-800',
    sounds: ['waves', 'seagull'],
    guideTexts: [
      '小贝壳里藏着大海的秘密',
      '浪花一下一下，像在轻轻拍你',
      '海水好温柔，慢慢闭上眼吧……',
    ],
  },
  {
    id: 'forest',
    name: '森林小木屋',
    description: '躲进森林里的小木屋，听小虫子唱歌',
    icon: '🍄',
    color: '#86efac',
    bgGradient: 'from-emerald-950 via-green-900 to-emerald-800',
    sounds: ['crickets', 'owl'],
    guideTexts: [
      '小木屋好暖和，外面有萤火虫在飞',
      '虫儿们在唱摇篮曲呢',
      '树叶沙沙响，像在跟你说晚安……',
    ],
  },
]

export function getScene(id: string): Scene | undefined {
  return scenes.find((s) => s.id === id)
}
