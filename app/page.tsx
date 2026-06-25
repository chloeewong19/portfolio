'use client'

import Nav from './components/Nav'
import PhotoGrid from './components/PhotoGrid'
import DitherCard from './components/DitherCard'

export default function Home() {
  return (
    <>
      <Nav />

      {/* ── Hero — two cards ── */}
      <section
        aria-label="Introduction"
        style={{
          background: 'var(--color-cream)',
          paddingTop: 72,           // clear fixed nav
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'stretch',
        }}
      >
        <div
          className="hero-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 14,
            padding: '16px 24px 24px',
            width: '100%',
            minHeight: 'calc(100vh - 72px)',
          }}
        >
          <DitherCard />
          <div style={{ borderRadius: 20, background: 'rgba(0,0,0,0.04)', border: '1px solid rgba(0,0,0,0.06)' }} />
        </div>
      </section>

      {/* ── Work section ── */}
      <main
        id="main-content"
        style={{
          background: 'var(--color-cream)',
          padding: '0 24px 120px',
        }}
      >
        <div id="work">
          <PhotoGrid />
        </div>
      </main>
    </>
  )
}
