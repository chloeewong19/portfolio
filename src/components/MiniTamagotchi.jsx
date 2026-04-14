import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { playBeep } from '../hooks/useSound'

// 8×8 mini frames at 3× scale → 24×24px canvas
const MINI_FRAMES = {
  sleep: [
    ['.....ZZ.', '....ZZ..', '..OOOO..', '.OBBBBO.', '.OBOOBO.', '.OBBBBO.', '.OBBBBO.', '..OOOO..'],
  ],
  idle: [
    ['........', '..OOOO..', '.OBBBBO.', '.OBEEBO.', '.OBEXBO.', '.OBBPBO.', '.OBBBBO.', '..OOOO..'],
    ['........', '........', '..OOOO..', '.OBBBBO.', '.OBEEBO.', '.OBEXPО.', '.OBBBBO.', '..OOOO..'],
  ],
  happy: [
    ['........', '..OOOO..', '.OBBBBO.', '.OBOOBO.', '.OBBBBO.', '.OBBPBO.', '.OBBBBO.', '..OOOO..'],
    ['........', '........', '..OOOO..', '.OBBBBO.', '.OBOOBO.', '.OBBBBO.', '.OBBPBO.', '..OOOO..'],
  ],
}

const MINI_COLORS = {
  '.': '#ffe8f0',
  'B': '#8b3a52',
  'O': '#5a1a2a',
  'E': '#fff0f5',
  'X': '#5a1a2a',
  'P': '#f4afc0',
  'Z': '#c47a8a',
}

function drawMiniFrame(ctx, frame) {
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const ch = frame[r]?.[c] ?? '.'
      ctx.fillStyle = MINI_COLORS[ch] ?? '#ffe8f0'
      ctx.fillRect(c * 3, r * 3, 3, 3)
    }
  }
}

// Pre-generate sparkle angles
const SPARKLE_ANGLES = [0, 1.05, 2.09, 3.14, 4.19, 5.24]

