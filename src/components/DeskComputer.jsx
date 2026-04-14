import { useRef, useEffect, useState } from 'react'
import { motion } from 'framer-motion'

// Monitor SVG at desk coords — rendered as SVG elements + foreignObject canvas
// Monitor base center: (760, 610), screen center: (760, 510)

const MONITOR_X = 760
const MONITOR_Y = 492   // screen center Y
const SCREEN_W = 180
const SCREEN_H = 110

// Pixel art colors for canvas
const C = {
  bg:    '#1a0d1a',
  dark:  '#2a1030',
  pink:  '#f4afc0',
  rose:  '#c47a8a',
  cream: '#ffe8f0',
  dim:   '#6a3a5a',
  green: '#7cc87c',
  cursor:'#f4afc0',
}

// Typing message (awake state)
const TYPING_MSG = 'tama-folio'

function drawIdle(ctx, w, h, tick) {
  ctx.fillStyle = C.bg
  ctx.fillRect(0, 0, w, h)

  // Grid lines (subtle)
  ctx.strokeStyle = C.dark
  ctx.lineWidth = 1
  for (let x = 0; x < w; x += 20) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke()
  }
  for (let y = 0; y < h; y += 20) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke()
  }

  // File icons row
  const icons = [
    { label: 'work', x: 22 },
    { label: 'about', x: 62 },
    { label: 'play', x: 102 },
  ]
  icons.forEach(({ label, x }) => {
    // Icon body
    ctx.fillStyle = C.dim
    ctx.fillRect(x, 30, 22, 26)
    // Folded corner
    ctx.fillStyle = C.dark
    ctx.beginPath()
    ctx.moveTo(x + 16, 30)
    ctx.lineTo(x + 22, 36)
    ctx.lineTo(x + 16, 36)
    ctx.closePath()
    ctx.fill()

    // Label
    ctx.fillStyle = C.rose
    ctx.font = '5px "Press Start 2P", monospace'
    ctx.textAlign = 'center'
    ctx.fillText(label, x + 11, 66)
  })

  // Clock top-right
  const now = new Date()
  const hh = String(now.getHours()).padStart(2, '0')
  const mm = String(now.getMinutes()).padStart(2, '0')
  ctx.fillStyle = C.dim
  ctx.font = '6px "Press Start 2P", monospace'
  ctx.textAlign = 'right'
  ctx.fillText(`${hh}:${mm}`, w - 6, 14)

  // "CHLOE'S DESK" label bottom-center
  ctx.fillStyle = C.rose
  ctx.font = '5px "Press Start 2P", monospace'
  ctx.textAlign = 'center'
  ctx.fillText("CHLOE'S DESK", w / 2, h - 8)

  // Blinking cursor in bottom-left corner
  if (Math.floor(tick / 30) % 2 === 0) {
    ctx.fillStyle = C.cursor
    ctx.fillRect(6, h - 18, 6, 10)
  }
}

function drawAwake(ctx, w, h, charCount) {
  ctx.fillStyle = C.bg
  ctx.fillRect(0, 0, w, h)

  // Terminal prompt line
  ctx.fillStyle = C.green
  ctx.font = '7px "Press Start 2P", monospace'
  ctx.textAlign = 'left'
  ctx.fillText('>', 8, h / 2 - 2)

  const typed = TYPING_MSG.slice(0, charCount)
  ctx.fillStyle = C.cream
  ctx.font = '7px "Press Start 2P", monospace'
  ctx.fillText(typed, 20, h / 2 - 2)

  // Blinking block cursor after typed text
  const tw = ctx.measureText(typed).width
  if (charCount < TYPING_MSG.length || Math.floor(Date.now() / 500) % 2 === 0) {
    ctx.fillStyle = C.cursor
    ctx.fillRect(20 + tw + 2, h / 2 - 12, 6, 10)
  }

  // Scanlines
  ctx.fillStyle = 'rgba(0,0,0,0.12)'
  for (let y = 0; y < h; y += 4) {
    ctx.fillRect(0, y, w, 1)
  }
}

