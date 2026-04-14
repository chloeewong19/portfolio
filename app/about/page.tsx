'use client'

import { useState } from 'react'
import Nav from '../components/Nav'

const EXPERIENCE = [
  { role: 'Student Technology Experience Intern', org: 'Tufts Technology Services', period: 'Spring 2025' },
  { role: 'Lead Designer', org: 'JumboCode', period: '2024–2025' },
  { role: 'Product Design Intern', org: 'Recube', period: 'Summer 2024' },
]

const EDUCATION = [
  { role: 'B.S. Human Factors Engineering + CS', org: 'Tufts University', period: '2023–2027' },
]

function PhotoItem({ label, src }: Readonly<{ label: string; src: string }>) {
  const [hovered, setHovered] = useState(false)
  return (
    <div
      role="img"
      aria-label={label}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        height: '300px',
        background: '#d8d3cc',
        position: 'relative',
        overflow: 'hidden',
        transform: hovered ? 'scale(1.018)' : 'scale(1)',
        transition: 'transform 200ms ease',
        zIndex: hovered ? 1 : 0,
      }}
    >
      <img src={src} alt={label} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
      <div style={{
        position: 'absolute', inset: 0,
        background: 'rgba(28,28,26,0.5)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        opacity: hovered ? 1 : 0,
        transition: 'opacity 200ms ease',
      }}>
        <span className="pixel-label" style={{ color: 'white' }}>{label}</span>
      </div>
    </div>
  )
}

function SectionHeading({ children, dot }: Readonly<{ children: React.ReactNode; dot?: boolean }>) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
      {dot && <span className="pixel-dot dot-pulse" />}
      <span className="pixel-label" style={{ color: 'var(--color-muted)' }}>
        {children}
      </span>
    </div>
  )
}

function EntryRow({ role, org, period }: Readonly<{ role: string; org: string; period: string }>) {
  const [hovered, setHovered] = useState(false)
  return (
    <li
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        padding: '10px 8px',
        borderBottom: '1px solid var(--color-border)',
        background: hovered ? 'var(--color-hover-bg)' : 'transparent',
        transition: 'background 150ms ease',
        borderRadius: '3px',
        cursor: 'default',
        listStyle: 'none',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '12px' }}>
        <div>
          <span style={{ fontSize: '0.88rem', fontWeight: 400, color: 'var(--color-ink)' }}>{role}</span>
          <span style={{ fontSize: '0.84rem', color: 'var(--color-muted)', marginLeft: '6px' }}>/ {org}</span>
        </div>
        <span className="pixel-label" style={{ color: 'var(--color-faint)', whiteSpace: 'nowrap', flexShrink: 0 }}>{period}</span>
      </div>
    </li>
  )
}

