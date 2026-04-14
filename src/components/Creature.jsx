import { useRef, useEffect } from 'react'

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

const FRAMES = {
  idle: [
    [
      '................',
      '....OOOOOOOO....',
      '...OBBBBBBBBO...',
      '..OBBBBBBBBBBO..',
      '..OBBEEBBEEBBО..',
      '..OBBEXBBEXBBO..',
      '..OBBBBBBBBBBO..',
      '..OBBBBBBBBBBO..',
      '..OBBPBBBPBBBO..',
      '..OBBBBBBBBBBO..',
      '...OBBBBBBBBO...',
      '...OBO....OBO...',
      '....O......O....',
      '....O......O....',
      '...OOO....OOO...',
      '................',
    ],
    [
      '................',
      '................',
      '....OOOOOOOO....',
      '...OBBBBBBBBO...',
      '..OBBBBBBBBBBO..',
      '..OBBEEBBEEBBО..',
      '..OBBEXBBEXBBO..',
      '..OBBBBBBBBBBO..',
      '..OBBBBBBBBBBO..',
      '..OBBPBBBPBBBO..',
      '..OBBBBBBBBBBO..',
      '...OBBBBBBBBO...',
      '...OBO....OBO...',
      '....O......O....',
      '...OOO....OOO...',
      '................',
    ],
  ],
  happy: [
    [
      '................',
      '....OOOOOOOO....',
      '...OBBBBBBBBO...',
      '..OBBBBBBBBBBO..',
      '..OBBOOBBOOBBO..',
      '..OBBBBBBBBBBO..',
      'B..OBBBBBBBBO..B',
      '..OBBPPBBBPPBO..',
      '..OBBBBBBBBBBO..',
      '..OBBBBBBBBBBO..',
      '...OBBBBBBBBO...',
      '...OBO....OBO...',
      '....O......O....',
      '....O......O....',
      '...OOO....OOO...',
      '................',
    ],
    [
      '....OOOOOOOO....',
      '...OBBBBBBBBO...',
      '..OBBBBBBBBBBO..',
      '..OBBOOBBOOBBO..',
      '..OBBBBBBBBBBO..',
      'B..OBBBBBBBBO..B',
      '..OBBPPBBBPPBO..',
      '..OBBBBBBBBBBO..',
      '..OBBBBBBBBBBO..',
      '...OBBBBBBBBO...',
      '...OBO....OBO...',
      '....O......O....',
      '....O......O....',
      '...OOO....OOO...',
      '................',
      '................',
    ],
  ],
  sleep: [
    [
      '.............ZZZ',
      '............ZZ..',
      '....OOOOOOOO....',
      '...OBBBBBBBBO...',
      '..OBBBBBBBBBBO..',
      '..OBBOOBBOOBBO..',
      '..OBBBBBBBBBBO..',
      '..OBBBBBBBBBBO..',
      '..OBBBBBBBBBBO..',
      '..OBBBBBBBBBBO..',
      '...OBBBBBBBBO...',
      '...OBO....OBO...',
      '....O......O....',
      '....O......O....',
      '...OOO....OOO...',
      '................',
    ],
    [
      '..............ZZ',
      '.............ZZ.',
      '....OOOOOOOO....',
      '...OBBBBBBBBO...',
      '..OBBBBBBBBBBO..',
      '..OBBOOBBOOBBO..',
      '..OBBBBBBBBBBO..',
      '..OBBBBBBBBBBO..',
      '..OBBBBBBBBBBO..',
      '..OBBBBBBBBBBO..',
      '...OBBBBBBBBO...',
      '...OBO....OBO...',
      '....O......O....',
      '....O......O....',
      '...OOO....OOO...',
      '................',
    ],
  ],
  eat: [
    [
      '................',
      '....OOOOOOOO....',
      '...OBBBBBBBBO...',
      '..OBBBBBBBBBBO..',
      '..OBBEEBBEEBBО..',
      '..OBBEXBBEXBBO..',
      '..OBBBBBBBBBBO..',
      '..OBBBOOOOBBBO..',
      '..OBBBOBBOBBBО..',
      '..OBBBBBBBBBBO..',
      '...OBBBBBBBBO...',
      '...OBO....OBO...',
      '....O......O....',
      '....O......O....',
      '...OOO....OOO...',
      '................',
    ],
    [
      '................',
      '....OOOOOOOO....',
      '...OBBBBBBBBO...',
      '..OBBBBBBBBBBO..',
      '..OBBEEBBEEBBО..',
      '..OBBEXBBEXBBO..',
      '..OBBBBBBBBBBO..',
      '..OBBBBBBBBBBO..',
      'P.OBBPPBBBPPBOP.',
      '..OBBBBBBBBBBO..',
      '...OBBBBBBBBO...',
      '...OBO....OBO...',
      '....O......O....',
      '....O......O....',
      '...OOO....OOO...',
      '................',
    ],
  ],
  study: [
    [
      '................',
      '....OOOOOOOO....',
      '...OBBBBBBBBO...',
      '..OBBBBBBBBBBO..',
      '..OBBEEBBEEBBО..',
      '..OBBEXBBEXBBO..',
      '..OBBBBBBBBBBO..',
      'B..OBBBBBBBBO..B',
      '..OBBBBBBBBBBО..',
      '..OBOOLLLLLOBO..',
      '..OBOOLLLLLOBO..',
      '..OBOOOOOOOOBO..',
      '...OBO....OBO...',
      '....O......O....',
      '...OOO....OOO...',
      '................',
    ],
    [
      '................',
      '....OOOOOOOO....',
      '...OBBBBBBBBO...',
      '..OBBBBBBBBBBO..',
      '..OBBEEBBEEBBО..',
      '..OBBEXBBEXBBO..',
      '..OBBBBBBBBBBO..',
      'B..OBBBBBBBBO..B',
      '..OBBBBBBBBBBО..',
      '..OBOOLLLLLOBO..',
      '..OBOOLLLLLOBO..',
      '..OBOOOOOOOOBO..',
      '...OBO....OBO...',
      '....O......O....',
      '...OOO....OOO...',
      '................',
    ],
  ],
  work: [
    [
      '................',
      '....OOOOOOOO....',
      '...OBBBBBBBBO...',
      '..OBBBBBBBBBBO..',
      '..OBBEEBBEEBBО..',
      '..OBBEXBBEXBBO..',
      '..OBBBBBBBBBBO..',
      'B..OBBBBBBBBO..B',
      '..OBBBBBBBBBBO..',
      '..OBBBBBBBBBBO..',
      '...OBBBBBBBBO...',
      '...OBOOOOOBО....',
      '....OOOOOO......',
      '................',
      '...OOO..........',
      '................',
    ],
    [
      '................',
      '....OOOOOOOO....',
      '...OBBBBBBBBO...',
      '..OBBBBBBBBBBO..',
      '..OBBEEBBEEBBО..',
      '..OBBEXBBEXBBO..',
      '..OBBBBBBBBBBO..',
      'B..OBBBBBBBBO..B',
      '..OBBBBBBBBBBO..',
      '..OBBBBBBBBBBO..',
      '...OBBBBBBBBO...',
      '....OBOOOOОBO...',
      '.....OOOOOO.....',
      '................',
      '...OOO..........',
      '................',
    ],
  ],
  wave: [
    [
      '.............OO.',
      '............OBO.',
      '....OOOOOOOO....',
      '...OBBBBBBBBO...',
      '..OBBBBBBBBBBO..',
      '..OBBEEBBEEBBО..',
      '..OBBEXBBEXBBO..',
      '..OBBBBBBBBBBO..',
      '..OBBBBBBBBBBO..',
      '..OBBPBBBPBBBO..',
      '...OBBBBBBBBO...',
      '...OBO....OBO...',
      '....O......O....',
      '....O......O....',
      '...OOO....OOO...',
      '................',
    ],
    [
      '................',
      '..............O.',
      '....OOOOOOOO.OB.',
      '...OBBBBBBBBOБ..',
      '..OBBBBBBBBBBO..',
      '..OBBEEBBEEBBО..',
      '..OBBEXBBEXBBO..',
      '..OBBBBBBBBBBO..',
      '..OBBBBBBBBBBO..',
      '..OBBPBBBPBBBO..',
      '...OBBBBBBBBO...',
      '...OBO....OBO...',
      '....O......O....',
      '....O......O....',
      '...OOO....OOO...',
      '................',
    ],
  ],
  think: [
    [
      '................',
      '....OOOOOOOO....',
      '...OBBBBBBBBO...',
      '..OBBBBBBBBBBO..',
      '..OBBOXBBEEBBО..',
      '..OBBBXBBEXBBO..',
      '..OBBBBBBBBBBO..',
      '..OBBBBBBBBBBO..',
      '..OBBPBBBPBBBO..',
      '..OBBBBBBBBBBO..',
      '...OBBBBBBBBO...',
      '...OBO....OBO...',
      '....O...ZZZ.O...',
      '....O......O....',
      '...OOO....OOO...',
      '................',
    ],
    [
      '................',
      '....OOOOOOOO....',
      '...OBBBBBBBBO...',
      '..OBBBBBBBBBBO..',
      '..OBBOXBBEEBBО..',
      '..OBBBXBBEXBBO..',
      '..OBBBBBBBBBBO..',
      '..OBBBBBBBBBBO..',
      '..OBBPBBBPBBBO..',
      '..OBBBBBBBBBBO..',
      '...OBBBBBBBBO...',
      '...OBO....OBO...',
      '....O..ZZZ..O...',
      '....O......O....',
      '...OOO....OOO...',
      '................',
    ],
  ],
  hatch: [
    [
      '................',
      '................',
      '....OOOOOOOO....',
      '...OBBBBBBBBO...',
      '..OBBBBBBBBBBO..',
      '.OBBBBBBBBBBBBО.',
      '.OBBBBBBBBBBBBO.',
      '.OBBBBBBBBBBBBO.',
      '.OBBBBBBBBBBBBO.',
      '.OBBBBBBBBBBBBO.',
      '..OBBBBBBBBBBO..',
      '...OBBBBBBBBO...',
      '....OOOOOOOO....',
      '................',
      '................',
      '................',
    ],
    [
      '................',
      '................',
      '....OOOOOOOO....',
      '...OBBBBBBBBO...',
      '....OOBBBBOO....',
      '...O.BBBBBB.O...',
      '..OBBBBBBBBBBO..',
      '.OBBOOBBOOBBBBO.',
      '.OBBBBBBBBBBBBO.',
      '.OBBBBBBBBBBBBO.',
      '..OBBBBBBBBBBO..',
      '...OBBBBBBBBO...',
      '....OOOOOOOO....',
      '................',
      '................',
      '................',
    ],
  ],
  levelup: [
    [
      'Z..............Z',
      '.Z............Z.',
      '....OOOOOOOO....',
      '...OBBBBBBBBO...',
      '..OBBOOBBOOBBO..',
      '..OBBBBBBBBBBO..',
      'B..OBBBBBBBBO..B',
      '..OBBPPBBBPPBO..',
      '..OBBBBBBBBBBO..',
      '..OBBBBBBBBBBO..',
      '...OBBBBBBBBO...',
      '.Z.OBO....OBO...',
      '....O......O....',
      '....O......O....',
      '.Z.OOO....OOO.Z.',
      '................',
    ],
    [
      '.Z............Z.',
      'Z..............Z',
      '....OOOOOOOO....',
      '...OBBBBBBBBO...',
      '..OBBOOBBOOBBO..',
      '..OBBBBBBBBBBO..',
      'B..OBBBBBBBBO..B',
      '..OBBPPBBBPPBO..',
      '..OBBBBBBBBBBO..',
      '..OBBBBBBBBBBO..',
      '...OBBBBBBBBO...',
      'Z..OBO....OBO..Z',
      '....O......O....',
      '....O......O....',
      'Z..OOO....OOO..Z',
      '................',
    ],
  ],
}

