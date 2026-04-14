'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'

interface Blob {
  baseX: number
  baseY: number
  sp: number
  ph: number
  rgb: string
  alpha: number
  stop: number
  mw: number   // mouse attraction weight
}

// Warm gold/amber/rose bleeding into deep wine/terracotta
const BLOBS: Blob[] = [
  { baseX: 0.2,  baseY: 0.38, sp: 0.26, ph: 0,   rgb: '220,158, 72', alpha: 0.7,  stop: 54, mw: 0.12 },
  { baseX: 0.7,  baseY: 0.55, sp: 0.19, ph: 2.1,  rgb: '188, 96,114', alpha: 0.65, stop: 48, mw: 0.1 },
  { baseX: 0.48, baseY: 0.2,  sp: 0.31, ph: 4.2,  rgb: '210,120, 70', alpha: 0.55, stop: 52, mw: 0.07 },
  { baseX: 0.76, baseY: 0.72, sp: 0.14, ph: 1.5,  rgb: ' 80, 28, 42', alpha: 0.92, stop: 56, mw: 0.04 },
  { baseX: 0.16, baseY: 0.76, sp: 0.21, ph: 3,    rgb: ' 52, 24, 12', alpha: 0.9,  stop: 52, mw: 0.03 },
  { baseX: 0.52, baseY: 0.54, sp: 0.17, ph: 5.1,  rgb: ' 96, 38, 22', alpha: 0.85, stop: 48, mw: 0.05 },
]

export default function MeshCard() {
  const bgRef    = useRef<HTMLDivElement>(null)
  const mouseRef = useRef({ x: 0.5, y: 0.5 })
  const [hovered, setHovered] = useState(false)
  const [tilt,    setTilt]    = useState({ rx: 0, ry: 0 })
  const [linkHovered, setLinkHovered] = useState(false)

  // Gradient + parallax animation loop
  useEffect(() => {
    const el = bgRef.current
    if (!el) return

    const start = performance.now()
    let raf = 0

    const render = () => {
      const t  = (performance.now() - start) / 3800
      const mx = mouseRef.current.x - 0.5
      const my = mouseRef.current.y - 0.5

      const parts = BLOBS.map(b => {
        const x = (b.baseX + Math.sin(t * b.sp + b.ph) * 0.13 + mx * b.mw) * 100
        const y = (b.baseY
                + Math.cos(t * b.sp * 1.3 + b.ph) * 0.1
                + Math.sin(t * b.sp * 0.4 + b.ph + 1.2) * 0.05
                + my * b.mw) * 100
        const a = (b.alpha * (1 + Math.sin(t * b.sp * 0.6 + b.ph) * 0.06)).toFixed(2)
        return `radial-gradient(ellipse at ${x.toFixed(1)}% ${y.toFixed(1)}%, rgba(${b.rgb},${a}) 0%, transparent ${b.stop}%)`
      })

      // Warm spotlight under cursor
      const sx = (mouseRef.current.x * 100).toFixed(1)
      const sy = (mouseRef.current.y * 100).toFixed(1)
      parts.unshift(
        `radial-gradient(circle at ${sx}% ${sy}%, rgba(240,180,80,0.18) 0%, transparent 32%)`
      )
      parts.push('#180a06')

      el.style.background = parts.join(',')
      raf = requestAnimationFrame(render)
    }

    raf = requestAnimationFrame(render)
    return () => cancelAnimationFrame(raf)
  }, [])

  const onMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect()
    const x = (e.clientX - r.left) / r.width
    const y = (e.clientY - r.top)  / r.height
    mouseRef.current = { x, y }
    setTilt({ rx: (y - 0.5) * -6, ry: (x - 0.5) * 6 })
  }

  const onMouseLeave = () => {
    mouseRef.current = { x: 0.5, y: 0.5 }
    setTilt({ rx: 0, ry: 0 })
    setHovered(false)
  }

  return (
    <div
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
      {/* Gradient background — also owns mouse tracking (decorative) */}
      <div
        ref={bgRef}
        aria-hidden="true"
        onMouseMove={onMouseMove}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={onMouseLeave}
        style={{ position: 'absolute', inset: 0, background: '#180a06' }}
      />

      {/* Tilt shine — moves opposite to tilt to simulate a light source */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: `radial-gradient(circle at ${50 - tilt.ry * 4}% ${50 + tilt.rx * 4}%, rgba(255,220,160,0.07) 0%, transparent 55%)`,
        pointerEvents: 'none',
        transition: hovered ? 'background 80ms linear' : 'background 600ms ease',
      }} />

      {/* "Learn about me" pill */}
      <Link
        href="/about"
        onMouseEnter={() => setLinkHovered(true)}
        onMouseLeave={() => setLinkHovered(false)}
        style={{
          position: 'absolute',
          bottom: 20,
          right: 20,
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          background: linkHovered ? 'rgba(255,255,255,0.22)' : 'rgba(255,255,255,0.13)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          border: linkHovered ? '1px solid rgba(255,255,255,0.32)' : '1px solid rgba(255,255,255,0.20)',
          borderRadius: 100,
          padding: '10px 20px',
          fontFamily: "'General Sans', var(--font-dm-sans), sans-serif",
          fontSize: '0.78rem',
          fontWeight: 500,
          color: 'rgba(253, 240, 220, 0.92)',
          textDecoration: 'none',
          letterSpacing: '0.02em',
          transition: 'background 160ms ease, border-color 160ms ease',
        }}
      >
        Learn about me →
      </Link>
    </div>
  )
}
