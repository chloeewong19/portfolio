import { useState, useEffect } from 'react'
import Creature from '../components/Creature'

export default function BootScreen({ onDone, sound }) {
  const [showTitle, setShowTitle] = useState(false)
  const [loadPercent, setLoadPercent] = useState(0)
  const [showBar, setShowBar] = useState(false)
  const [showBy, setShowBy] = useState(false)
  const [showCreature, setShowCreature] = useState(false)
  const [flicker, setFlicker] = useState(true)

  useEffect(() => {
    // Flicker effect
    let flickerCount = 0
    const flickerInterval = setInterval(() => {
      flickerCount++
      setFlicker(f => !f)
      if (flickerCount >= 6) {
        clearInterval(flickerInterval)
        setFlicker(true)
      }
    }, 50)

    const t1 = setTimeout(() => setShowTitle(true), 300)
    const t2 = setTimeout(() => setShowBar(true), 800)

    // Fill bar over 1200ms in 8 increments
    let step = 0
    const barInterval = setInterval(() => {
      step++
      setLoadPercent(Math.min(100, step * 12.5))
      if (step >= 8) clearInterval(barInterval)
    }, 150)

    const t3 = setTimeout(() => setShowBy(true), 2000)
    const t4 = setTimeout(() => setShowCreature(true), 2500)
    const t5 = setTimeout(() => {
      if (onDone) onDone()
    }, 3500)

    return () => {
      clearInterval(flickerInterval)
      clearTimeout(t1)
      clearTimeout(t2)
      clearTimeout(t3)
      clearTimeout(t4)
      clearTimeout(t5)
      clearInterval(barInterval)
    }
  }, [onDone])

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
        opacity: flicker ? 1 : 0,
        transition: 'opacity 0.04s',
        background: '#ffe8f0',
      }}
    >
      {showTitle && (
        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              fontFamily: "'Press Start 2P', monospace",
              fontSize: 8,
              color: '#8b3a52',
              letterSpacing: '0.05em',
              marginBottom: 6,
            }}
          >
            TAMA-FOLIO
          </div>
          <div
            style={{
              fontFamily: "'Press Start 2P', monospace",
              fontSize: 5,
              color: '#c47a8a',
            }}
          >
            v1.0
          </div>
        </div>
      )}

      {showBar && (
        <div
          style={{
            width: 80,
            height: 8,
            border: '1px solid #8b3a52',
            borderRadius: 2,
            overflow: 'hidden',
            background: '#fdf0f4',
          }}
        >
          <div
            style={{
              width: `${loadPercent}%`,
              height: '100%',
              background: '#c47a8a',
              transition: 'width 0.12s linear',
            }}
          />
        </div>
      )}

      {showBy && (
        <div
          style={{
            fontFamily: "'Press Start 2P', monospace",
            fontSize: 5,
            color: '#b07080',
          }}
        >
          by chloe wong
        </div>
      )}

      {showCreature && (
        <div style={{ marginTop: 4 }}>
          <Creature animState="hatch" scale={1} />
        </div>
      )}
    </div>
  )
}