export default function About() {
  return (
    <>
      <Nav />

      <main id="main-content" style={{
        maxWidth: '1080px',
        margin: '0 auto',
        padding: '0 15px 100px',
      }}>

        {/* ── Two-column intro ── */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '55fr 45fr',
          gap: '80px',
          paddingTop: '120px',
          paddingBottom: '64px',
          borderBottom: '1px solid var(--color-border)',
        }}>

          {/* Left column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
            <h1 className="fade-up" style={{ fontSize: '1.5rem', fontWeight: 500, letterSpacing: '-0.02em', lineHeight: 1.3, color: 'var(--color-ink)', animationDelay: '0ms' }}>
              Hi there, I&apos;m Chloe.
            </h1>

            <p className="fade-up" style={{ fontSize: '0.95rem', lineHeight: 1.75, color: 'var(--color-muted)', maxWidth: '420px', animationDelay: '80ms' }}>
              I&apos;m a sophomore at Tufts University studying Human Factors Engineering and Computer
              Science, with a focus on accessibility and inclusive design. Currently interning at
              Tufts Technology Services and leading design at JumboCode.
            </p>

            {/* Currently */}
            <div className="fade-up" style={{ animationDelay: '160ms' }}>
              <p className="pixel-label" style={{ color: 'var(--color-faint)', marginBottom: '10px' }}>
                Currently
              </p>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '7px' }}>
                {[
                  'Building Merae (a social life tracking app) and Trovr (a campus marketplace)',
                  'Exploring wearable tech and BCIs',
                  'Getting into the Boston AI community',
                  'Café hopping around Somerville',
                ].map(item => (
                  <li key={item} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', fontSize: '0.88rem', color: 'var(--color-muted)', lineHeight: 1.65 }}>
                    <span className="pixel-label" style={{ color: 'var(--color-red-dot)', marginTop: '3px', flexShrink: 0, fontSize: '6px' }}>▸</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <p className="fade-up" style={{ fontSize: '0.88rem', color: 'var(--color-muted)', lineHeight: 1.7, animationDelay: '240ms' }}>
              I post my work on{' '}
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-ink)', borderBottom: '1px solid var(--color-border)', paddingBottom: '1px', transition: 'border-color 150ms' }}>
                Twitter
              </a>{' '}
              and{' '}
              <a href="https://www.linkedin.com/in/chloe-wong-29b412234/" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-ink)', borderBottom: '1px solid var(--color-border)', paddingBottom: '1px' }}>
                LinkedIn
              </a>
              . Say hello at{' '}
              <a href="mailto:chloewong052@gmail.com" style={{ color: 'var(--color-ink)', borderBottom: '1px solid var(--color-border)', paddingBottom: '1px' }}>
                chloewong052@gmail.com
              </a>
              .
            </p>
          </div>

          {/* Right column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '36px' }}>
            <div>
              <SectionHeading dot>Experience</SectionHeading>
              <ul style={{ padding: 0, margin: 0 }}>
                {EXPERIENCE.map(e => <EntryRow key={e.role} {...e} />)}
              </ul>
            </div>

            <div>
              <SectionHeading>Education</SectionHeading>
              <ul style={{ padding: 0, margin: 0 }}>
                {EDUCATION.map(e => <EntryRow key={e.role} {...e} />)}
              </ul>
            </div>
          </div>
        </div>

        {/* ── Photo strip ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', paddingTop: '64px', paddingBottom: '64px' }}>
          {[
            { label: 'me!',                      src: '/images/portfolio pics/3cd1d259-e716-4d4c-88d2-df6ccf27dab3 2.JPG' },
            { label: 'my home (hong kong)',       src: '/images/portfolio pics/3rd image.jpg' },
            { label: 'one of my 3 cats',          src: '/images/portfolio pics/pet.png' },
            { label: 'where i live now (boston)', src: '/images/portfolio pics/DSCF6576.JPG' },
          ].map(({ label, src }) => (
            <PhotoItem key={label} label={label} src={src} />
          ))}
        </div>

        <footer style={{ paddingTop: '40px', borderTop: '1px solid var(--color-border)', textAlign: 'center' }}>
          <p className="pixel-label" style={{ color: 'var(--color-faint)', marginBottom: '20px' }}>
            Let&apos;s connect
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '32px', flexWrap: 'wrap' }}>
            {[
              { label: '← Work',  href: '/' },
              { label: 'Email',   href: 'mailto:chloewong052@gmail.com' },
              { label: 'LinkedIn', href: 'https://www.linkedin.com/in/chloe-wong-29b412234/' },
              { label: 'Resume',  href: 'https://drive.google.com/file/d/1dmoGwxz_-ciB32ECIx9Ien_B3U7O9V2Z/view?usp=sharing' },
            ].map(({ label, href }) => (
              <a
                key={label}
                href={href}
                target={href.startsWith('http') ? '_blank' : undefined}
                rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}
                style={{ fontSize: '0.88rem', color: 'var(--color-muted)', transition: 'color 150ms', textDecoration: 'none' }}
              >
                {label}
              </a>
            ))}
          </div>
        </footer>

      </main>
    </>
  )
}
