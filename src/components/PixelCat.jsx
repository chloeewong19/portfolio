import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { playBeep } from '../hooks/useSound'

// Cat positioned around SVG coord center: x=1120, y=580
const CAT_CX = 1120
const CAT_CY = 578

export default function PixelCat({ svgRef, onReact, friendsReacted, sound = true }) {
  const reduceMotion = useReducedMotion()
  const [blinking, setBlinking] = useState(false)
  const [meowing, setMeowing] = useState(false)
  const [earsPerked, setEarsPerked] = useState(false)
  const [pupilOffset, setPupilOffset] = useState({ x: 0, y: 0 })
  const blinkTimerRef = useRef(null)
  const meowTimerRef = useRef(null)

  // Schedule random blinks
  const scheduleBlink = useCallback(() => {
    const delay = 3000 + Math.random() * 2000
    blinkTimerRef.current = setTimeout(() => {
      setBlinking(true)
      setTimeout(() => {
        setBlinking(false)
        scheduleBlink()
      }, 140)
    }, delay)
  }, [])

  useEffect(() => {
    scheduleBlink()
    return () => {
      clearTimeout(blinkTimerRef.current)
      clearTimeout(meowTimerRef.current)
    }
  }, [scheduleBlink])

  // Ear perk when friend (tama) reacts
  useEffect(() => {
    if (!friendsReacted) return
    setEarsPerked(true)
    const t = setTimeout(() => setEarsPerked(false), 900)
    return () => clearTimeout(t)
  }, [friendsReacted])

  // Pupil tracking via mouse move on SVG
  const handleMouseMove = useCallback((e) => {
    const svg = svgRef?.current
    if (!svg) return
    try {
      const pt = svg.createSVGPoint()
      pt.x = e.clientX
      pt.y = e.clientY
      const svgP = pt.matrixTransform(svg.getScreenCTM().inverse())
      const dx = svgP.x - CAT_CX
      const dy = svgP.y - (CAT_CY - 28) // face center
      const dist = Math.sqrt(dx * dx + dy * dy)
      const maxShift = 2.8
      const scale = dist > 1 ? Math.min(maxShift / dist, 1) * maxShift : 0
      setPupilOffset({ x: dx * scale / dist || 0, y: dy * scale / dist || 0 })
    } catch (_) { /* SVG not mounted yet */ }
  }, [svgRef])

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [handleMouseMove])

  const handleClick = () => {
    setMeowing(true)
    if (sound) playBeep(880, 0.15, 'sine')
    onReact?.('cat')
    clearTimeout(meowTimerRef.current)
    meowTimerRef.current = setTimeout(() => setMeowing(false), 1200)
  }

  // Ear polygon points (left and right)
  const leftEarOuter = `${CAT_CX - 36},${CAT_CY - 54} ${CAT_CX - 50},${CAT_CY - 88} ${CAT_CX - 16},${CAT_CY - 80}`
  const leftEarInner = `${CAT_CX - 34},${CAT_CY - 57} ${CAT_CX - 46},${CAT_CY - 82} ${CAT_CX - 20},${CAT_CY - 76}`
  const rightEarOuter = `${CAT_CX + 36},${CAT_CY - 54} ${CAT_CX + 50},${CAT_CY - 88} ${CAT_CX + 16},${CAT_CY - 80}`
  const rightEarInner = `${CAT_CX + 34},${CAT_CY - 57} ${CAT_CX + 46},${CAT_CY - 82} ${CAT_CX + 20},${CAT_CY - 76}`

  // Eye positions
  const leftEye = { cx: CAT_CX - 16, cy: CAT_CY - 28 }
  const rightEye = { cx: CAT_CX + 16, cy: CAT_CY - 28 }

  const tailVariants = {
    sway: {
      rotate: [-6, 6, -6],
      transition: { duration: 2.6, repeat: Infinity, ease: 'easeInOut' },
    },
    still: { rotate: -3 },
  }

  const earVariants = {
    perked: { scaleY: 1.18, transition: { type: 'spring', stiffness: 500, damping: 12 } },
    normal: { scaleY: 1, transition: { type: 'spring', stiffness: 300, damping: 20 } },
  }

  return (
    <g onClick={handleClick} style={{ cursor: 'pointer' }}>
      {/* Tail */}
      <motion.g
        variants={tailVariants}
        animate={reduceMotion ? 'still' : 'sway'}
        style={{ transformOrigin: `${CAT_CX}px ${CAT_CY + 44}px` }}
      >
        <path
          d={`M ${CAT_CX + 42} ${CAT_CY + 44} Q ${CAT_CX + 90} ${CAT_CY + 20} ${CAT_CX + 80} ${CAT_CY - 10}`}
          fill="none"
          stroke="#f0c8a0"
          strokeWidth={14}
          strokeLinecap="round"
        />
        {/* Tail tip */}
        <circle cx={CAT_CX + 80} cy={CAT_CY - 10} r={9} fill="#e8b890" />
      </motion.g>

      {/* Body */}
      <ellipse cx={CAT_CX} cy={CAT_CY + 22} rx={52} ry={46} fill="#f0c8a0" />
      {/* Belly patch */}
      <ellipse cx={CAT_CX} cy={CAT_CY + 28} rx={28} ry={30} fill="#fce8d8" />

      {/* Ears */}
      <motion.g
        variants={earVariants}
        animate={earsPerked ? 'perked' : 'normal'}
        style={{ transformOrigin: `${CAT_CX}px ${CAT_CY - 60}px` }}
      >
        <polygon points={leftEarOuter} fill="#f0c8a0" />
        <polygon points={leftEarInner} fill="#f4a0b0" />
        <polygon points={rightEarOuter} fill="#f0c8a0" />
        <polygon points={rightEarInner} fill="#f4a0b0" />
      </motion.g>

      {/* Head */}
      <circle cx={CAT_CX} cy={CAT_CY - 28} r={44} fill="#f0c8a0" />

      {/* Eyes */}
      {/* Left eye */}
      <g>
        <ellipse cx={leftEye.cx} cy={leftEye.cy} rx={10} ry={blinking ? 2 : 10} fill="white" />
        {!blinking && (
          <>
            <ellipse
              cx={leftEye.cx}
              cy={leftEye.cy}
              rx={7}
              ry={7}
              fill="#7cc87c"
            />
            <circle
              cx={leftEye.cx + pupilOffset.x}
              cy={leftEye.cy + pupilOffset.y}
              r={4}
              fill="#2a1a0a"
            />
            {/* Eye shine */}
            <circle cx={leftEye.cx - 2} cy={leftEye.cy - 3} r={1.5} fill="white" />
          </>
        )}
      </g>
      {/* Right eye */}
      <g>
        <ellipse cx={rightEye.cx} cy={rightEye.cy} rx={10} ry={blinking ? 2 : 10} fill="white" />
        {!blinking && (
          <>
            <ellipse
              cx={rightEye.cx}
              cy={rightEye.cy}
              rx={7}
              ry={7}
              fill="#7cc87c"
            />
            <circle
              cx={rightEye.cx + pupilOffset.x}
              cy={rightEye.cy + pupilOffset.y}
              r={4}
              fill="#2a1a0a"
            />
            <circle cx={rightEye.cx - 2} cy={rightEye.cy - 3} r={1.5} fill="white" />
          </>
        )}
      </g>

      {/* Nose */}
      <polygon
        points={`${CAT_CX},${CAT_CY - 10} ${CAT_CX - 5},${CAT_CY - 4} ${CAT_CX + 5},${CAT_CY - 4}`}
        fill="#d4788a"
      />
      {/* Mouth */}
      <path
        d={`M ${CAT_CX} ${CAT_CY - 4} Q ${CAT_CX - 10} ${CAT_CY + 4} ${CAT_CX - 14} ${CAT_CY + 2}`}
        fill="none"
        stroke="#d4788a"
        strokeWidth={1.8}
        strokeLinecap="round"
      />
      <path
        d={`M ${CAT_CX} ${CAT_CY - 4} Q ${CAT_CX + 10} ${CAT_CY + 4} ${CAT_CX + 14} ${CAT_CY + 2}`}
        fill="none"
        stroke="#d4788a"
        strokeWidth={1.8}
        strokeLinecap="round"
      />

      {/* Whiskers */}
      {[
        // Left whiskers
        [CAT_CX - 14, CAT_CY - 6, CAT_CX - 54, CAT_CY - 10],
        [CAT_CX - 14, CAT_CY - 4, CAT_CX - 54, CAT_CY - 4],
        [CAT_CX - 14, CAT_CY - 2, CAT_CX - 54, CAT_CY + 4],
        // Right whiskers
        [CAT_CX + 14, CAT_CY - 6, CAT_CX + 54, CAT_CY - 10],
        [CAT_CX + 14, CAT_CY - 4, CAT_CX + 54, CAT_CY - 4],
        [CAT_CX + 14, CAT_CY - 2, CAT_CX + 54, CAT_CY + 4],
      ].map(([x1, y1, x2, y2], i) => (
        <line
          key={i}
          x1={x1} y1={y1} x2={x2} y2={y2}
          stroke="#c8a080"
          strokeWidth={1.2}
          strokeLinecap="round"
          opacity={0.7}
        />
      ))}

      {/* Blush marks */}
      <ellipse cx={CAT_CX - 26} cy={CAT_CY - 10} rx={9} ry={5} fill="#f4b0c0" opacity={0.55} />
      <ellipse cx={CAT_CX + 26} cy={CAT_CY - 10} rx={9} ry={5} fill="#f4b0c0" opacity={0.55} />

      {/* Paws */}
      <ellipse cx={CAT_CX - 34} cy={CAT_CY + 64} rx={16} ry={10} fill="#f0c8a0" />
      <ellipse cx={CAT_CX + 34} cy={CAT_CY + 64} rx={16} ry={10} fill="#f0c8a0" />
      {/* Paw toe lines */}
      {[-6, 0, 6].map((dx, i) => (
        <line
          key={`lpaw-${i}`}
          x1={CAT_CX - 34 + dx} y1={CAT_CY + 58}
          x2={CAT_CX - 34 + dx} y2={CAT_CY + 62}
          stroke="#e0b090" strokeWidth={1.5} strokeLinecap="round"
        />
      ))}
      {[-6, 0, 6].map((dx, i) => (
        <line
          key={`rpaw-${i}`}
          x1={CAT_CX + 34 + dx} y1={CAT_CY + 58}
          x2={CAT_CX + 34 + dx} y2={CAT_CY + 62}
          stroke="#e0b090" strokeWidth={1.5} strokeLinecap="round"
        />
      ))}

      {/* Meow speech bubble */}
      {meowing && (
        <g>
          <rect
            x={CAT_CX + 50} y={CAT_CY - 80}
            width={88} height={34}
            rx={8} ry={8}
            fill="#fff0f5"
            stroke="#c47a8a"
            strokeWidth={2}
          />
          {/* Bubble tail pointing left-down */}
          <polygon
            points={`${CAT_CX + 58},${CAT_CY - 46} ${CAT_CX + 50},${CAT_CY - 38} ${CAT_CX + 68},${CAT_CY - 46}`}
            fill="#fff0f5"
            stroke="#c47a8a"
            strokeWidth={2}
            strokeLinejoin="round"
          />
          {/* Mask over stroke where tail meets rect */}
          <rect
            x={CAT_CX + 57} y={CAT_CY - 47}
            width={12} height={3}
            fill="#fff0f5"
          />
          <text
            x={CAT_CX + 94}
            y={CAT_CY - 57}
            textAnchor="middle"
            fontFamily='"Press Start 2P", monospace'
            fontSize={8}
            fill="#8b3a52"
          >
            meow~
          </text>
        </g>
      )}
    </g>
  )
}
