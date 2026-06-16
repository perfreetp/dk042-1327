import { motion } from 'framer-motion'
import { useMemo } from 'react'

interface Star {
  id: number
  x: number
  y: number
  size: number
  delay: number
  duration: number
  color: string
}

interface ShootingStar {
  id: number
  startX: number
  startY: number
  angle: number
  delay: number
  duration: number
}

const STAR_COUNT = 70
const SHOOTING_STAR_COUNT = 3

const STAR_COLORS = ['#ffffff', '#fffdf0', '#fff8dc', '#fffff0', '#fefefe']

function generateStars(): Star[] {
  return Array.from({ length: STAR_COUNT }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: 1 + Math.random() * 2,
    delay: Math.random() * 5,
    duration: 2 + Math.random() * 3,
    color: STAR_COLORS[Math.floor(Math.random() * STAR_COLORS.length)],
  }))
}

function generateShootingStars(): ShootingStar[] {
  return Array.from({ length: SHOOTING_STAR_COUNT }, (_, i) => ({
    id: i,
    startX: Math.random() * 80,
    startY: Math.random() * 40,
    angle: 20 + Math.random() * 30,
    delay: 4 + i * 6 + Math.random() * 4,
    duration: 0.6 + Math.random() * 0.4,
  }))
}

export default function StarField() {
  const stars = useMemo(() => generateStars(), [])
  const shootingStars = useMemo(() => generateShootingStars(), [])

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        overflow: 'hidden',
        zIndex: 0,
      }}
    >
      {stars.map((star) => (
        <motion.div
          key={star.id}
          style={{
            position: 'absolute',
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: star.size,
            height: star.size,
            borderRadius: '50%',
            backgroundColor: star.color,
          }}
          animate={{
            opacity: [0.3, 1, 0.3],
          }}
          transition={{
            duration: star.duration,
            delay: star.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}

      {shootingStars.map((star) => (
        <motion.div
          key={`shooting-${star.id}`}
          style={{
            position: 'absolute',
            left: `${star.startX}%`,
            top: `${star.startY}%`,
            width: 60,
            height: 1,
            background: 'linear-gradient(to right, rgba(255,255,255,0), rgba(255,255,255,0.8), rgba(255,255,255,0))',
            borderRadius: 1,
            transform: `rotate(${star.angle}deg)`,
          }}
          animate={{
            x: [0, 300],
            opacity: [0, 1, 1, 0],
          }}
          transition={{
            duration: star.duration,
            delay: star.delay,
            repeat: Infinity,
            repeatDelay: 8 + Math.random() * 6,
            ease: 'easeIn',
          }}
        />
      ))}
    </div>
  )
}
