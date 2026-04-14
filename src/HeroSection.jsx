import { useRef, useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import PixelCat from './components/PixelCat'
import DeskComputer from './components/DeskComputer'
import MiniTamagotchi from './components/MiniTamagotchi'
import HeroText from './components/HeroText'
import { SoundContext } from './hooks/useSound'

// ------------------------------------------------------------------
// Stable pseudo-random building data (seeded to avoid re-render churn)
// ------------------------------------------------------------------
const BUILDINGS = Array.from({ length: 14 }, (_, i) => {
  const seed = (i * 2654435761) >>> 0
  const w = 60 + (seed % 60)
  const h = 80 + ((seed >> 4) % 180)
  const x = i * 98 + ((seed >> 8) % 30) - 15
  return { x, w, h }
})

const WINDOW_LIGHTS = BUILDINGS.flatMap(({ x, w, h }, bi) =>
  Array.from({ length: 6 }, (_, wi) => {
    const seed = (bi * 37 + wi * 131 + 99) * 2654435761 >>> 0
    const wx = x + 8 + (seed % (w - 16))
    const wy = 780 - h + 10 + ((seed >> 6) % (h - 20))
    const lit = (seed >> 12) % 3 !== 0
    return lit ? { wx, wy } : null
  }).filter(Boolean)
)

const STARS = Array.from({ length: 60 }, (_, i) => {
  const seed = (i * 1664525 + 1013904223) >>> 0
  return {
    cx: (seed % 1440),
    cy: 20 + ((seed >> 10) % 340),
    r: 0.8 + ((seed >> 20) % 3) * 0.5,
    twinkleDelay: ((seed >> 15) % 40) * 0.1,
  }
})

// ------------------------------------------------------------------
// MiniTamagotchi foreignObject wrapper (positions it in SVG space)
// ------------------------------------------------------------------
const TAMA_SVG_X = 920
const TAMA_SVG_Y = 480
const TAMA_W = 140
const TAMA_H = 195

// ------------------------------------------------------------------
// Desk lamp glow
// ------------------------------------------------------------------
function LampGlow({ on }) {
  return (
    <motion.ellipse
      cx={580} cy={480}
      rx={160} ry={100}
      fill="url(#lampGradient)"
      animate={{ opacity: on ? 0.55 : 0 }}
      transition={{ duration: 1.2 }}
      style={{ pointerEvents: 'none' }}
    />
  )
}

// ------------------------------------------------------------------
// Main component
// ------------------------------------------------------------------
export default function HeroSection({ isVisible, sound = true }) {
  const svgRef = useRef(null)
  const reduceMotion = useReducedMotion()

  // Cross-reaction state
  const [catReacting, setCatReacting] = useState(false)
  const [tamaReacting, setTamaReacting] = useState(false)
  const catTimerRef = useRef(null)
  const tamaTimerRef = useRef(null)

  // Computer awake when hovered nearby
  const [computerAwake, setComputerAwake] = useState(false)
  const [lampOn, setLampOn] = useState(true)

  // Scroll-down indicator visibility
  const sectionRef = useRef(null)
  const [showScrollHint, setShowScrollHint] = useState(true)

  useEffect(() => {
    const el = sectionRef.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => setShowScrollHint(entry.isIntersecting),
      { threshold: 0.6 }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  // Cross-reaction handlers
  const handleReact = useCallback((source) => {
    if (source === 'cat') {
      clearTimeout(tamaTimerRef.current)
      setTamaReacting(true)
      tamaTimerRef.current = setTimeout(() => setTamaReacting(false), 900)
    } else if (source === 'tama') {
      clearTimeout(catTimerRef.current)
      setCatReacting(true)
      catTimerRef.current = setTimeout(() => setCatReacting(false), 900)
    }
  }, [])

  useEffect(() => () => {
    clearTimeout(catTimerRef.current)
    clearTimeout(tamaTimerRef.current)
  }, [])

  return (
    <SoundContext.Provider value={sound}>
      <div
        ref={sectionRef}
        style={{
          position: 'relative',
          width: '100%',
          height: '100vh',
          overflow: 'hidden',
          background: '#1a0d2e',
        }}
      >
        {/* ---- Main SVG scene ---- */}
        <svg
          ref={svgRef}
          viewBox="0 0 1440 900"
          preserveAspectRatio="xMidYMid slice"
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
          aria-hidden="true"
        >
          <defs>
            {/* Sky gradient */}
            <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0d0620" />
              <stop offset="60%" stopColor="#1a0d2e" />
              <stop offset="100%" stopColor="#2a1040" />
            </linearGradient>

            {/* Desk surface gradient */}
            <linearGradient id="deskGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3d2235" />
              <stop offset="100%" stopColor="#2a1525" />
            </linearGradient>

            {/* Lamp glow gradient */}
            <radialGradient id="lampGradient" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#ffe8a0" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#ffe8a0" stopOpacity="0" />
            </radialGradient>

            {/* Building gradient */}
            <linearGradient id="buildingGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2a1535" />
              <stop offset="100%" stopColor="#1a0d28" />
            </linearGradient>
          </defs>

          {/* Sky */}
          <rect width={1440} height={900} fill="url(#skyGrad)" />

          {/* Stars */}
          {!reduceMotion && STARS.map((s, i) => (
            <motion.circle
              key={i}
              cx={s.cx} cy={s.cy} r={s.r}
              fill="#fdf0f0"
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{
                duration: 2.5 + s.r,
                repeat: Infinity,
                delay: s.twinkleDelay,
                ease: 'easeInOut',
              }}
            />
          ))}
          {reduceMotion && STARS.map((s, i) => (
            <circle key={i} cx={s.cx} cy={s.cy} r={s.r} fill="#fdf0f0" opacity={0.6} />
          ))}

          {/* City skyline — buildings */}
          {BUILDINGS.map((b, i) => (
            <rect
              key={i}
              x={b.x} y={780 - b.h}
              width={b.w} height={b.h}
              fill="url(#buildingGrad)"
            />
          ))}

          {/* Window lights */}
          {WINDOW_LIGHTS.map((wl, i) => (
            <rect
              key={i}
              x={wl.wx} y={wl.wy}
              width={5} height={4}
              fill="#ffe8a0"
              opacity={0.6 + (i % 3) * 0.13}
            />
          ))}

          {/* Window frame — the desk is inside a room; show window edge */}
          {/* Left curtain */}
          <rect x={0} y={380} width={90} height={400} fill="#3a1a30" />
          <rect x={0} y={380} width={90} height={400} fill="rgba(100,40,80,0.3)" />
          {/* Right curtain */}
          <rect x={1350} y={380} width={90} height={400} fill="#3a1a30" />
          <rect x={1350} y={380} width={90} height={400} fill="rgba(100,40,80,0.3)" />
          {/* Window sill */}
          <rect x={0} y={774} width={1440} height={12} fill="#2a1525" />

          {/* Desk surface */}
          <rect x={0} y={674} width={1440} height={130} fill="url(#deskGrad)" />
          {/* Desk front edge highlight */}
          <rect x={0} y={674} width={1440} height={3} fill="#5a3050" opacity={0.6} />

          {/* Desk mat */}
          <rect x={480} y={638} width={560} height={42} rx={4} fill="#4a2040" opacity={0.7} />
          {/* Mat border */}
          <rect x={480} y={638} width={560} height={42} rx={4} fill="none" stroke="#6a3858" strokeWidth={1} />

          {/* Desk lamp (left of monitor) */}
          <g>
            {/* Base */}
            <rect x={528} y={654} width={24} height={22} rx={3} fill="#c4a8b8" />
            {/* Arm */}
            <line x1={540} y1={654} x2={520} y2={590} stroke="#b89ab0" strokeWidth={5} strokeLinecap="round" />
            <line x1={520} y1={590} x2={548} y2={540} stroke="#b89ab0" strokeWidth={5} strokeLinecap="round" />
            {/* Lampshade */}
            <path d="M 524 540 L 572 540 L 560 560 L 536 560 Z" fill="#e8d0dc" />
            <path d="M 524 540 L 572 540 L 560 560 L 536 560 Z" fill="none" stroke="#c47a8a" strokeWidth={1.5} />
            {/* Bulb */}
            <circle cx={548} cy={552} r={5} fill={lampOn ? '#fffacc' : '#c4a8b8'} />
          </g>

          {/* Lamp glow composite */}
          <LampGlow on={lampOn} />

          {/* Desk items — small potted plant right side */}
          <g transform="translate(1200, 640)">
            {/* Pot */}
            <path d="M -16 34 L -12 0 L 12 0 L 16 34 Z" fill="#c47a8a" />
            <rect x={-18} y={-4} width={36} height={8} rx={3} fill="#d4889a" />
            {/* Soil */}
            <ellipse cx={0} cy={-4} rx={14} ry={5} fill="#5a3040" />
            {/* Stems */}
            <line x1={0} y1={-4} x2={-10} y2={-30} stroke="#7cc87c" strokeWidth={2.5} strokeLinecap="round" />
            <line x1={0} y1={-4} x2={4} y2={-38} stroke="#7cc87c" strokeWidth={2.5} strokeLinecap="round" />
            <line x1={0} y1={-4} x2={14} y2={-24} stroke="#7cc87c" strokeWidth={2.5} strokeLinecap="round" />
            {/* Leaves */}
            <ellipse cx={-10} cy={-32} rx={8} ry={5} fill="#7cc87c" transform="rotate(-20, -10, -32)" />
            <ellipse cx={4} cy={-42} rx={8} ry={5} fill="#8ad48a" transform="rotate(10, 4, -42)" />
            <ellipse cx={16} cy={-26} rx={7} ry={4} fill="#7cc87c" transform="rotate(30, 16, -26)" />
          </g>

          {/* Small book stack */}
          <g transform="translate(370, 660)">
            <rect x={0} y={0} width={44} height={12} rx={2} fill="#9a5878" />
            <rect x={4} y={-10} width={38} height={10} rx={2} fill="#c47a8a" />
            <rect x={2} y={-18} width={40} height={8} rx={2} fill="#e8b4c0" />
            {/* Spine lines */}
            <line x1={2} y1={-18} x2={2} y2={12} stroke="#8a4060" strokeWidth={1} />
            <line x1={6} y1={-10} x2={6} y2={12} stroke="#b06878" strokeWidth={1} />
          </g>

          {/* Coffee mug */}
          <g transform="translate(660, 652)">
            <rect x={0} y={0} width={26} height={24} rx={4} fill="#fdf6f0" stroke="#c47a8a" strokeWidth={1.5} />
            {/* Handle */}
            <path d="M 26 6 Q 38 6 38 14 Q 38 22 26 22" fill="none" stroke="#c47a8a" strokeWidth={2.5} strokeLinecap="round" />
            {/* Steam */}
            {!reduceMotion && (
              <>
                <motion.path
                  d="M 8 0 Q 6 -6 8 -12"
                  fill="none" stroke="#e8d0dc" strokeWidth={1.5} strokeLinecap="round"
                  animate={{ opacity: [0, 0.6, 0], y: [0, -4, -8] }}
                  transition={{ duration: 1.8, repeat: Infinity, delay: 0 }}
                />
                <motion.path
                  d="M 16 0 Q 14 -8 16 -14"
                  fill="none" stroke="#e8d0dc" strokeWidth={1.5} strokeLinecap="round"
                  animate={{ opacity: [0, 0.6, 0], y: [0, -4, -8] }}
                  transition={{ duration: 1.8, repeat: Infinity, delay: 0.6 }}
                />
              </>
            )}
            {/* Heart on mug */}
            <text x={5} y={17} fontSize={10} fill="#f4afc0">♥</text>
          </g>

          {/* DeskComputer (monitor + stand + screen canvas) */}
          <DeskComputer awake={computerAwake} />

          {/* Desk hover zone — wakes computer */}
          <rect
            x={600} y={460} width={320} height={220}
            fill="transparent"
            style={{ cursor: 'default' }}
            onMouseEnter={() => setComputerAwake(true)}
            onMouseLeave={() => setComputerAwake(false)}
          />

          {/* MiniTamagotchi via foreignObject */}
          <foreignObject
            x={TAMA_SVG_X}
            y={TAMA_SVG_Y}
            width={TAMA_W}
            height={TAMA_H}
            style={{ overflow: 'visible' }}
          >
            <MiniTamagotchi
              onReact={handleReact}
              tamaReacting={tamaReacting}
              sound={sound}
            />
          </foreignObject>

          {/* PixelCat */}
          <PixelCat
            svgRef={svgRef}
            onReact={handleReact}
            friendsReacted={catReacting}
            sound={sound}
          />

          {/* Floor shadow under cat */}
          <ellipse cx={1120} cy={648} rx={58} ry={10} fill="rgba(0,0,0,0.18)" />
        </svg>

        {/* ---- Hero text overlay (HTML, centered top-area) ---- */}
        <div
          style={{
            position: 'absolute',
            top: '13%',
            left: 0,
            right: 0,
            display: 'flex',
            justifyContent: 'center',
            pointerEvents: 'none',
          }}
        >
          <HeroText isVisible={isVisible} />
        </div>

        {/* ---- Lamp toggle (HTML button) ---- */}
        <button
          onClick={() => setLampOn(v => !v)}
          title={lampOn ? 'Turn lamp off' : 'Turn lamp on'}
          aria-label={lampOn ? 'Turn lamp off' : 'Turn lamp on'}
          style={{
            position: 'absolute',
            bottom: 72,
            left: '37%',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontFamily: '"Press Start 2P", monospace',
            fontSize: 7,
            color: lampOn ? '#ffe8a0' : '#6a3858',
            padding: '4px 8px',
            opacity: 0.7,
            transition: 'color 0.4s',
          }}
        >
          {lampOn ? '☀' : '☽'}
        </button>

        {/* ---- Scroll hint ---- */}
        <AnimatePresence>
          {showScrollHint && (
            <motion.div
              key="scroll-hint"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: [0, 6, 0] }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
              style={{
                position: 'absolute',
                bottom: 24,
                left: '50%',
                transform: 'translateX(-50%)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 4,
                pointerEvents: 'none',
              }}
            >
              <span style={{
                fontFamily: '"Press Start 2P", monospace',
                fontSize: 6,
                color: '#c47a8a',
                letterSpacing: '0.1em',
                opacity: 0.7,
              }}>
                SCROLL
              </span>
              <svg width={12} height={8} viewBox="0 0 12 8" fill="none">
                <path d="M1 1L6 7L11 1" stroke="#c47a8a" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </SoundContext.Provider>
  )
}