export default function MiniTamagotchi({ onReact, tamaReacting, sound = true }) {
  const canvasRef = useRef(null)
  const [animState, setAnimState] = useState('sleep')
  const [hovering, setHovering] = useState(false)
  const [sparkleKey, setSparkleKey] = useState(0)
  const [showSparkles, setShowSparkles] = useState(false)
  const frameIdxRef = useRef(0)
  const intervalRef = useRef(null)

  const runAnim = useCallback((state) => {
    clearInterval(intervalRef.current)
    frameIdxRef.current = 0
    const frames = MINI_FRAMES[state] ?? MINI_FRAMES.idle
    const ms = state === 'happy' ? 250 : state === 'sleep' ? 900 : 600

    const redraw = () => {
      const canvas = canvasRef.current
      if (!canvas) return
      const ctx = canvas.getContext('2d')
      ctx.clearRect(0, 0, 24, 24)
      drawMiniFrame(ctx, frames[frameIdxRef.current])
    }

    redraw()
    if (frames.length > 1) {
      intervalRef.current = setInterval(() => {
        frameIdxRef.current = (frameIdxRef.current + 1) % frames.length
        redraw()
      }, ms)
    }
  }, [])

  useEffect(() => {
    runAnim(animState)
    return () => clearInterval(intervalRef.current)
  }, [animState, runAnim])

  // Cross-reaction: friend (cat) clicked → brief happy flash
  useEffect(() => {
    if (!tamaReacting) return
    setAnimState('happy')
    const t = setTimeout(() => setAnimState(hovering ? 'happy' : 'sleep'), 800)
    return () => clearTimeout(t)
  }, [tamaReacting, hovering])

  const handleHoverEnter = () => {
    setHovering(true)
    setAnimState('happy')
  }

  const handleHoverLeave = () => {
    setHovering(false)
    setAnimState('sleep')
  }

  const handleClick = (e) => {
    e.stopPropagation()
    setShowSparkles(true)
    setSparkleKey(k => k + 1)
    setTimeout(() => setShowSparkles(false), 700)
    if (sound) {
      playBeep(523, 0.1)
      setTimeout(() => playBeep(784, 0.12), 120)
      setTimeout(() => playBeep(1046, 0.15), 240)
    }
    onReact?.('tama')
  }

  return (
    <div style={{ position: 'relative', width: 140, height: 195 }}>
      {/* Speech bubble */}
      <AnimatePresence>
        {hovering && (
          <motion.div
            key="bubble"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 20 }}
            style={{
              position: 'absolute',
              top: -38,
              left: '50%',
              translateX: '-50%',
              background: '#fff0f5',
              border: '2px solid #c47a8a',
              borderRadius: 6,
              padding: '4px 8px',
              fontFamily: '"Press Start 2P", monospace',
              fontSize: 5,
              color: '#8b3a52',
              whiteSpace: 'nowrap',
              pointerEvents: 'none',
              zIndex: 10,
            }}
          >
            HI AGAIN!
            {/* bubble tail */}
            <div style={{
              position: 'absolute',
              bottom: -7,
              left: '50%',
              translateX: '-50%',
              width: 0,
              height: 0,
              borderLeft: '5px solid transparent',
              borderRight: '5px solid transparent',
              borderTop: '7px solid #c47a8a',
            }} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Device shell with hover wiggle */}
      <motion.div
        animate={{ rotate: hovering ? [-8, -12, -5, -8] : -8 }}
        transition={{ duration: hovering ? 0.3 : 0 }}
        style={{ transformOrigin: 'center 90%', cursor: 'pointer' }}
        onMouseEnter={handleHoverEnter}
        onMouseLeave={handleHoverLeave}
        onClick={handleClick}
      >
        <div style={{
          width: 140,
          height: 190,
          borderRadius: '50% 50% 45% 45% / 40% 40% 48% 48%',
          background: '#fdf6f0',
          border: '3px solid #c47a8a',
          boxShadow: '0 0 0 1px #fdf0f0, 0 0 0 3px #c47a8a, 4px 6px 0 1px #e8b4c0, inset 0 2px 6px rgba(180,80,100,0.07)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          paddingTop: 18,
          gap: 10,
          position: 'relative',
        }}>
          {/* Keychain hole */}
          <div style={{
            position: 'absolute', top: -10, left: '50%', translateX: '-50%',
            width: 14, height: 14, borderRadius: '50%',
            border: '3px solid #c47a8a', background: '#fdf0f0',
          }} />

          {/* Screen bezel */}
          <div style={{
            width: '78%',
            background: '#b06878',
            borderRadius: 10,
            padding: 4,
            boxShadow: 'inset 0 2px 6px rgba(100,30,50,0.3)',
            position: 'relative',
          }}>
            {/* Screen LCD */}
            <div style={{
              background: '#ffe8f0',
              borderRadius: 7,
              overflow: 'hidden',
              padding: '6px 10px',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              minHeight: 50,
              position: 'relative',
            }}>
              <canvas
                ref={canvasRef}
                width={24}
                height={24}
                style={{ imageRendering: 'pixelated', display: 'block' }}
              />
              {/* Scanlines */}
              <div style={{
                position: 'absolute', inset: 0, pointerEvents: 'none',
                background: 'repeating-linear-gradient(to bottom, transparent 0px, transparent 2px, rgba(180,80,120,0.04) 2px, rgba(180,80,120,0.04) 3px)',
              }} />
              {/* Screen reflection */}
              <div style={{
                position: 'absolute', top: 4, left: 6,
                width: 18, height: 9, borderRadius: '50%',
                background: 'rgba(255,255,255,0.28)',
                pointerEvents: 'none',
              }} />
            </div>
          </div>

          {/* Buttons row */}
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            {[
              { bg: '#f4afc0', shadow: '#9a4060', size: 14 },
              { bg: '#f9d4de', shadow: '#b07090', size: 18 },
              { bg: '#e8c8d8', shadow: '#9a6080', size: 14 },
            ].map(({ bg, shadow, size }, i) => (
              <div
                key={i}
                style={{
                  width: size, height: size, borderRadius: '50%',
                  background: bg,
                  border: '2px solid #b06878',
                  boxShadow: `0 2px 0 ${shadow}`,
                }}
              />
            ))}
          </div>
        </div>
      </motion.div>

      {/* Click sparkles */}
      <AnimatePresence>
        {showSparkles && SPARKLE_ANGLES.map((angle, i) => (
          <motion.div
            key={`${sparkleKey}-${i}`}
            initial={{ x: 70, y: 95, opacity: 1, scale: 1 }}
            animate={{
              x: 70 + Math.cos(angle) * (44 + i * 8),
              y: 95 + Math.sin(angle) * (44 + i * 8),
              opacity: 0,
              scale: 0,
            }}
            transition={{ duration: 0.55, ease: 'easeOut', delay: i * 0.03 }}
            style={{
              position: 'absolute',
              width: 5, height: 5,
              background: i % 2 === 0 ? '#f4afc0' : '#c47a8a',
              borderRadius: 0,
              pointerEvents: 'none',
            }}
          />
        ))}
      </AnimatePresence>
    </div>
  )
}