export default function DeskComputer({ awake = false }) {
  const canvasRef = useRef(null)
  const tickRef = useRef(0)
  const rafRef = useRef(null)
  const [charCount, setCharCount] = useState(0)
  const charCountRef = useRef(0)
  const typingRef = useRef(null)

  // Start typing animation when awake
  useEffect(() => {
    if (!awake) {
      setCharCount(0)
      charCountRef.current = 0
      clearInterval(typingRef.current)
      return
    }
    // Small delay then type
    const start = setTimeout(() => {
      typingRef.current = setInterval(() => {
        charCountRef.current += 1
        setCharCount(charCountRef.current)
        if (charCountRef.current >= TYPING_MSG.length) {
          clearInterval(typingRef.current)
        }
      }, 110)
    }, 400)
    return () => {
      clearTimeout(start)
      clearInterval(typingRef.current)
    }
  }, [awake])

  // Canvas render loop
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    // Wait for Press Start 2P font
    document.fonts.ready.then(() => {
      const render = () => {
        const ctx = canvas.getContext('2d')
        if (awake) {
          drawAwake(ctx, SCREEN_W, SCREEN_H, charCountRef.current)
        } else {
          drawIdle(ctx, SCREEN_W, SCREEN_H, tickRef.current)
          tickRef.current += 1
        }
        rafRef.current = requestAnimationFrame(render)
      }
      rafRef.current = requestAnimationFrame(render)
    })

    return () => cancelAnimationFrame(rafRef.current)
  }, [awake])

  return (
    <>
      {/* Monitor stand */}
      <rect
        x={MONITOR_X - 6} y={MONITOR_Y + SCREEN_H / 2 + 18}
        width={12} height={34}
        rx={3}
        fill="#d4b8c8"
      />
      {/* Stand base */}
      <rect
        x={MONITOR_X - 36} y={MONITOR_Y + SCREEN_H / 2 + 50}
        width={72} height={8}
        rx={4}
        fill="#c4a8b8"
      />

      {/* Monitor housing */}
      <rect
        x={MONITOR_X - SCREEN_W / 2 - 12}
        y={MONITOR_Y - SCREEN_H / 2 - 10}
        width={SCREEN_W + 24}
        height={SCREEN_H + 22}
        rx={10}
        fill="#e8d0dc"
        stroke="#c47a8a"
        strokeWidth={2}
      />

      {/* Power LED */}
      <motion.circle
        cx={MONITOR_X + SCREEN_W / 2 + 4}
        cy={MONITOR_Y + SCREEN_H / 2 + 6}
        r={3}
        fill={awake ? '#7cc87c' : '#c47a8a'}
        animate={{ opacity: awake ? [1, 0.5, 1] : 1 }}
        transition={awake ? { duration: 2, repeat: Infinity } : {}}
      />

      {/* Screen bezel */}
      <rect
        x={MONITOR_X - SCREEN_W / 2 - 4}
        y={MONITOR_Y - SCREEN_H / 2 - 3}
        width={SCREEN_W + 8}
        height={SCREEN_H + 8}
        rx={5}
        fill="#2a1030"
      />

      {/* Screen canvas via foreignObject */}
      <foreignObject
        x={MONITOR_X - SCREEN_W / 2}
        y={MONITOR_Y - SCREEN_H / 2}
        width={SCREEN_W}
        height={SCREEN_H}
      >
        <canvas
          ref={canvasRef}
          width={SCREEN_W}
          height={SCREEN_H}
          style={{ display: 'block', imageRendering: 'pixelated' }}
        />
      </foreignObject>

      {/* Screen reflection */}
      <ellipse
        cx={MONITOR_X - SCREEN_W / 2 + 28}
        cy={MONITOR_Y - SCREEN_H / 2 + 16}
        rx={18}
        ry={8}
        fill="rgba(255,255,255,0.15)"
        style={{ pointerEvents: 'none' }}
      />
    </>
  )
}
