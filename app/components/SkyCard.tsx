'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'

// ── Types ─────────────────────────────────────────────────────────────────────
type Condition = 'golden-hour' | 'clear-morning' | 'clear-midday' | 'overcast' | 'rainy' | 'stormy' | 'night'
interface WeatherData { temp: number; code: number; sunrise: string; sunset: string }
interface SolarPos { elev: number; az: number }
interface CloudBlob { dx: number; dy: number; rx: number; ry: number; alpha: number }
interface Cloud { bx: number; by: number; speed: number; blobs: CloudBlob[] }
interface Star { x: number; y: number; r: number; phase: number; speed: number }
type RGB = [number, number, number]

// ── Solar position (NOAA simplified algorithm) ────────────────────────────────
function computeSolar(lat: number, lon: number, date: Date): SolarPos {
  const D2R = Math.PI / 180

  const JD = date.getTime() / 86400000 + 2440587.5
  const T  = (JD - 2451545.0) / 36525

  const L0 = ((280.46646 + T * (36000.76983 + T * 0.0003032)) % 360 + 360) % 360
  const M  = ((357.52911 + T * (35999.05029 - 0.0001537 * T)) % 360 + 360) % 360
  const Md = M * D2R

  const C   = Math.sin(Md) * (1.914602 - T * (0.004817 + 0.000014 * T))
            + Math.sin(2 * Md) * (0.019993 - 0.000101 * T)
            + Math.sin(3 * Md) * 0.000289
  const omega = 125.04 - 1934.136 * T
  const lam   = (L0 + C - 0.00569 - 0.00478 * Math.sin(omega * D2R)) * D2R

  const eps = (23.439291111 - T * (0.013004167 + T * (0.00000016389 - T * 0.00000050361))) * D2R
  const dec = Math.asin(Math.sin(eps) * Math.sin(lam))

  const e  = 0.016708634 - T * (0.000042037 + 0.0000001267 * T)
  const y  = Math.tan(eps / 2) ** 2
  const L0r = L0 * D2R
  const Mrd = M * D2R
  const EqT = 4 * (180 / Math.PI) * (
    y * Math.sin(2 * L0r)
    - 2 * e * Math.sin(Mrd)
    + 4 * e * y * Math.sin(Mrd) * Math.cos(2 * L0r)
    - 0.5 * y * y * Math.sin(4 * L0r)
    - 1.25 * e * e * Math.sin(2 * Mrd)
  )

  const utcMin = date.getUTCHours() * 60 + date.getUTCMinutes() + date.getUTCSeconds() / 60
  const HA     = ((utcMin + lon * 4 + EqT) / 4 - 180) * D2R

  const latR   = lat * D2R
  const sinElev = Math.sin(latR) * Math.sin(dec) + Math.cos(latR) * Math.cos(dec) * Math.cos(HA)
  const elev    = Math.asin(Math.max(-1, Math.min(1, sinElev))) * (180 / Math.PI)
  const az      = ((Math.atan2(
    -Math.cos(dec) * Math.sin(HA),
    Math.sin(dec) * Math.cos(latR) - Math.cos(dec) * Math.sin(latR) * Math.cos(HA),
  ) * (180 / Math.PI)) + 360) % 360

  return { elev, az }
}

// ── Sky colour model (physically inspired) ────────────────────────────────────
// Each entry: [solarElevDeg, horizonRGB, zenithRGB]
// horizon = bottom of card (most atmosphere), zenith = top (least atmosphere)
const SKY_TABLE: Array<[number, RGB, RGB]> = [
  [ 90, [185, 215, 248], [  8,  22,  90]],  // high noon: pale blue horizon, deep zenith
  [ 60, [175, 210, 250], [ 10,  30, 105]],
  [ 40, [162, 200, 246], [ 12,  38, 120]],
  [ 25, [188, 215, 246], [ 20,  52, 140]],
  [ 15, [220, 218, 205], [ 25,  60, 148]],
  [ 10, [242, 212, 168], [ 28,  62, 150]],  // warm cream horizon
  [  5, [248, 162,  52], [ 26,  46, 125]],  // golden amber
  [  2, [244, 108,  28], [ 32,  24, 100]],  // deep orange
  [  0, [228,  62,  16], [ 28,  16,  72]],  // horizon glows red-orange
  [ -2, [192,  38,  14], [ 22,  10,  50]],
  [ -6, [138,  18,  10], [ 14,   4,  24]],  // civil twilight, deep red
  [-12, [  58,   8,  14], [  5,   2,  10]], // nautical twilight
  [-18, [  14,   4,   6], [  1,   1,   3]], // astronomical twilight
  [-30, [   1,   2,   5], [  0,   1,   2]], // full night
]

