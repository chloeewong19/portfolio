'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import Link from 'next/link'

const PIXEL   = 4   // CSS px per canvas pixel
const ED_PX   = 18  // CSS px per editor pixel
const ED_SIZE = 16  // editor grid
const DOT_GAP = 8   // dot grid spacing (canvas pixels)

// ── Editor palette ─────────────────────────────────────────
const PALETTE = [
  '#E84050', '#F07040', '#F5C840', '#60C870',
  '#3A7A30', '#5090E8', '#9050D0', '#E860B0',
  '#F5F0E8', '#D0A8C0', '#8B5E3C', '#1A1010',
]

// ── Types ──────────────────────────────────────────────────
type FlowerKind = 'pansy' | 'daisy' | 'poppy' | 'tulip' | 'bloom'
type FlowerEntry =
  | { kind: 'default'; wx: number; wy: number; type: FlowerKind; color: string; sz: number; grown: number }
  | { kind: 'user';    wx: number; wy: number; pixels: string[][]; grown: number }
type WaterEffect = { wx: number; wy: number; startTs: number }

// ── Canvas pixel helper ────────────────────────────────────
function px(
  ctx: CanvasRenderingContext2D,
  color: string,
  x: number, y: number,
  w = 1, h = 1,
) {
  if (w <= 0 || h <= 0) return
  ctx.fillStyle = color
  ctx.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h))
}

// ── Stem (shared) ─────────────────────────────────────────
function drawStem(ctx: CanvasRenderingContext2D, cx: number, top: number, sz: number) {
  const h = 4 + sz * 3
  px(ctx, '#5A7A38', cx, top, 1, h)
  px(ctx, '#80B050', cx + 1, top + Math.floor(h * 0.45), sz, 1)
}

// ── Flower heads (cx,cy = center of head) ─────────────────

// 4-petal cross (like classic pixel flower from reference)
function drawPansy(ctx: CanvasRenderingContext2D, cx: number, cy: number, color: string, sz: number) {
  const p = sz + 1          // petal block size
  const h = Math.floor(p / 2)
  // Petals
  px(ctx, color, cx - h, cy - h - p, p, p)   // top
  px(ctx, color, cx - h, cy + h,     p, p)   // bottom
  px(ctx, color, cx - h - p, cy - h, p, p)   // left
  px(ctx, color, cx - h + p, cy - h, p, p)   // right (corrected: cx - h + p)
  // Lighter petal highlight
  px(ctx, lighten(color), cx - h + 1, cy - h - p + 1, 1, 1)
  px(ctx, lighten(color), cx - h + p + 1, cy - h + 1, 1, 1)
  // Yellow center
  px(ctx, '#F5D040', cx - h, cy - h, p, p)
  px(ctx, '#C8A020', cx, cy, 1, 1)
  // Stem
  drawStem(ctx, cx, cy + h, sz)
}

// 8-petal daisy
function drawDaisy(ctx: CanvasRenderingContext2D, cx: number, cy: number, color: string, sz: number) {
  const p = Math.max(2, sz)   // petal size
  const h = Math.floor(p / 2)
  const o = p + 1             // offset from center
  // Cardinal petals
  px(ctx, color, cx - h, cy - h - o,   p, p)
  px(ctx, color, cx - h, cy + h + 1,   p, p)
  px(ctx, color, cx - h - o, cy - h,   p, p)
  px(ctx, color, cx + h + 1, cy - h,   p, p)
  // Diagonal petals (slightly smaller)
  const dp = Math.max(1, p - 1)
  px(ctx, color, cx - h - o + 1, cy - h - o + 1, dp, dp)
  px(ctx, color, cx + h + 1,     cy - h - o + 1, dp, dp)
  px(ctx, color, cx - h - o + 1, cy + h + 1,     dp, dp)
  px(ctx, color, cx + h + 1,     cy + h + 1,     dp, dp)
  // Yellow center
  const c = sz + 1
  const hc = Math.floor(c / 2)
  px(ctx, '#F5D040', cx - hc, cy - hc, c, c)
  px(ctx, '#D4A020', cx, cy, 1, 1)
  drawStem(ctx, cx, cy + hc, sz)
}

