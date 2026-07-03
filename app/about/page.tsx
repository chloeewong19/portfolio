'use client'

import { useState } from 'react'
import Nav from '../components/Nav'

const EXPERIENCE = [
  { role: 'Data & AI Intern', org: 'Ernst & Young', period: 'May–Aug 2026' },
  { role: 'Business Planning & UX Intern', org: 'Tufts Technology Services', period: 'Dec 2025–Present' },
  { role: 'Product & Design Intern', org: 'SlasherPro', period: 'Aug–Sep 2025' },
  { role: 'UX Intern', org: 'Recube', period: 'Jun–Sep 2025' },
  { role: 'Lead Designer', org: 'JumboCode', period: 'May 2025–Present' },
]

const EDUCATION = [
  { role: 'BSE Human Factors Engineering + CS', org: 'Tufts University', period: '2024–2028' },
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
              I&apos;m a student at Tufts University studying Human Factors Engineering and Computer
              Science, with a focus on accessibility and inclusive design.
            </p>

            <p className="fade-up" style={{ fontSize: '0.88rem', color: 'var(--color-muted)', lineHeight: 1.7, animationDelay: '160ms' }}>
              Connect on{' '}
              <a href="https://www.linkedin.com/in/chloe-wong-29b412234/" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-ink)', borderBottom: '1px solid var(--color-border)', paddingBottom: '1px' }}>
                LinkedIn
              </a>
              {' '}or say hello at{' '}
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

        {/* ── Resume ── */}
        <section style={{ paddingTop: '48px', paddingBottom: '48px', borderBottom: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '40px' }}>
          <div>
            <span className="pixel-label" style={{ color: 'var(--color-muted)', display: 'block', marginBottom: '6px' }}>Resume</span>
            <p style={{ fontSize: '0.88rem', color: 'var(--color-muted)', margin: 0, lineHeight: 1.6 }}>UX / product design · accessibility · full-stack</p>
          </div>
          <a
            href="https://drive.google.com/file/d/13evRYVsBz5dzptfA-9G_OyLuWJ2Rv42R/view?usp=sharing"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px', flexShrink: 0,
              background: 'var(--color-ink)', color: 'var(--color-cream)',
              padding: '13px 26px', borderRadius: '100px',
              fontSize: '0.85rem', fontWeight: 500,
              textDecoration: 'none',
            }}
          >
            View Resume ↗
          </a>
        </section>

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
              { label: 'Resume',  href: 'https://drive.google.com/file/d/13evRYVsBz5dzptfA-9G_OyLuWJ2Rv42R/view?usp=sharing' },
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
