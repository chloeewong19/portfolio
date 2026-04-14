'use client'

import { useEffect, useRef, useState } from 'react'

// Ordered 4×4 Bayer matrix (values 0-15)
const BAYER4 = [
  [ 0,  8,  2, 10],
  [12,  4, 14,  6],
  [ 3, 11,  1,  9],
  [15,  7, 13,  5],
]

export default function DitherCard() {
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef    = useRef<HTMLCanvasElement>(null)
  const cellSizeRef  = useRef(3)
  const levelsRef    = useRef(6)

  const [localTime, setLocalTime] = useState('')
  const [hovered,   setHovered]   = useState(false)
  const [cellSize,  setCellSize]  = useState(3)
  const [levels,    setLevels]    = useState(6)

  // Live Boston time
  useEffect(() => {
    const update = () =>
      setLocalTime(new Date().toLocaleTimeString('en-US', {
        timeZone: 'America/New_York',
        hour: '2-digit', minute: '2-digit', second: '2-digit',
      }))
    update()
    const id = setInterval(update, 1000)
    return () => clearInterval(id)
  }, [])

  // Sync slider state → render refs (no effect re-run needed)
  useEffect(() => { cellSizeRef.current = cellSize }, [cellSize])
  useEffect(() => { levelsRef.current  = levels    }, [levels])

  // Dither canvas — runs once
  useEffect(() => {
    const container = containerRef.current
    const canvas    = canvasRef.current
    if (!container || !canvas) return

    const SCALE = 5   // render at 1/SCALE, CSS upscale pixelated

    // Capture non-null canvas ref as a local so inner closures can use it without null checks
    const cvs = canvas

    let raf    = 0
    let lastTs = 0
    const mouse   = { x: 0.5, y: 0.5 }
    let srcData: ImageData | null = null
    let srcW = 0, srcH = 0

    // ── Load source image ──────────────────────────────────────────
    const img = new Image()
    img.src = '/images/dither/flowers.jpg'

    function buildSrc() {
      if (!img.complete || img.naturalWidth === 0) return
      const W = cvs.width
      const H = cvs.height
      if (W === 0 || H === 0) return

      const tmp = document.createElement('canvas')
      tmp.width  = W
      tmp.height = H
      const tCtx = tmp.getContext('2d')
      if (!tCtx) return

      // Cover-fit the image
      const scale = Math.max(W / img.naturalWidth, H / img.naturalHeight)
      const sw = img.naturalWidth  * scale
      const sh = img.naturalHeight * scale
      tCtx.drawImage(img, (W - sw) / 2, (H - sh) / 2, sw, sh)

      srcData = tCtx.getImageData(0, 0, W, H)
      srcW = W
      srcH = H
    }

    img.onload = buildSrc

    // ── Mouse parallax ─────────────────────────────────────────────
    const onMouseMove = (e: MouseEvent) => {
      const r = container.getBoundingClientRect()
      mouse.x = (e.clientX - r.left) / r.width
      mouse.y = (e.clientY - r.top)  / r.height
    }
    container.addEventListener('mousemove', onMouseMove)

    // ── Resize ─────────────────────────────────────────────────────
    const syncSize = () => {
      const { width, height } = container.getBoundingClientRect()
      canvas.width  = Math.max(1, Math.floor(width  / SCALE))
      canvas.height = Math.max(1, Math.floor(height / SCALE))
      buildSrc()
    }
    const ro = new ResizeObserver(syncSize)
    ro.observe(container)
    syncSize()

    // ── Render loop ────────────────────────────────────────────────
    const render = (ts: number) => {
      raf = requestAnimationFrame(render)
      if (ts - lastTs < 48) return   // ~20 fps
      lastTs = ts
      if (!srcData) return

      const ctx = canvas.getContext('2d')
      if (!ctx) return

      const W      = canvas.width
      const H      = canvas.height
      const CELL   = cellSizeRef.current
      const LEVELS = levelsRef.current
      const PAR_X  = Math.round((mouse.x - 0.5) * 14)
      const PAR_Y  = Math.round((mouse.y - 0.5) * 10)

      const out = ctx.createImageData(W, H)
      const od  = out.data
      const sd  = srcData.data

      for (let cy = 0; cy < H; cy += CELL) {
        for (let cx = 0; cx < W; cx += CELL) {

          // Sample center of cell with parallax offset
          const sx = Math.min(srcW - 1, Math.max(0, cx + (CELL >> 1) + PAR_X))
          const sy = Math.min(srcH - 1, Math.max(0, cy + (CELL >> 1) + PAR_Y))
          const si = (sy * srcW + sx) * 4

          const r0 = sd[si]
          const g0 = sd[si + 1]
          const b0 = sd[si + 2]

          // Bayer threshold normalised to [0, 1)
          const bx = Math.floor(cx / CELL) % 4
          const by = Math.floor(cy / CELL) % 4
          const bt = BAYER4[by][bx] / 16

          // Quantise each channel independently
          const r = Math.round(Math.min(LEVELS, Math.floor(r0 / 255 * LEVELS + bt)) / LEVELS * 255)
          const g = Math.round(Math.min(LEVELS, Math.floor(g0 / 255 * LEVELS + bt)) / LEVELS * 255)
          const b = Math.round(Math.min(LEVELS, Math.floor(b0 / 255 * LEVELS + bt)) / LEVELS * 255)

          // Fill cell
          for (let dy = 0; dy < CELL && cy + dy < H; dy++) {
            for (let dx = 0; dx < CELL && cx + dx < W; dx++) {
              const i = ((cy + dy) * W + (cx + dx)) * 4
              od[i]     = r
              od[i + 1] = g
              od[i + 2] = b
              od[i + 3] = 255
            }
          }
        }
      }

      ctx.putImageData(out, 0, 0)
    }

    raf = requestAnimationFrame(render)

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      container.removeEventListener('mousemove', onMouseMove)
    }
  }, [])

  // ── Slider label style ─────────────────────────────────────────
  const sliderLabel: React.CSSProperties = {
    fontFamily: "'General Sans', var(--font-dm-sans), sans-serif",
    fontSize: '0.58rem',
    fontWeight: 500,
    letterSpacing: '0.10em',
    textTransform: 'uppercase',
    color: 'rgba(255, 210, 165, 0.65)',
    width: 34,
    flexShrink: 0,
  }
  const sliderValue: React.CSSProperties = {
    fontFamily: "'General Sans', var(--font-dm-sans), sans-serif",
    fontSize: '0.58rem',
    color: 'rgba(255, 210, 165, 0.42)',
    width: 16,
    textAlign: 'right',
    flexShrink: 0,
  }

  return (
    <div
      ref={containerRef}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ position: 'relative', borderRadius: 20, overflow: 'hidden', background: '#2a1c10' }}
    >
      {/* Dither canvas */}
      <canvas
        ref={canvasRef}
        style={{
          position: 'absolute', inset: 0,
          width: '100%', height: '100%',
          imageRendering: 'pixelated',
        }}
      />

      {/* ── Hover control panel ── */}
      <div
        style={{
          position: 'absolute', top: 16, left: 16, right: 16,
          background: 'rgba(14, 9, 5, 0.70)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          border: '1px solid rgba(255, 255, 255, 0.09)',
          borderRadius: 12,
          padding: '13px 18px',
          opacity: hovered ? 1 : 0,
          pointerEvents: hovered ? 'auto' : 'none',
          transition: 'opacity 200ms ease',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>

          {/* Grain */}
          <label style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={sliderLabel}>grain</span>
            <input
              type="range" min={1} max={8} step={1} value={cellSize}
              aria-label="Grain size"
              onChange={e => setCellSize(Number(e.target.value))}
              style={{ flex: 1, accentColor: 'rgba(255,210,165,0.7)', cursor: 'pointer', height: 2 }}
            />
            <span style={sliderValue}>{cellSize}</span>
          </label>

          {/* Depth */}
          <label style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={sliderLabel}>depth</span>
            <input
              type="range" min={2} max={16} step={1} value={levels}
              aria-label="Colour depth"
              onChange={e => setLevels(Number(e.target.value))}
              style={{ flex: 1, accentColor: 'rgba(255,210,165,0.7)', cursor: 'pointer', height: 2 }}
            />
            <span style={sliderValue}>{levels}</span>
          </label>
        </div>
      </div>

      {/* ── Glassmorphic text box — bottom ── */}
      <div
        style={{
          position: 'absolute', bottom: 20, left: 20, right: 20,
          background: 'rgba(14, 9, 5, 0.58)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          border: '1px solid rgba(255, 255, 255, 0.09)',
          borderRadius: 14,
          padding: '20px 22px 16px',
        }}
      >
        <p
          style={{
            fontFamily: 'var(--font-cormorant), Georgia, serif',
            fontWeight: 300, fontStyle: 'italic',
            fontSize: 'clamp(1.15rem, 2vw, 1.60rem)',
            lineHeight: 1.32,
            color: 'rgba(255, 246, 232, 0.96)',
            letterSpacing: '-0.01em',
            margin: '0 0 14px',
          }}
        >
          Chloe is a product designer and engineer studying at Tufts.
        </p>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 8 }}>
          <span style={{
            fontFamily: "'General Sans', var(--font-dm-sans), sans-serif",
            fontSize: '0.70rem',
            color: 'rgba(255, 210, 165, 0.82)',
            letterSpacing: '0.03em',
          }}>
            Incoming @ EY Data &amp; AI
          </span>
          <span style={{
            fontFamily: "'General Sans', var(--font-dm-sans), sans-serif",
            fontSize: '0.68rem',
            color: 'rgba(255, 210, 165, 0.52)',
            letterSpacing: '0.03em',
            fontVariantNumeric: 'tabular-nums',
          }}>
            Boston · {localTime || '—:—:—'}
          </span>
        </div>
      </div>
    </div>
  )
}