// 4-petal poppy with dark center
function drawPoppy(ctx: CanvasRenderingContext2D, cx: number, cy: number, color: string, sz: number) {
  const p = sz + 2
  const h = Math.floor(p / 2)
  // Overlapping round-ish petals
  px(ctx, color, cx - h, cy - h - p + 1, p, p)  // top
  px(ctx, color, cx - h, cy + h - 1,     p, p)  // bottom
  px(ctx, color, cx - h - p + 1, cy - h, p, p)  // left
  px(ctx, color, cx + h - 1,     cy - h, p, p)  // right
  // Slight overlap center fill
  px(ctx, color, cx - h, cy - h, p, p)
  // Dark seed center
  px(ctx, '#2A0808', cx - 1, cy - 1, 3, 3)
  px(ctx, '#6A1010', cx, cy, 1, 1)
  drawStem(ctx, cx, cy + 2, sz)
}

// Tulip - cup shape (no separate petals)
function drawTulip(ctx: CanvasRenderingContext2D, cx: number, cy: number, color: string, sz: number) {
  const w = sz + 1   // side petal width
  const th = sz * 3 + 2  // tulip height
  const lighter = lighten(color)
  // Left petal
  px(ctx, darken(color), cx - w - 1, cy - th + w, w, th)
  // Right petal
  px(ctx, darken(color), cx + 2,     cy - th + w, w, th)
  // Center petal (taller, lighter)
  px(ctx, color,   cx - 1, cy - th, w + 1, th + w)
  px(ctx, lighter, cx,     cy - th + 1, 1, Math.floor(th * 0.4))
  // Cup lip
  px(ctx, darken(color), cx - w - 1, cy, 2 * w + 3, 1)
  drawStem(ctx, cx, cy + 1, sz)
}

// Blob bloom - chunky round flower
function drawBloom(ctx: CanvasRenderingContext2D, cx: number, cy: number, color: string, sz: number) {
  const p = sz + 1
  const h = Math.floor(p / 2)
  // 5 petals: top, bottom-left, bottom-right, left, right (pentagon-ish)
  px(ctx, color, cx - h, cy - h - p, p, p)     // top
  px(ctx, color, cx - h - p, cy - h, p, p)     // left
  px(ctx, color, cx - h + p, cy - h, p, p)     // right
  px(ctx, color, cx - h - h, cy + h - 1, p, p) // bottom-left
  px(ctx, color, cx + h,     cy + h - 1, p, p) // bottom-right
  // Slightly lighter second layer for depth
  px(ctx, lighten(color), cx - h, cy - h, p, p)
  // White center
  const c = Math.max(2, sz)
  const hc = Math.floor(c / 2)
  px(ctx, '#F8F5F0', cx - hc, cy - hc, c, c)
  px(ctx, '#F0E8D8', cx, cy, 1, 1)
  drawStem(ctx, cx, cy + hc, sz)
}

// ── Color utilities ────────────────────────────────────────
function lighten(hex: string): string {
  const r = Math.min(255, parseInt(hex.slice(1, 3), 16) + 40)
  const g = Math.min(255, parseInt(hex.slice(3, 5), 16) + 40)
  const b = Math.min(255, parseInt(hex.slice(5, 7), 16) + 40)
  return `rgb(${r},${g},${b})`
}

function darken(hex: string): string {
  const r = Math.max(0, parseInt(hex.slice(1, 3), 16) - 30)
  const g = Math.max(0, parseInt(hex.slice(3, 5), 16) - 30)
  const b = Math.max(0, parseInt(hex.slice(5, 7), 16) - 30)
  return `rgb(${r},${g},${b})`
}

// ── Draw dispatcher ────────────────────────────────────────
function drawDefaultFlower(
  ctx: CanvasRenderingContext2D,
  type: FlowerKind,
  cx: number, cy: number,
  color: string,
  sz: number,
) {
  switch (type) {
    case 'pansy': drawPansy(ctx, cx, cy, color, sz); break
    case 'daisy': drawDaisy(ctx, cx, cy, color, sz); break
    case 'poppy': drawPoppy(ctx, cx, cy, color, sz); break
    case 'tulip': drawTulip(ctx, cx, cy, color, sz); break
    case 'bloom': drawBloom(ctx, cx, cy, color, sz); break
  }
}