function lerpRgb(a: RGB, b: RGB, t: number): RGB {
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t]
}

function getSkyPalette(solarElev: number): { horizon: RGB; zenith: RGB } {
  const table = SKY_TABLE
  if (solarElev >= table[0][0]) return { horizon: table[0][1], zenith: table[0][2] }
  const last = table[table.length - 1]
  if (solarElev <= last[0]) return { horizon: last[1], zenith: last[2] }
  for (let i = 0; i < table.length - 1; i++) {
    const [e1, h1, z1] = table[i]
    const [e2, h2, z2] = table[i + 1]
    if (solarElev <= e1 && solarElev >= e2) {
      const t = (solarElev - e1) / (e2 - e1)
      return { horizon: lerpRgb(h1, h2, t), zenith: lerpRgb(z1, z2, t) }
    }
  }
  return { horizon: last[1], zenith: last[2] }
}

// h: 0=horizon, 1=zenith
function skyColorAtH(h: number, pal: { horizon: RGB; zenith: RGB }): RGB {
  return lerpRgb(pal.horizon, pal.zenith, Math.pow(h, 0.55))
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function seededRng(seed: number) {
  let s = seed
  return () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646 }
}

function getCondition(code: number, sunrise: string, sunset: string): Condition {
  const now  = new Date()
  const rise = new Date(sunrise)
  const set  = new Date(sunset)
  if (now < rise || now > set) return 'night'
  const p = (now.getTime() - rise.getTime()) / (set.getTime() - rise.getTime())
  if (code >= 95)                               return 'stormy'
  if (code >= 51 && code <= 82)                 return 'rainy'
  if (code >= 3 || (code >= 45 && code <= 48))  return 'overcast'
  if (p < 0.13 || p > 0.87)                    return 'golden-hour'
  if (p < 0.35)                                 return 'clear-morning'
  return 'clear-midday'
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

// ── Geometry ──────────────────────────────────────────────────────────────────
const BASE_CLOUD_PX_PER_SEC = 8

function genClouds(weatherCode: number): Cloud[] {
  if (weatherCode === 0) return []
  const count = weatherCode >= 95 ? 10 : weatherCode >= 51 ? 8 : weatherCode >= 3 ? 7 : 3
  const alphaBase  = weatherCode >= 95 ? 0.52 : weatherCode >= 51 ? 0.38 : weatherCode >= 3 ? 0.28 : 0.10
  const alphaRange = weatherCode >= 95 ? 0.30 : weatherCode >= 51 ? 0.28 : weatherCode >= 3 ? 0.22 : 0.08

  const rng = seededRng(73)
  return Array.from({ length: count }, (): Cloud => ({
    bx:    rng(),
    by:    rng() * 0.60,
    speed: 0.4 + rng() * 0.8,
    blobs: Array.from({ length: 4 + Math.floor(rng() * 5) }, (): CloudBlob => ({
      dx:    (rng() - 0.5) * 0.30,
      dy:    (rng() - 0.5) * 0.09,
      rx:    0.06 + rng() * 0.14,
      ry:    0.03 + rng() * 0.06,
      alpha: alphaBase + rng() * alphaRange,
    })),
  }))
}

function genStars(): Star[] {
  const rng = seededRng(91)
  return Array.from({ length: 90 }, (): Star => ({
    x:     rng(),
    y:     rng() * 0.80,
    r:     0.5 + rng() * 1.5,
    phase: rng() * Math.PI * 2,
    speed: 0.8 + rng() * 2.0,
  }))
}

// ── Physics sky renderer ──────────────────────────────────────────────────────
function drawPhysicsSky(
  ctx:     CanvasRenderingContext2D,
  W:       number,
  H:       number,
  solar:   SolarPos,
  weather: WeatherData | null,
  clouds:  Cloud[],
  stars:   Star[],
  t:       number,
  mouse:   { x: number; y: number },
) {
  const code     = weather?.code ?? 0
  const isNight  = solar.elev < -0.5

  // ── 1. Sky gradient ─────────────────────────────────────────────────────────
  const pal = getSkyPalette(solar.elev)

  // Blend toward grey for cloud cover
  const greyMix = code >= 95 ? 0.82 : code >= 51 ? 0.68 : code >= 3 ? 0.58 : code >= 1 ? 0.08 : 0
  function applyOvercast(rgb: RGB): RGB {
    const lum = rgb[0] * 0.299 + rgb[1] * 0.587 + rgb[2] * 0.114
    const cap = code >= 95 ? 110 : code >= 51 ? 130 : 165
    const grey: RGB = [Math.min(lum * 0.88, cap), Math.min(lum * 0.88, cap), Math.min(lum * 0.92, cap + 5)]
    return lerpRgb(rgb, grey, greyMix)
  }

  const grad = ctx.createLinearGradient(0, 0, 0, H)
  for (let i = 0; i <= 14; i++) {
    const frac  = i / 14                                // 0=top, 1=bottom
    const skyH  = 1 - frac                             // 1=zenith, 0=horizon
    const [r, g, b] = applyOvercast(skyColorAtH(skyH, pal))
    grad.addColorStop(frac, `rgb(${Math.round(r)},${Math.round(g)},${Math.round(b)})`)
  }
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, W, H)

  // ── 2. Stars ─────────────────────────────────────────────────────────────────
  if (solar.elev < 5) {
    const starAlpha = Math.min(1, Math.max(0, (2 - solar.elev) / 22))
    if (starAlpha > 0.03) {
      ctx.filter = 'blur(1.5px)'
      stars.forEach(s => {
        const a = starAlpha * Math.max(0, 0.25 + Math.sin(t * s.speed + s.phase) * 0.50)
        ctx.fillStyle = `rgba(220,230,255,${a.toFixed(3)})`
        ctx.beginPath()
        ctx.arc(s.x * W, s.y * H * 0.85, s.r, 0, Math.PI * 2)
        ctx.fill()
      })
      ctx.filter = 'none'
    }
  }

  // ── 3. Moon ───────────────────────────────────────────────────────────────────
  if (isNight) {
    const mx    = W * 0.68
    const my    = H * 0.18
    const pulse = 1 + Math.sin(t * Math.PI * 2 / 9) * 0.04

    ctx.filter = 'blur(18px)'
    const halo = ctx.createRadialGradient(mx, my, 0, mx, my, W * 0.14 * pulse)
    halo.addColorStop(0,   'rgba(190,210,255,0.45)')
    halo.addColorStop(0.5, 'rgba(160,185,245,0.15)')
    halo.addColorStop(1,   'rgba(160,185,245,0)')
    ctx.fillStyle = halo
    ctx.beginPath(); ctx.arc(mx, my, W * 0.14 * pulse, 0, Math.PI * 2); ctx.fill()
    ctx.filter = 'none'

    const disc = ctx.createRadialGradient(mx, my, 0, mx, my, W * 0.036 * pulse)
    disc.addColorStop(0,   'rgba(235,242,255,0.96)')
    disc.addColorStop(0.6, 'rgba(205,218,255,0.82)')
    disc.addColorStop(1,   'rgba(180,200,250,0)')
    ctx.fillStyle = disc
    ctx.beginPath(); ctx.arc(mx, my, W * 0.036 * pulse, 0, Math.PI * 2); ctx.fill()
  }

  // ── 4. Sun + Mie scattering glow ─────────────────────────────────────────────
  if (!isNight) {
    // Project solar position onto canvas
    // Az: East=90°→left, South=180°→centre, West=270°→right (N.hemisphere, looking South)
    const sunX  = W * Math.max(0, Math.min(1, (solar.az - 90) / 180))
    const sunY  = H * Math.max(0.02, 1 - (solar.elev + 6) / 100)
    const pulse = 1 + Math.sin(t * Math.PI * 2 / 8) * 0.04

    const glowR = W * (solar.elev < 8 ? 0.55 : 0.28) * pulse

    // Glow RGB: white/warm at high elevation, amber→orange→red near horizon
    const [gR, gG, gB] = solar.elev < 0 ? [200, 50, 12]
      : solar.elev < 5  ? [248, 110, 25]
      : solar.elev < 15 ? [255, 175, 55]
      :                   [255, 238, 195]

    // Mie scattering halo — large radial gradient, no filter (gradients are already smooth)
    const glowGrad = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, glowR)
    const glowAlpha = solar.elev < 5 ? 0.75 : 0.45
    glowGrad.addColorStop(0,    `rgba(${gR},${gG},${gB},${glowAlpha})`)
    glowGrad.addColorStop(0.18, `rgba(${gR},${gG},${gB},${(glowAlpha * 0.50).toFixed(2)})`)
    glowGrad.addColorStop(0.50, `rgba(${gR},${gG},${gB},${(glowAlpha * 0.12).toFixed(2)})`)
    glowGrad.addColorStop(1,    `rgba(${gR},${gG},${gB},0)`)
    ctx.fillStyle = glowGrad
    ctx.fillRect(0, 0, W, H)

    // Sun disc
    if (solar.elev > -0.8) {
      const coreR = W * 0.022 * pulse
      const [cR, cG, cB] = solar.elev < 2  ? [255, 115, 25]
        : solar.elev < 10 ? [255, 218, 95]
        :                   [255, 252, 235]
      const core = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, coreR)
      core.addColorStop(0,   `rgba(${cR},${cG},${cB},1.0)`)
      core.addColorStop(0.5, `rgba(${cR},${cG},${cB},0.92)`)
      core.addColorStop(1,   `rgba(${cR},${cG},${cB},0)`)
      ctx.fillStyle = core
      ctx.beginPath(); ctx.arc(sunX, sunY, coreR, 0, Math.PI * 2); ctx.fill()
    }
  }

  // ── 5. Clouds ─────────────────────────────────────────────────────────────────
  if (clouds.length > 0) {
    const [cR, cG, cB] = code >= 95 ? [28, 30, 38] : code >= 51 ? [52, 56, 68] : code >= 3 ? [88, 92, 100] : [215, 220, 232]
    const blurPx = code >= 95 ? 32 : code >= 51 ? 28 : code >= 3 ? 26 : 22
    const px = (mouse.x - 0.5) * -24
    const py = (mouse.y - 0.5) * -12

    ctx.filter = `blur(${blurPx}px)`
    clouds.forEach(cloud => {
      const scrollX = (cloud.bx + (t * BASE_CLOUD_PX_PER_SEC * cloud.speed) / W) % 1.0
      for (const wrap of [0, 1] as const) {
        const baseX = (scrollX + wrap) * W + px
        if (baseX < -W * 0.7 || baseX > W * 1.7) continue
        cloud.blobs.forEach(blob => {
          ctx.fillStyle = `rgba(${cR},${cG},${cB},${blob.alpha.toFixed(3)})`
          ctx.beginPath()
          ctx.ellipse(baseX + blob.dx * W, cloud.by * H + blob.dy * H + py, blob.rx * W, blob.ry * H, 0, 0, Math.PI * 2)
          ctx.fill()
        })
      }
    })
    ctx.filter = 'none'
  }

  // ── 6. Horizon haze ───────────────────────────────────────────────────────────
  const [hR, hG, hB] = isNight ? [4, 7, 18] : solar.elev < 5 ? [115, 55, 18] : [190, 215, 238]
  const hazeGrad = ctx.createLinearGradient(0, H * 0.72, 0, H)
  hazeGrad.addColorStop(0,   `rgba(${hR},${hG},${hB},0)`)
  hazeGrad.addColorStop(1,   `rgba(${hR},${hG},${hB},${isNight ? 0.22 : 0.14})`)
  ctx.fillStyle = hazeGrad
  ctx.fillRect(0, H * 0.72, W, H * 0.28)
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function SkyCard() {
  const canvasRef    = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const mouseRef     = useRef({ x: 0.5, y: 0.5 })

  const [weather,     setWeather]     = useState<WeatherData | null>(null)
  const [location,    setLocation]    = useState({ lat: 42.36, lon: -71.06 })
  const [linkHovered, setLinkHovered] = useState(false)
  const [tilt,        setTilt]        = useState({ rx: 0, ry: 0 })
  const [hovered,     setHovered]     = useState(false)

  useEffect(() => {
    function fetchW(lat: number, lon: number) {
      setLocation({ lat, lon })
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

  const condition: Condition = weather
    ? getCondition(weather.code, weather.sunrise, weather.sunset)
    : 'clear-midday'

  const clouds = useMemo(() => genClouds(weather?.code ?? 0), [weather?.code])
  const stars  = useMemo(() => genStars(), [])

  useEffect(() => {
    const canvas    = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return

    const start = performance.now()
    let raf = 0, last = 0

    const syncSize = () => {
      const r   = container.getBoundingClientRect()
      const dpr = Math.min(window.devicePixelRatio ?? 1, 2)
      canvas.width  = Math.max(1, Math.round(r.width  * dpr))
      canvas.height = Math.max(1, Math.round(r.height * dpr))
      const ctx = canvas.getContext('2d')
      if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    const ro = new ResizeObserver(syncSize)
    ro.observe(container)
    syncSize()

    const loop = (now: number) => {
      raf = requestAnimationFrame(loop)
      if (now - last < 33) return
      last = now
      const ctx = canvas.getContext('2d')
      if (!ctx || canvas.width === 0) return
      const dpr   = Math.min(window.devicePixelRatio ?? 1, 2)
      const W     = canvas.width  / dpr
      const H     = canvas.height / dpr
      const t     = (now - start) / 1000
      const solar = computeSolar(location.lat, location.lon, new Date())
      drawPhysicsSky(ctx, W, H, solar, weather, clouds, stars, t, mouseRef.current)
    }

    raf = requestAnimationFrame(loop)
    return () => { cancelAnimationFrame(raf); ro.disconnect() }
  }, [location, weather, clouds, stars])

  const onMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect()
    mouseRef.current = { x: (e.clientX - r.left) / r.width, y: (e.clientY - r.top) / r.height }
    setTilt({ rx: ((e.clientY - r.top) / r.height - 0.5) * -6, ry: ((e.clientX - r.left) / r.width - 0.5) * 6 })
  }

  const darkSky = condition === 'night' || condition === 'stormy' || condition === 'rainy'

  return (
    <div
      ref={containerRef}
      onMouseMove={onMouseMove}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => {
        setHovered(false)
        setTilt({ rx: 0, ry: 0 })
        mouseRef.current = { x: 0.5, y: 0.5 }
      }}
      style={{
        position: 'relative',
        borderRadius: 20,
        overflow: 'hidden',
        transform: `perspective(900px) rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg)`,
        transition: hovered ? 'transform 80ms linear' : 'transform 600ms cubic-bezier(0.16,1,0.3,1)',
        willChange: 'transform',
        background: '#1848b8',
      }}
    >
      <canvas
        ref={canvasRef}
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', display: 'block' }}
      />

      {/* Tilt shine */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: `radial-gradient(circle at ${50 - tilt.ry * 4}% ${50 + tilt.rx * 4}%, rgba(255,240,200,0.04) 0%, transparent 55%)`,
        transition: hovered ? 'background 80ms linear' : 'background 600ms ease',
      }} />

      {/* Bottom overlay */}
      <div style={{
        position: 'absolute', bottom: 20, left: 20, right: 20,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10,
      }}>
        <div style={{
          background: darkSky ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.13)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          border: darkSky ? '1px solid rgba(255,255,255,0.13)' : '1px solid rgba(0,0,0,0.09)',
          borderRadius: 100, padding: '6px 14px',
        }}>
          <span style={{
            fontFamily: "'General Sans', var(--font-dm-sans), sans-serif",
            fontSize: '0.68rem', fontWeight: 500,
            color: darkSky ? 'rgba(210,225,240,0.85)' : 'rgba(30,15,5,0.60)',
            letterSpacing: '0.03em',
          }}>
            {weather ? `${LABELS[condition]} · ${weather.temp}°F` : '—'}
          </span>
        </div>

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
            borderRadius: 100, padding: '10px 20px',
            fontFamily: "'General Sans', var(--font-dm-sans), sans-serif",
            fontSize: '0.78rem', fontWeight: 500,
            color: 'rgba(253,240,220,0.92)',
            textDecoration: 'none', letterSpacing: '0.02em', flexShrink: 0,
            transition: 'background 160ms ease, border-color 160ms ease',
          }}
        >
          Learn about me →
        </Link>
      </div>
    </div>
  )
}
