'use client'

import { useEffect, useRef, useState } from 'react'

const PROJECTS = [
  {
    title: 'Jumbuddy',
    tags: ['UX Research', 'User Flows', 'Figma'],
    description: 'A hyper-local social platform helping students discover campus events and connect through shared interests.',
    link: '/jumbuddy.html',
    thumb: '/images/jumbuddy-hero.mp4',
    year: '2024',
  },
  {
    title: 'Trovr',
    tags: ['Figma', 'User Research', 'UX/UI'],
    description: 'A student-based marketplace built in 36 hours with rapid prototyping and user-centered design.',
    link: '/trovr.html',
    thumb: '/images/trovr-hero.mp4',
    year: '2024',
  },
  {
    title: 'Recube Dashboard',
    tags: ['UX/UI', 'Analytics', 'Figma'],
    description: 'A real-time analytics dashboard for 50+ restaurant partners to drive sustainability decisions.',
    link: '/recube.html',
    thumb: '/images/recube-hero.mp4',
    year: '2024',
  },
  {
    title: 'C2Pay',
    tags: ['React Native', 'C2PA', 'HackHarvard Winner'],
    description: 'A mobile SDK for adaptive MFA using device trust, biometrics, and C2PA attestation.',
    link: '/c2pay.html',
    thumb: '/images/c2pay hero.png',
    year: '2024',
  },
]

function useReveal() {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const targets = el.querySelectorAll<HTMLElement>('.reveal')
    const observer = new IntersectionObserver(
      entries => entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add('visible'); observer.unobserve(e.target) }
      }),
      { threshold: 0.1 }
    )
    targets.forEach(t => observer.observe(t))
    return () => observer.disconnect()
  }, [])
  return ref
}

function ProjectCard({ title, tags, description, link, thumb, year, index }: Readonly<typeof PROJECTS[0] & { index: number }>) {
  const [hovered, setHovered] = useState(false)
  const isVideo = thumb.endsWith('.mp4')

  return (
    <a
      href={link}
      className="reveal"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex',
        flexDirection: 'column',
        textDecoration: 'none',
        borderRadius: 16,
        overflow: 'hidden',
        background: '#ffffff',
        border: '1px solid rgba(0, 0, 0, 0.07)',
        boxShadow: hovered
          ? '0 8px 32px rgba(0,0,0,0.10), 0 2px 8px rgba(0,0,0,0.06)'
          : '0 1px 4px rgba(0,0,0,0.05), 0 2px 12px rgba(0,0,0,0.04)',
        transform: hovered ? 'translateY(-4px)' : 'translateY(0)',
        transition: [
          'box-shadow 200ms ease',
          'transform 220ms cubic-bezier(0.16,1,0.3,1)',
        ].join(', '),
        transitionDelay: `${index * 40}ms`,
      }}
    >
      {/* Thumbnail */}
      <div style={{ height: 210, overflow: 'hidden', position: 'relative', flexShrink: 0, background: '#f4f0ec' }}>
        {isVideo ? (
          <video autoPlay loop muted playsInline
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}>
            <source src={thumb} type="video/mp4" />
          </video>
        ) : (
          <img src={thumb} alt={title}
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
        )}

        {/* Year badge */}
        <span style={{
          position: 'absolute', top: 12, right: 12,
          fontFamily: "'General Sans', var(--font-dm-sans), sans-serif",
          fontSize: '0.62rem', fontWeight: 500, letterSpacing: '0.06em',
          color: 'rgba(26,16,8,0.55)',
          background: 'rgba(255,255,255,0.82)',
          border: '1px solid rgba(0,0,0,0.06)',
          backdropFilter: 'blur(6px)',
          WebkitBackdropFilter: 'blur(6px)',
          borderRadius: 20, padding: '3px 9px',
        }}>
          {year}
        </span>
      </div>

      {/* Body */}
      <div style={{ padding: '18px 20px 20px', display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <h3 style={{
            fontFamily: 'var(--font-cormorant), Georgia, serif',
            fontWeight: 500, fontSize: '1.40rem',
            color: '#1a1008', margin: 0, lineHeight: 1.1, letterSpacing: '-0.01em',
          }}>
            {title}
          </h3>
          <span style={{
            fontSize: '0.95rem', color: '#5a3c22', flexShrink: 0, marginLeft: 8, marginTop: 2,
            opacity: hovered ? 1 : 0,
            transform: hovered ? 'translate(0,0)' : 'translate(-5px,4px)',
            transition: 'opacity 160ms ease, transform 160ms ease',
          }}>→</span>
        </div>

        {/* Tags */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
          {tags.map(tag => (
            <span key={tag} style={{
              fontFamily: "'General Sans', var(--font-dm-sans), sans-serif",
              fontSize: '0.60rem', fontWeight: 500,
              letterSpacing: '0.07em', textTransform: 'uppercase',
              color: '#7a5030',
              border: '1px solid rgba(120,80,40,0.18)',
              borderRadius: 4, padding: '2px 7px',
              background: 'rgba(248,244,238,0.9)',
            }}>
              {tag}
            </span>
          ))}
        </div>

        <p style={{
          fontFamily: "'General Sans', var(--font-dm-sans), sans-serif",
          fontSize: '0.83rem', color: '#6a4a2a', lineHeight: 1.6, margin: 0,
        }}>
          {description}
        </p>
      </div>
    </a>
  )
}

export default function PhotoGrid() {
  const ref = useReveal()

  return (
    <section ref={ref}>
      {/* Section label */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '64px 0 24px' }}>
        <span style={{
          width: 6, height: 6, borderRadius: '50%',
          background: '#7aad6a', display: 'inline-block', flexShrink: 0,
          animation: 'dotPulse 2.8s ease-in-out infinite',
        }} />
        <span style={{
          fontFamily: "'General Sans', var(--font-dm-sans), sans-serif",
          fontSize: '0.68rem', fontWeight: 500,
          letterSpacing: '0.14em', textTransform: 'uppercase', color: '#7a5030',
        }}>
          Selected Work
        </span>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 380px), 1fr))',
        gap: 16,
      }}>
        {PROJECTS.map((p, i) => <ProjectCard key={p.title} {...p} index={i} />)}
      </div>
    </section>
  )
}