type DefaultFlowerDef = { wx: number; wy: number; type: FlowerKind; color: string; sz: number }

// ── Default flower positions (world coords, spread for nice initial view) ──
const DEFAULT_FLOWERS: DefaultFlowerDef[] = [
  { wx: -55, wy: -35,  type: 'pansy', color: '#E860B0', sz: 3 },
  { wx:  20, wy: -50,  type: 'daisy', color: '#F8F5E8', sz: 3 },
  { wx:  75, wy: -20,  type: 'tulip', color: '#8050C8', sz: 3 },
  { wx: -75, wy:  10,  type: 'poppy', color: '#E84040', sz: 3 },
  { wx:  35, wy:  45,  type: 'bloom', color: '#F07840', sz: 2 },
  { wx: -20, wy:  55,  type: 'pansy', color: '#C878E8', sz: 2 },
  { wx:  60, wy:  30,  type: 'daisy', color: '#F5C840', sz: 2 },
  { wx: -45, wy: -65,  type: 'bloom', color: '#70B8F0', sz: 2 },
  { wx:  45, wy: -70,  type: 'poppy', color: '#F08070', sz: 2 },
  { wx: -90, wy: -30,  type: 'tulip', color: '#E870A0', sz: 2 },
  { wx:  90, wy:  55,  type: 'pansy', color: '#70C8A0', sz: 2 },
  { wx:   0, wy:  80,  type: 'daisy', color: '#F5E8C0', sz: 3 },
  { wx: -30, wy: -90,  type: 'bloom', color: '#D080D0', sz: 3 },
  { wx:  80, wy: -80,  type: 'pansy', color: '#F0A040', sz: 3 },
  { wx: -90, wy:  70,  type: 'poppy', color: '#C0504A', sz: 2 },
  { wx:  10, wy: -110, type: 'tulip', color: '#5090D8', sz: 2 },
  { wx: -60, wy:  95,  type: 'daisy', color: '#E8D8F0', sz: 2 },
  { wx: 100, wy: -10,  type: 'bloom', color: '#F07060', sz: 3 },
]

