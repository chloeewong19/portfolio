import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import Creature from '../components/Creature'

const NAV = [
  { id: 'work',    label: 'WORK',    icon: 'briefcase' },
  { id: 'about',   label: 'ABOUT',   icon: 'person' },
  { id: 'skills',  label: 'SKILLS',  icon: 'lightning' },
  { id: 'contact', label: 'CONTACT', icon: 'envelope' },
]

function NavIcon({ type, selected }) {
  const color = selected ? '#8b3a52' : '#c47a8a'
  const bg = selected ? '#fdf0f4' : '#fff0f5'
  const border = selected ? '#c47a8a' : '#e8c0cc'

  const icons = {
    briefcase: (
      <svg width="16" height="16" viewBox="0 0 12 12" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="1" y="3" width="10" height="8" rx="1" />
        <path d="M4 3V2a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v1" />
      </svg>
    ),
    person: (
      <svg width="16" height="16" viewBox="0 0 12 12" fill={color}>
        <circle cx="6" cy="4" r="2.5" />
        <path d="M1 11a5 5 0 0 1 10 0z" />
      </svg>
    ),
    lightning: (
      <svg width="16" height="16" viewBox="0 0 12 12" fill={color}>
        <polygon points="7,1 3,7 6,7 5,11 9,5 6,5" />
      </svg>
    ),
    envelope: (
      <svg width="16" height="16" viewBox="0 0 12 12" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="1" y="3" width="10" height="7" rx="1" />
        <path d="M1 3l5 4 5-4" />
      </svg>
    ),
  }

  return (
    <div
      style={{
        width: 40,
        height: 40,
        background: bg,
        border: `1.5px solid ${border}`,
        borderRadius: 8,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all 0.15s',
      }}
    >
      {icons[type]}
    </div>
  )
}

export default function HomeScreen({ navigate, setCreatureAnim, sound, homeIconIdx }) {
  const [creatureX, setCreatureX] = useState(20)
  const [sleeping, setSleeping] = useState(false)
  const idleTimerRef = useRef(null)

  // Creature wander
  useEffect(() => {
    const wander = setInterval(() => {
      setCreatureX(x => (x === 20 ? 55 : 20))
    }, 3000)
    return () => clearInterval(wander)
  }, [])

  // Idle sleep timer
  const resetIdleTimer = () => {
    setSleeping(false)
    setCreatureAnim('idle')
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current)
    idleTimerRef.current = setTimeout(() => {
      setSleeping(true)
      setCreatureAnim('sleep')
    }, 20000)
  }

  useEffect(() => {
    resetIdleTimer()
    return () => {
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current)
    }
  }, [])

  return (
    <div
      style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden' }}
      onPointerDown={resetIdleTimer}
    >
      {/* Name + title */}
      <div
        style={{
          position: 'absolute',
          top: 10,
          left: 0,
          right: 0,
          textAlign: 'center',
        }}
      >
        <div
          style={{
            fontFamily: "'Press Start 2P', monospace",
            fontSize: 7,
            color: '#8b3a52',
            letterSpacing: '0.04em',
          }}
        >
          CHLOE WONG
        </div>
        <div
          style={{
            fontFamily: "'Press Start 2P', monospace",
            fontSize: 5,
            color: '#b07080',
            marginTop: 4,
          }}
        >
          HFE + CS
        </div>
      </div>

      {/* Nav icons 2x2 grid */}
      <div
        style={{
          position: 'absolute',
          top: 38,
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 8,
        }}
      >
        {NAV.map((item, i) => (
          <div key={item.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
            <NavIcon type={item.icon} selected={i === homeIconIdx} />
            <span
              style={{
                fontFamily: "'Press Start 2P', monospace",
                fontSize: 4,
                color: i === homeIconIdx ? '#8b3a52' : '#c47a8a',
              }}
            >
              {item.label}
            </span>
          </div>
        ))}
      </div>

      {/* Creature wandering at bottom */}
      <motion.div
        animate={{ x: `${creatureX}%` }}
        transition={{ duration: 1.5, ease: 'easeInOut' }}
        style={{
          position: 'absolute',
          bottom: 8,
          left: 0,
        }}
      >
        <Creature animState={sleeping ? 'sleep' : 'idle'} scale={1} />
      </motion.div>

      {/* Sleep overlay */}
      {sleeping && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(255,232,240,0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'none',
          }}
        >
          <span
            style={{
              fontFamily: "'Press Start 2P', monospace",
              fontSize: 8,
              color: '#c47a8a',
              opacity: 0.6,
            }}
          >
            ZZZ
          </span>
        </div>
      )}
    </div>
  )
}
