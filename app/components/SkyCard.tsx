'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'

// ── Types ─────────────────────────────────────────────────────────────────────
type Condition = 'golden-hour' | 'clear-morning' | 'clear-midday' | 'overcast' | 'rainy' | 'stormy' | 'night'

interface WeatherData { temp: number; code: number; sunrise: string; sunset: string }
interface Palette {
  sky:       string[]
  strokes:   string[]
  sun:       { x: number; y: number; color: string; r: number } | null
  hasClouds: boolean
  isNight:   boolean
}
interface Stroke { x: number; y: number; w: number; h: number; angle: number; ci: number; base: number; phase: number; spd: number }
interface Blob   { dx: number; dy: number; rx: number; ry: number; ci: number; alpha: number }
interface Cloud  { bx: number; by: number; speed: number; blobs: Blob[] }
interface Star   { x: number; y: number; r: number; phase: number; spd: number }

// ── Palettes ─────────────────────────────────────────────────────────────────
const PALETTES: Record<Condition, Palette> = {
  'golden-hour': {
    sky:       ['#3b1060', '#8c2060', '#d44830', '#f07820', '#f8b840'],
    strokes:   ['#e06030', '#d04060', '#b83080', '#f08838', '#c84870', '#a82890'],
    sun:       { x: 0.62, y: 0.72, color: '#ffe060', r: 18 },
    hasClouds: false, isNight: false,
  },
  'clear-morning': {
    sky:       ['#b880b8', '#d8a0b8', '#f0c0a0', '#f8d8c0', '#fce8d8'],
    strokes:   ['#f4b898', '#eca8a8', '#e8a0c0', '#d890c8', '#c880c0', '#f0c0b0'],
    sun:       { x: 0.22, y: 0.72, color: '#ffe8a0', r: 14 },
    hasClouds: false, isNight: false,
  },
  'clear-midday': {
    sky:       ['#1060a8', '#2880c8', '#60a8e0', '#98c8f0', '#c0dcf8'],
    strokes:   ['#78b8e0', '#98c8ec', '#b0d4f4', '#60a8d8', '#88bce8', '#a8cef0'],
    sun:       { x: 0.55, y: 0.12, color: '#fffff0', r: 16 },
    hasClouds: false, isNight: false,
  },
  'overcast': {
    sky:       ['#606870', '#787e88', '#8c9098', '#9ca0a8', '#adb0b5'],
    strokes:   ['#788088', '#808890', '#888ea0', '#788898', '#88909a', '#909aa2'],
    sun:       null,
    hasClouds: true, isNight: false,
  },
  'rainy': {
    sky:       ['#343a46', '#424a58', '#505a68', '#5c6470', '#686e78'],
    strokes:   ['#505860', '#585e6a', '#606870', '#4c5460', '#585c68', '#606470'],
    sun:       null,
    hasClouds: true, isNight: false,
  },
  'stormy': {
    sky:       ['#1a1c28', '#202430', '#262c3a', '#2e3440', '#353c44'],
    strokes:   ['#262c38', '#2e3440', '#1e2830', '#262e38', '#2c3240', '#1e2a32'],
    sun:       null,
    hasClouds: true, isNight: false,
  },
  'night': {
    sky:       ['#03050e', '#050818', '#080c22', '#0a0e28', '#0c122e'],
    strokes:   ['#080c1a', '#0a1022', '#060a16', '#0c1028', '#08101e', '#0a0e1c'],
    sun:       null,
    hasClouds: false, isNight: true,
  },
}

const LABELS: Record<Condition, string> = {
  'golden-hour':   'Golden hour',
  'clear-morning': 'Clear morning',
  'clear-midday':  'Clear sky',
  'overcast':      'Overcast',
  'rainy':         'Rainy',
  'stormy':        'Stormy',
  'night':         'Clear night',
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function seededRng(seed: number) {
  let s = seed
  return () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646 }
}

