import { useRef, useEffect } from 'react'

const NAMES = {
  boot: 'BOOT',
  home: 'HOME',
  work: 'ITEMS',
  about: 'STATUS',
  skills: 'FEED',
  contact: 'MSG',
}

const IDLE_FACE = [
  '................',
  '....OOOOOOOO....',
  '...OBBBBBBBBO...',
  '..OBBBBBBBBBBO..',
  '..OBBEEBBEEBBО..',
  '..OBBEXBBEXBBO..',
  '..OBBBBBBBBBBO..',
  '..OBBBBBBBBBBO..',
]

const COLORS = {
  '.': '#ffe8f0',
  'B': '#8b3a52',
  'O': '#5a1a2a',
  'E': '#fff0f5',
  'X': '#5a1a2a',
  'P': '#f4afc0',
  'Z': '#c47a8a',
  'L': '#f9d4de',
}

function normalizeRow(row) {
  let normalized = ''
  for (let i = 0; i < 16; i++) {
    if (i >= row.length) {
      normalized += '.'
    } else {
      const cp = row.codePointAt(i)
      if (cp === 0x041E) normalized += 'O'
      else if (cp === 0x0412) normalized += 'B'
      else normalized += row[i]
    }
  }
  return normalized
}

function HeartPip({ filled }) {
  return (
    <div
      style={{
        width: 8,
        height: 8,
        position: 'relative',
        display: 'inline-block',
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: filled ? '#f4afc0' : 'transparent',
          border: filled ? 'none' : '1px solid #e8c0cc',
          borderRadius: '50% 50% 0 0',
          width: 5,
          height: 5,
          top: 1,
          left: 0,
          transform: 'rotate(-45deg)',
          transformOrigin: 'bottom right',
        }}
      />
      <div
        style={{
          position: 'absolute',
          background: filled ? '#f4afc0' : 'transparent',
          border: filled ? 'none' : '1px solid #e8c0cc',
          borderRadius: '50% 50% 0 0',
          width: 5,
          height: 5,
          top: 1,
          left: 3,
          transform: 'rotate(45deg)',
          transformOrigin: 'bottom left',
        }}
      />
      <div
        style={{
          position: 'absolute',
          background: filled ? '#f4afc0' : 'transparent',
          border: filled ? 'none' : '1px solid #e8c0cc',
          width: 7,
          height: 5,
          top: 3,
          left: 0,
          transform: 'rotate(0deg)',
          clipPath: 'polygon(0 0, 100% 0, 50% 100%)',
        }}
      />
    </div>
  )
}

export default function StatusBar({ currentScreen, stats }) {
  const canvasRef = useRef(null)
  const happiness = stats ? Math.max(0, Math.min(5, stats.happiness)) : 4

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    ctx.clearRect(0, 0, 18, 18)
    const scale = 18 / 16
    for (let row = 0; row < 8; row++) {
      const rowStr = normalizeRow(IDLE_FACE[row] || '................')
      for (let col = 0; col < 16; col++) {
        const ch = rowStr[col] || '.'
        ctx.fillStyle = COLORS[ch] || COLORS['.']
        ctx.fillRect(col * (18 / 16), row * (18 / 8), 18 / 16 + 0.5, 18 / 8 + 0.5)
      }
    }
  }, [])

  const screenName = NAMES[currentScreen] || 'HOME'

  return (
    <div
      style={{
        height: 20,
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 6px',
        borderBottom: '1px solid rgba(139,58,82,0.15)',
        background: 'rgba(255,232,240,0.6)',
        flexShrink: 0,
      }}
    >
      {/* Left: tiny face */}
      <canvas
        ref={canvasRef}
        width={18}
        height={18}
        style={{ imageRendering: 'pixelated', display: 'block' }}
      />

      {/* Middle: screen name */}
      <span
        style={{
          fontFamily: "'Press Start 2P', monospace",
          fontSize: 5,
          color: '#8b3a52',
          letterSpacing: '0.05em',
        }}
      >
        {screenName}
      </span>

      {/* Right: hearts */}
      <div style={{ display: 'flex', gap: 2, alignItems: 'center' }}>
        {Array.from({ length: 5 }, (_, i) => (
          <HeartPip key={i} filled={i < happiness} />
        ))}
      </div>
    </div>
  )
}
