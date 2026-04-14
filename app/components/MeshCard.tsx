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
}

// Warm gold/amber/rose bleeding into deep wine/terracotta
const BLOBS: Blob[] = [
  { baseX: 0.2,  baseY: 0.38, sp: 0.26, ph: 0,   rgb: '220,158, 72', alpha: 0.7,  stop: 54 },
  { baseX: 0.7,  baseY: 0.55, sp: 0.19, ph: 2.1,  rgb: '188, 96,114', alpha: 0.65, stop: 48 },
  { baseX: 0.48, baseY: 0.2,  sp: 0.31, ph: 4.2,  rgb: '210,120, 70', alpha: 0.55, stop: 52 },
  { baseX: 0.76, baseY: 0.72, sp: 0.14, ph: 1.5,  rgb: ' 80, 28, 42', alpha: 0.92, stop: 56 },
  { baseX: 0.16, baseY: 0.76, sp: 0.21, ph: 3,    rgb: ' 52, 24, 12', alpha: 0.9,  stop: 52 },
  { baseX: 0.52, baseY: 0.54, sp: 0.17, ph: 5.1,  rgb: ' 96, 38, 22', alpha: 0.85, stop: 48 },
]

export default function MeshCard() {
  const divRef   = useRef<HTMLDivElement>(null)
  const [hovered, setHovered] = useState(false)

  useEffect(() => {
    const el = divRef.current
    if (!el) return

    const start = performance.now()
    let raf = 0

    const render = () => {
      const t = (performance.now() - start) / 3800

      const parts = BLOBS.map(b => {
        const x = (b.baseX + Math.sin(t * b.sp + b.ph) * 0.13) * 100
        const y = (b.baseY + Math.cos(t * b.sp * 1.3 + b.ph) * 0.1
                           + Math.sin(t * b.sp * 0.4 + b.ph + 1.2) * 0.05) * 100
        // Subtle breathing on alpha
        const a = (b.alpha * (1 + Math.sin(t * b.sp * 0.6 + b.ph) * 0.06)).toFixed(2)
        return `radial-gradient(ellipse at ${x.toFixed(1)}% ${y.toFixed(1)}%, rgba(${b.rgb},${a}) 0%, transparent ${b.stop}%)`
      })
      parts.push('#180a06')

      el.style.background = parts.join(',')
      raf = requestAnimationFrame(render)
    }

    raf = requestAnimationFrame(render)
    return () => cancelAnimationFrame(raf)
  }, [])

  return (
    <div
      ref={divRef}
      style={{
        position: 'relative',
        borderRadius: 20,
        overflow: 'hidden',
        background: '#180a06',
      }}
    >
      {/* "Learn about me" glassmorphic pill — bottom right */}
      <Link
        href="/about"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          position: 'absolute',
          bottom: 20,
          right: 20,
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          background: hovered ? 'rgba(255,255,255,0.22)' : 'rgba(255,255,255,0.13)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          border: hovered ? '1px solid rgba(255,255,255,0.32)' : '1px solid rgba(255,255,255,0.20)',
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