// Normalize frames: replace Cyrillic lookalikes with ASCII, pad/truncate to 16 chars
function normalizeRow(row) {
  // Replace any non-ASCII chars that look like O (Cyrillic О = U+041E) with O
  // Replace any non-ASCII chars that look like B (Cyrillic В = U+0412) with B
  let normalized = ''
  for (let i = 0; i < 16; i++) {
    if (i >= row.length) {
      normalized += '.'
    } else {
      const cp = row.codePointAt(i)
      if (cp === 0x041E || cp === 0x04E0) normalized += 'O' // Cyrillic O
      else if (cp === 0x0412) normalized += 'B' // Cyrillic B
      else if (cp === 0x0411) normalized += 'B' // Cyrillic Б
      else normalized += row[i]
    }
  }
  return normalized
}

function drawFrame(ctx, frame, pixelSize) {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
  for (let row = 0; row < 16; row++) {
    const rowStr = normalizeRow(frame[row] || '................')
    for (let col = 0; col < 16; col++) {
      const ch = rowStr[col] || '.'
      ctx.fillStyle = COLORS[ch] || COLORS['.']
      ctx.fillRect(col * pixelSize, row * pixelSize, pixelSize, pixelSize)
    }
  }
}

export default function Creature({ animState = 'idle', scale = 1 }) {
  const canvasRef = useRef(null)
  const intervalRef = useRef(null)
  const frameIdxRef = useRef(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')

    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }

    frameIdxRef.current = 0

    const stateKey = animState && FRAMES[animState] ? animState : 'idle'
    const frameSet = FRAMES[stateKey]

    // Draw first frame immediately
    drawFrame(ctx, frameSet[0], 4)

    const fps = animState === 'sleep' ? 1200 : animState === 'hatch' ? 600 : 400
    intervalRef.current = setInterval(() => {
      frameIdxRef.current = (frameIdxRef.current + 1) % frameSet.length
      drawFrame(ctx, frameSet[frameIdxRef.current], 4)
    }, fps)

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [animState])

  const cssSize = 64 * scale

  return (
    <canvas
      ref={canvasRef}
      width={64}
      height={64}
      style={{
        width: cssSize,
        height: cssSize,
        imageRendering: 'pixelated',
        display: 'block',
      }}
    />
  )
}