// ── Component ──────────────────────────────────────────────
export default function PixelGardenCard() {
  const containerRef  = useRef<HTMLDivElement>(null)
  const canvasRef     = useRef<HTMLCanvasElement>(null)
  const editorRef     = useRef<HTMLCanvasElement>(null)

  // All mutable canvas state in refs (no re-render needed)
  const viewOffsetRef = useRef({ x: 0, y: 0 })  // init after first resize
  const flowersRef    = useRef<FlowerEntry[]>([
    ...DEFAULT_FLOWERS.map(f => ({ ...f, kind: 'default' as const, grown: 0 })),
  ])
  const isDraggingRef  = useRef(false)
  const dragStartRef   = useRef({ clientX: 0, clientY: 0, vx: 0, vy: 0 })
  const dragMovedRef   = useRef(0)
  const initializedRef = useRef(false)
  const dirtyRef       = useRef(true)
  const effectsRef     = useRef<WaterEffect[]>([])
  const waterModeRef   = useRef(false)

  // React state: only for UI panels
  const [editorOpen,    setEditorOpen]    = useState(false)
  const [editorPixels,  setEditorPixels]  = useState<string[][]>(
    () => Array(ED_SIZE).fill(null).map(() => Array(ED_SIZE).fill(''))
  )
  const [selectedColor, setSelectedColor] = useState('#E84050')
  const [tool,          setTool]          = useState<'draw' | 'erase'>('draw')
  const [isPainting,    setIsPainting]    = useState(false)
  const [linkHovered,   setLinkHovered]   = useState(false)
  const [addHovered,    setAddHovered]    = useState(false)
  const [waterHovered,  setWaterHovered]  = useState(false)
  const [dragging,      setDragging]      = useState(false)
  const [waterMode,     setWaterMode]     = useState(false)

  const selectedColorRef = useRef(selectedColor)
  const toolRef          = useRef(tool)
  useEffect(() => { selectedColorRef.current = selectedColor }, [selectedColor])
  useEffect(() => { toolRef.current = tool }, [tool])
  useEffect(() => { waterModeRef.current = waterMode }, [waterMode])

  // ── Garden RAF loop ──────────────────────────────────────
  useEffect(() => {
    const container = containerRef.current
    const canvas    = canvasRef.current
    if (!container || !canvas) return

    const syncSize = () => {
      const { width, height } = container.getBoundingClientRect()
      const W = Math.max(1, Math.floor(width  / PIXEL))
      const H = Math.max(1, Math.floor(height / PIXEL))
      canvas.width  = W
      canvas.height = H
      // Centre the view on first resize
      if (!initializedRef.current) {
        viewOffsetRef.current = { x: -Math.floor(W / 2), y: -Math.floor(H / 2) }
        initializedRef.current = true
      }
      dirtyRef.current = true
    }

    const ro = new ResizeObserver(syncSize)
    ro.observe(container)
    syncSize()

    let raf = 0
    let lastTs = 0

    const render = (ts: number) => {
      raf = requestAnimationFrame(render)
      if (!dirtyRef.current && ts - lastTs < 200) return
      if (ts - lastTs < 48) return  // ~20fps cap
      lastTs = ts
      dirtyRef.current = false

      const ctx = canvas.getContext('2d')
      if (!ctx) return

      const W = canvas.width
      const H = canvas.height
      if (W === 0 || H === 0) return

      const vo = viewOffsetRef.current

      // ── Background ────────────────────────────────────
      ctx.fillStyle = '#f4f0ec'
      ctx.fillRect(0, 0, W, H)

      // ── Dot grid (scrolls with view) ──────────────────
      const ox = ((vo.x % DOT_GAP) + DOT_GAP) % DOT_GAP
      const oy = ((vo.y % DOT_GAP) + DOT_GAP) % DOT_GAP
      ctx.fillStyle = 'rgba(100,70,45,0.13)'
      for (let dx = -ox; dx < W; dx += DOT_GAP) {
        for (let dy = -oy; dy < H; dy += DOT_GAP) {
          ctx.fillRect(Math.round(dx), Math.round(dy), 1, 1)
        }
      }

      // ── Flowers ───────────────────────────────────────
      flowersRef.current.forEach(flower => {
        const cx = flower.wx - vo.x
        const cy = flower.wy - vo.y
        if (cx < -60 || cx > W + 60 || cy < -80 || cy > H + 60) return

        if (flower.kind === 'default') {
          const sz = Math.min(flower.sz + flower.grown, 7)
          drawDefaultFlower(ctx, flower.type, cx, cy, flower.color, sz)
        } else {
          // User-drawn pixel art — scale grows with watering
          const scale = 1 + flower.grown * 0.35
          const ps = Math.max(1, Math.round(scale))
          flower.pixels.forEach((row, r) => {
            row.forEach((col, c) => {
              if (!col) return
              ctx.fillStyle = col
              ctx.fillRect(
                Math.round(cx + (c - ED_SIZE / 2) * scale),
                Math.round(cy + (r - ED_SIZE / 2) * scale),
                ps, ps,
              )
            })
          })
        }
      })

      // ── Water splash effects ───────────────────────────
      const now = ts
      effectsRef.current = effectsRef.current.filter(e => now - e.startTs < 700)
      effectsRef.current.forEach(effect => {
        const age = (now - effect.startTs) / 700   // 0→1
        const ecx = effect.wx - vo.x
        const ecy = effect.wy - vo.y
        const numDrops = 7
        for (let i = 0; i < numDrops; i++) {
          const angle = (i / numDrops) * Math.PI * 2
          const dist  = age * 10
          const alpha = (1 - age) * 0.85
          const dropSize = Math.max(1, Math.round(2 * (1 - age)))
          ctx.fillStyle = `rgba(80,155,230,${alpha})`
          ctx.fillRect(
            Math.round(ecx + Math.cos(angle) * dist),
            Math.round(ecy + Math.sin(angle) * dist),
            dropSize, dropSize,
          )
        }
        // Keep marking dirty while effects are alive
        dirtyRef.current = true
      })
    }

    raf = requestAnimationFrame(render)
    return () => { cancelAnimationFrame(raf); ro.disconnect() }
  }, [])

  // ── Water a flower at a click position ───────────────
  const waterFlowerAt = useCallback((e: React.MouseEvent) => {
    const container = containerRef.current
    const canvas    = canvasRef.current
    if (!container || !canvas) return
    const rect = container.getBoundingClientRect()
    const canvasX = (e.clientX - rect.left)  / PIXEL
    const canvasY = (e.clientY - rect.top)   / PIXEL
    const worldX  = canvasX + viewOffsetRef.current.x
    const worldY  = canvasY + viewOffsetRef.current.y

    let nearest: FlowerEntry | null = null
    let nearestDist = Infinity
    flowersRef.current.forEach(flower => {
      const dx   = flower.wx - worldX
      const dy   = flower.wy - worldY
      const dist = Math.sqrt(dx * dx + dy * dy)
      if (dist < nearestDist) { nearestDist = dist; nearest = flower }
    })

    if (nearest && nearestDist < 22) {
      (nearest as FlowerEntry).grown = Math.min((nearest as FlowerEntry).grown + 1, 5)
      effectsRef.current.push({ wx: (nearest as FlowerEntry).wx, wy: (nearest as FlowerEntry).wy, startTs: performance.now() })
      dirtyRef.current = true
    }
  }, [])

  // ── Panning handlers (on container) ───────────────────
  const onCanvasMouseDown = useCallback((e: React.MouseEvent) => {
    if (editorOpen) return
    isDraggingRef.current = true
    dragMovedRef.current  = 0
    dragStartRef.current = {
      clientX: e.clientX,
      clientY: e.clientY,
      vx: viewOffsetRef.current.x,
      vy: viewOffsetRef.current.y,
    }
    setDragging(true)
  }, [editorOpen])

  const onCanvasMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDraggingRef.current) return
    const ds = dragStartRef.current
    dragMovedRef.current += Math.abs(e.clientX - ds.clientX) + Math.abs(e.clientY - ds.clientY)
    viewOffsetRef.current = {
      x: ds.vx - (e.clientX - ds.clientX) / PIXEL,
      y: ds.vy - (e.clientY - ds.clientY) / PIXEL,
    }
    dirtyRef.current = true
  }, [])

  const onCanvasMouseUp = useCallback((e: React.MouseEvent) => {
    const wasClick = dragMovedRef.current < 6
    isDraggingRef.current = false
    setDragging(false)
    if (wasClick && waterModeRef.current) waterFlowerAt(e)
  }, [waterFlowerAt])

  // ── Editor canvas render ─────────────────────────────
  useEffect(() => {
    if (!editorOpen) return
    const canvas = editorRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    for (let r = 0; r < ED_SIZE; r++) {
      for (let c = 0; c < ED_SIZE; c++) {
        ctx.fillStyle = (r + c) % 2 === 0 ? '#e8e2d8' : '#ddd6ca'
        ctx.fillRect(c, r, 1, 1)
      }
    }
    editorPixels.forEach((row, r) => {
      row.forEach((col, c) => {
        if (!col) return
        ctx.fillStyle = col
        ctx.fillRect(c, r, 1, 1)
      })
    })
  }, [editorPixels, editorOpen])

  // ── Pixel painting ───────────────────────────────────
  const paintAt = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = editorRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    const c = Math.floor((e.clientX - rect.left) / ED_PX)
    const r = Math.floor((e.clientY - rect.top)  / ED_PX)
    if (c < 0 || c >= ED_SIZE || r < 0 || r >= ED_SIZE) return
    setEditorPixels(prev => {
      const next = prev.map(row => [...row])
      next[r][c] = toolRef.current === 'erase' ? '' : selectedColorRef.current
      return next
    })
  }, [])

  const plantFlower = () => {
    const hasPixels = editorPixels.some(row => row.some(c => c !== ''))
    if (!hasPixels) return
    const vo = viewOffsetRef.current
    const canvas = canvasRef.current
    if (!canvas) return
    const wx = vo.x + canvas.width  / 2 + (Math.random() * 30 - 15)
    const wy = vo.y + canvas.height / 2 + (Math.random() * 30 - 15)
    flowersRef.current = [...flowersRef.current, { kind: 'user', wx, wy, pixels: editorPixels, grown: 0 }]
    dirtyRef.current = true
    setEditorPixels(Array(ED_SIZE).fill(null).map(() => Array(ED_SIZE).fill('')))
    setEditorOpen(false)
  }

  const clearEditor = () =>
    setEditorPixels(Array(ED_SIZE).fill(null).map(() => Array(ED_SIZE).fill('')))

  // ── Button style (dark-on-cream) ─────────────────────
  const pill = (hovered: boolean): React.CSSProperties => ({
    display: 'inline-flex', alignItems: 'center', gap: 6,
    background: hovered ? 'rgba(50,25,10,0.09)' : 'rgba(50,25,10,0.05)',
    border: '1px solid rgba(50,25,10,0.13)',
    borderRadius: 100,
    padding: '9px 18px',
    fontFamily: "'General Sans', var(--font-dm-sans), sans-serif",
    fontSize: '0.75rem', fontWeight: 500,
    color: 'rgba(50,25,10,0.60)',
    textDecoration: 'none',
    letterSpacing: '0.02em',
    transition: 'background 150ms ease',
    cursor: 'pointer',
  })

  const editorW = ED_SIZE * ED_PX

  return (
    <div
      ref={containerRef}
      onMouseDown={onCanvasMouseDown}
      onMouseMove={onCanvasMouseMove}
      onMouseUp={onCanvasMouseUp}
      onMouseLeave={onCanvasMouseUp}
      style={{
        position: 'relative', borderRadius: 20, overflow: 'hidden',
        background: '#f4f0ec',
        cursor: editorOpen ? 'default' : waterMode ? 'cell' : dragging ? 'grabbing' : 'grab',
        userSelect: 'none',
      }}
    >
      {/* Garden canvas */}
      <canvas
        ref={canvasRef}
        style={{
          position: 'absolute', inset: 0,
          width: '100%', height: '100%',
          imageRendering: 'pixelated',
          pointerEvents: 'none',
        }}
      />

      {/* Bottom buttons */}
      {!editorOpen && (
        <div style={{
          position: 'absolute', bottom: 20, left: 20, right: 20,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          pointerEvents: 'none',
        }}>
          <div style={{ display: 'flex', gap: 6, pointerEvents: 'auto' }}>
            <button
              onMouseDown={e => e.stopPropagation()}
              onClick={e => { e.stopPropagation(); setEditorOpen(true); setWaterMode(false) }}
              onMouseEnter={() => setAddHovered(true)}
              onMouseLeave={() => setAddHovered(false)}
              style={{ ...pill(addHovered) }}
            >
              + plant
            </button>
            <button
              onMouseDown={e => e.stopPropagation()}
              onClick={e => { e.stopPropagation(); setWaterMode(w => !w) }}
              onMouseEnter={() => setWaterHovered(true)}
              onMouseLeave={() => setWaterHovered(false)}
              style={{
                ...pill(waterHovered || waterMode),
                ...(waterMode ? {
                  background: 'rgba(60,130,210,0.14)',
                  border: '1px solid rgba(60,130,210,0.30)',
                  color: 'rgba(40,100,180,0.85)',
                } : {}),
              }}
            >
              💧 water
            </button>
          </div>
          <Link
            href="/about"
            onMouseDown={e => e.stopPropagation()}
            onMouseEnter={() => setLinkHovered(true)}
            onMouseLeave={() => setLinkHovered(false)}
            style={{ ...pill(linkHovered), pointerEvents: 'auto' }}
          >
            learn about me →
          </Link>
        </div>
      )}

      {/* Pixel editor overlay */}
      {editorOpen && (
        <div
          onMouseDown={e => e.stopPropagation()}
          style={{
            position: 'absolute', inset: 0,
            background: 'rgba(30,18,10,0.82)',
            backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>

            <p style={{
              fontFamily: "'General Sans', var(--font-dm-sans), sans-serif",
              fontSize: '0.65rem', fontWeight: 500,
              letterSpacing: '0.14em', textTransform: 'uppercase',
              color: 'rgba(255,210,165,0.72)', margin: 0,
            }}>
              draw your flower
            </p>

            {/* Canvas + grid overlay */}
            <div style={{ position: 'relative', lineHeight: 0 }}>
              <canvas
                ref={editorRef}
                width={ED_SIZE}
                height={ED_SIZE}
                style={{
                  width: editorW, height: editorW,
                  imageRendering: 'pixelated',
                  cursor: 'crosshair',
                  borderRadius: 4,
                  display: 'block',
                }}
                onMouseDown={e => { setIsPainting(true); paintAt(e) }}
                onMouseMove={e => { if (isPainting) paintAt(e) }}
                onMouseUp={() => setIsPainting(false)}
                onMouseLeave={() => setIsPainting(false)}
              />
              <svg
                width={editorW} height={editorW}
                style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}
              >
                {Array.from({ length: ED_SIZE - 1 }, (_, i) => (
                  <g key={i}>
                    <line x1={(i+1)*ED_PX} y1={0} x2={(i+1)*ED_PX} y2={editorW}
                      stroke="rgba(100,80,60,0.15)" strokeWidth="1" />
                    <line x1={0} y1={(i+1)*ED_PX} x2={editorW} y2={(i+1)*ED_PX}
                      stroke="rgba(100,80,60,0.15)" strokeWidth="1" />
                  </g>
                ))}
              </svg>
            </div>

            {/* Palette */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: `repeat(7, ${ED_PX}px)`,
              gap: 4,
            }}>
              {PALETTE.map(color => (
                <div
                  key={color}
                  onClick={() => { setSelectedColor(color); setTool('draw') }}
                  style={{
                    width: ED_PX, height: ED_PX,
                    background: color, borderRadius: 3, cursor: 'pointer',
                    outline: selectedColor === color && tool === 'draw'
                      ? '2px solid rgba(255,255,255,0.9)' : '2px solid transparent',
                    outlineOffset: 1,
                  }}
                />
              ))}
              <div
                onClick={() => setTool('erase')}
                style={{
                  width: ED_PX, height: ED_PX,
                  background: tool === 'erase' ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.08)',
                  borderRadius: 3, cursor: 'pointer',
                  outline: tool === 'erase' ? '2px solid rgba(255,255,255,0.9)' : '2px solid transparent',
                  outlineOffset: 1,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.48rem', color: 'rgba(255,255,255,0.55)',
                  letterSpacing: '0.04em', textTransform: 'uppercase',
                  fontFamily: "'General Sans', sans-serif",
                }}
              >
                er
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: 6 }}>
              <button
                onClick={plantFlower}
                style={{
                  padding: '9px 20px',
                  background: 'rgba(100,180,60,0.22)',
                  border: '1px solid rgba(120,200,70,0.45)',
                  borderRadius: 8,
                  color: 'rgba(180,240,100,0.90)',
                  fontFamily: "'General Sans', var(--font-dm-sans), sans-serif",
                  fontSize: '0.72rem', fontWeight: 500,
                  letterSpacing: '0.08em', textTransform: 'uppercase',
                  cursor: 'pointer',
                }}
              >
                plant it
              </button>
              <button
                onClick={clearEditor}
                style={{
                  padding: '9px 14px', background: 'transparent',
                  border: '1px solid rgba(255,255,255,0.12)', borderRadius: 8,
                  color: 'rgba(255,255,255,0.38)',
                  fontFamily: "'General Sans', var(--font-dm-sans), sans-serif",
                  fontSize: '0.72rem', cursor: 'pointer',
                }}
              >
                clear
              </button>
              <button
                onClick={() => setEditorOpen(false)}
                style={{
                  padding: '9px 14px', background: 'transparent',
                  border: '1px solid rgba(255,255,255,0.12)', borderRadius: 8,
                  color: 'rgba(255,255,255,0.38)',
                  fontFamily: "'General Sans', var(--font-dm-sans), sans-serif",
                  fontSize: '0.72rem', cursor: 'pointer',
                }}
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