function hex(color: string, a: number) {
  const n = parseInt(color.slice(1), 16)
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a.toFixed(3)})`
}

function getCondition(code: number, sunrise: string, sunset: string): Condition {
  const now  = new Date()
  const rise = new Date(sunrise)
  const set  = new Date(sunset)
  if (now < rise || now > set) return 'night'
  const p = (now.getTime() - rise.getTime()) / (set.getTime() - rise.getTime())
  if (code >= 95)                          return 'stormy'
  if (code >= 51 && code <= 82)            return 'rainy'
  if (code >= 3  || (code >= 45 && code <= 48)) return 'overcast'
  if (p < 0.13 || p > 0.87)               return 'golden-hour'
  if (p < 0.35)                            return 'clear-morning'
  return 'clear-midday'
}

// ── Geometry generators ───────────────────────────────────────────────────────
function genStrokes(pal: Palette): Stroke[] {
  const rng = seededRng(42)
  return Array.from({ length: 360 }, () => ({
    x: rng(), y: rng(),
    w: 0.018 + rng() * 0.055,
    h: 0.003 + rng() * 0.007,
    angle: (rng() - 0.5) * 0.5,
    ci: Math.floor(rng() * pal.strokes.length),
    base:  0.05 + rng() * 0.17,
    phase: rng() * Math.PI * 2,
    spd:   0.3 + rng() * 0.7,
  }))
}

function genClouds(pal: Palette): Cloud[] {
  if (!pal.hasClouds) return []
  const rng  = seededRng(73)
  const n    = pal === PALETTES.stormy ? 8 : pal === PALETTES.overcast ? 6 : 5
  return Array.from({ length: n }, () => {
    const blobs = Math.floor(5 + rng() * 7)
    return {
      bx:    rng(),
      by:    rng() * 0.50,
      speed: 0.25 + rng() * 0.45,
      blobs: Array.from({ length: blobs }, () => ({
        dx: (rng() - 0.5) * 0.20,
        dy: (rng() - 0.5) * 0.06,
        rx: 0.04 + rng() * 0.10,
        ry: 0.025 + rng() * 0.040,
        ci:    Math.floor(rng() * pal.strokes.length),
        alpha: 0.12 + rng() * 0.20,
      })),
    }
  })
}

function genStars(): Star[] {
  const rng = seededRng(91)
  return Array.from({ length: 80 }, () => ({
    x: rng(), y: rng() * 0.85,
    r: 0.4 + rng() * 1.5,
    phase: rng() * Math.PI * 2,
    spd:   0.8 + rng() * 2.2,
  }))
}

// ── Renderer ──────────────────────────────────────────────────────────────────
function drawFrame(
  ctx:     CanvasRenderingContext2D,
  W: number, H: number,
  pal:     Palette,
  strokes: Stroke[],
  clouds:  Cloud[],
  stars:   Star[],
  t:       number,
) {
  ctx.clearRect(0, 0, W, H)

  // 1 · Sky gradient
  const grad = ctx.createLinearGradient(0, 0, 0, H)
  pal.sky.forEach((c, i) => grad.addColorStop(i / (pal.sky.length - 1), c))
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, W, H)

  // 2 · Soft horizontal atmosphere bands
  for (let i = 0; i < 10; i++) {
    const y  = (i / 10) * H
    const c  = pal.strokes[i % pal.strokes.length]
    const a  = 0.022 + Math.sin(t * 0.14 + i * 0.9) * 0.010
    const g2 = ctx.createLinearGradient(0, y, 0, y + H * 0.13)
    g2.addColorStop(0, hex(c, a))
    g2.addColorStop(1, hex(c, 0))
    ctx.fillStyle = g2
    ctx.fillRect(0, y, W, H * 0.13)
  }

  // 3 · Sun glow
  if (pal.sun) {
    const sx    = pal.sun.x * W
    const sy    = pal.sun.y * H
    const pulse = 1 + Math.sin(t * 0.38) * 0.04
    const glowR = pal.sun.r * 13 * pulse
    const sg    = ctx.createRadialGradient(sx, sy, 0, sx, sy, glowR)
    sg.addColorStop(0,    hex(pal.sun.color, 0.92))
    sg.addColorStop(0.08, hex(pal.sun.color, 0.55))
    sg.addColorStop(0.30, hex(pal.sun.color, 0.14))
    sg.addColorStop(1,    hex(pal.sun.color, 0))
    ctx.fillStyle = sg
    ctx.fillRect(sx - glowR, sy - glowR, glowR * 2, glowR * 2)
  }

  // 4 · Clouds (drawn twice for seamless wrap)
  clouds.forEach(cloud => {
    const xNorm = (cloud.bx + t * cloud.speed * 0.014) % 1.0
    for (const xOff of [0, 1] as const) {
      const cx = (xNorm + xOff) * W
      if (cx < -W * 0.45 || cx > W * 1.45) continue
      cloud.blobs.forEach(blob => {
        const bx  = cx + blob.dx * W
        const by  = cloud.by * H + blob.dy * H
        const rx  = blob.rx * W
        const ry  = blob.ry * H
        const rg  = ctx.createRadialGradient(bx, by, 0, bx, by, Math.max(rx, ry))
        rg.addColorStop(0, hex(pal.strokes[blob.ci], blob.alpha))
        rg.addColorStop(1, hex(pal.strokes[blob.ci], 0))
        ctx.beginPath()
        ctx.ellipse(bx, by, rx, ry, 0, 0, Math.PI * 2)
        ctx.fillStyle = rg
        ctx.fill()
      })
    }
  })

  // 5 · Brushstrokes
  strokes.forEach(s => {
    const a = Math.max(0, s.base + Math.sin(t * s.spd + s.phase) * 0.04)
    ctx.save()
    ctx.translate(s.x * W, s.y * H)
    ctx.rotate(s.angle)
    ctx.fillStyle = hex(pal.strokes[s.ci], a)
    ctx.fillRect(-(s.w * W) / 2, -(s.h * H) / 2, s.w * W, s.h * H)
    ctx.restore()
  })

  // 6 · Stars
  if (pal.isNight) {
    stars.forEach(star => {
      const a = Math.max(0, 0.28 + Math.sin(t * star.spd + star.phase) * 0.38)
      ctx.beginPath()
      ctx.arc(star.x * W, star.y * H, star.r, 0, Math.PI * 2)
      ctx.fillStyle = `rgba(255,255,255,${a.toFixed(3)})`
      ctx.fill()
    })
    // faint moon
    const mg = ctx.createRadialGradient(W * 0.78, H * 0.18, 0, W * 0.78, H * 0.18, 28)
    mg.addColorStop(0,   'rgba(230,235,255,0.88)')
    mg.addColorStop(0.6, 'rgba(200,210,255,0.20)')
    mg.addColorStop(1,   'rgba(200,210,255,0)')
    ctx.fillStyle = mg
    ctx.fillRect(W * 0.78 - 28, H * 0.18 - 28, 56, 56)
  }
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function SkyCard() {
  const canvasRef    = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [weather,     setWeather]     = useState<WeatherData | null>(null)
  const [linkHovered, setLinkHovered] = useState(false)
  const [tilt,        setTilt]        = useState({ rx: 0, ry: 0 })
  const [hovered,     setHovered]     = useState(false)

  // Fetch weather (geolocation → Boston fallback)
  useEffect(() => {
    function fetchW(lat: number, lon: number) {
      fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
        `&current=temperature_2m,weather_code&daily=sunrise,sunset` +
        `&temperature_unit=fahrenheit&timezone=auto&forecast_days=1`
      ).then(r => r.json()).then(d => setWeather({
        temp:    Math.round(d.current.temperature_2m),
        code:    d.current.weather_code,
        sunrise: d.daily.sunrise[0],
        sunset:  d.daily.sunset[0],
      })).catch(() => {})
    }
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        ({ coords }) => fetchW(coords.latitude, coords.longitude),
        ()           => fetchW(42.36, -71.06),
      )
    } else {
      fetchW(42.36, -71.06)
    }
  }, [])

  const condition = weather
    ? getCondition(weather.code, weather.sunrise, weather.sunset)
    : 'clear-midday'

  const pal     = PALETTES[condition]
  const strokes = useMemo(() => genStrokes(pal),   [condition]) // eslint-disable-line react-hooks/exhaustive-deps
  const clouds  = useMemo(() => genClouds(pal),    [condition]) // eslint-disable-line react-hooks/exhaustive-deps
  const stars   = useMemo(() => genStars(),         [])

  // Canvas animation loop
  useEffect(() => {
    const canvas    = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return

    const start = performance.now()
    let raf = 0, last = 0

    const syncSize = () => {
      const r      = container.getBoundingClientRect()
      canvas.width  = Math.floor(r.width)
      canvas.height = Math.floor(r.height)
    }
    const ro = new ResizeObserver(syncSize)
    ro.observe(container)
    syncSize()

    const loop = (now: number) => {
      raf = requestAnimationFrame(loop)
      if (now - last < 50) return // ~20 fps
      last = now
      const ctx = canvas.getContext('2d')
      if (!ctx || canvas.width === 0) return
      drawFrame(ctx, canvas.width, canvas.height, pal, strokes, clouds, stars, (now - start) / 1000)
    }
    raf = requestAnimationFrame(loop)
    return () => { cancelAnimationFrame(raf); ro.disconnect() }
  }, [pal, strokes, clouds, stars])

  const onMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect()
    setTilt({
      rx: ((e.clientY - r.top)  / r.height - 0.5) * -6,
      ry: ((e.clientX - r.left) / r.width  - 0.5) *  6,
    })
  }

  const darkSky = condition === 'night' || condition === 'stormy' || condition === 'rainy'

  return (
    <div
      ref={containerRef}
      onMouseMove={onMouseMove}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); setTilt({ rx: 0, ry: 0 }) }}
      style={{
        position: 'relative',
        borderRadius: 20,
        overflow: 'hidden',
        transform: `perspective(900px) rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg)`,
        transition: hovered
          ? 'transform 80ms linear'
          : 'transform 600ms cubic-bezier(0.16,1,0.3,1)',
        willChange: 'transform',
      }}
    >
      <canvas
        ref={canvasRef}
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', display: 'block' }}
      />

      {/* Tilt shine */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: `radial-gradient(circle at ${50 - tilt.ry * 4}% ${50 + tilt.rx * 4}%, rgba(255,240,200,0.06) 0%, transparent 55%)`,
        transition: hovered ? 'background 80ms linear' : 'background 600ms ease',
      }} />

      {/* Bottom overlay */}
      <div style={{
        position: 'absolute', bottom: 20, left: 20, right: 20,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        gap: 10,
      }}>
        {/* Condition + temp pill */}
        <div style={{
          background: darkSky ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.14)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          border: darkSky ? '1px solid rgba(255,255,255,0.14)' : '1px solid rgba(0,0,0,0.10)',
          borderRadius: 100,
          padding: '6px 14px',
        }}>
          <span style={{
            fontFamily: "'General Sans', var(--font-dm-sans), sans-serif",
            fontSize: '0.68rem', fontWeight: 500,
            color: darkSky ? 'rgba(210,225,240,0.85)' : 'rgba(30,15,5,0.65)',
            letterSpacing: '0.03em',
          }}>
            {weather ? `${LABELS[condition]} · ${weather.temp}°F` : '—'}
          </span>
        </div>

        {/* Learn about me */}
        <Link
          href="/about"
          onMouseEnter={() => setLinkHovered(true)}
          onMouseLeave={() => setLinkHovered(false)}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            background: linkHovered ? 'rgba(255,255,255,0.22)' : 'rgba(255,255,255,0.13)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            border: linkHovered ? '1px solid rgba(255,255,255,0.32)' : '1px solid rgba(255,255,255,0.20)',
            borderRadius: 100,
            padding: '10px 20px',
            fontFamily: "'General Sans', var(--font-dm-sans), sans-serif",
            fontSize: '0.78rem', fontWeight: 500,
            color: 'rgba(253,240,220,0.92)',
            textDecoration: 'none',
            letterSpacing: '0.02em',
            flexShrink: 0,
            transition: 'background 160ms ease, border-color 160ms ease',
          }}
        >
          Learn about me →
        </Link>
      </div>
    </div>
  )
}
