export interface Sticker {
  id: string
  name: string
  emoji: string
}

export const stickers: Sticker[] = [
  { id: 'star', name: '闪闪星', emoji: '⭐' },
  { id: 'moon', name: '弯弯月', emoji: '🌙' },
  { id: 'bear', name: '小熊', emoji: '🧸' },
  { id: 'sheep', name: '绵羊', emoji: '🐑' },
]

export function getSticker(id: string): Sticker | undefined {
  return stickers.find((s) => s.id === id)
}
