'use client'

import Nav from './components/Nav'
import PhotoGrid from './components/PhotoGrid'
import DitherCard from './components/DitherCard'
import MeshCard from './components/MeshCard'

export default function Home() {
  return (
    <>
      <Nav />

      {/* ── Hero — two cards ── */}
      <section
        aria-label="Introduction"
        style={{
          background: '#ffffff',
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
          <MeshCard />
        </div>
      </section>

      {/* ── Work section ── */}
      <main
        id="main-content"
        style={{
          background: '#ffffff',
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
