'use client'

import { useEffect, useRef, useState } from 'react'

type Project = {
  title: string
  tags: string[]
  description: string
  link: string
  thumb: string
  year: string
  external?: boolean
}

const RECENT: Project[] = [
  {
    title: 'Mahjong Tile Drop',
    tags: ['3D', 'Interaction Design', 'Coding'],
    description: 'A real-time 3D mahjong table with physics and synthesized sound. Pour a set and wash it the Cantonese way.',
    link: '/mahjong.html',
    thumb: '/images/mahjong-tile-drop.mp4',
    year: '2026',
  },
  {
    title: 'Jumbo Ventures',
    tags: ['Web Design', 'Branding', 'Live Site'],
    description: "Website for Tufts' entrepreneurship club, where I'm head of design. A hand-illustrated hero traces the path from campus to Boston.",
    link: 'https://tuftsjumboventures.org/',
    thumb: '/images/jumboventures.jpg',
    year: '2026',
    external: true,
  },
  {
    title: 'Mass AI Coalition',
    tags: ['Concept', 'Web Design', 'Information Architecture'],
    description: 'Unofficial redesign concept for the Massachusetts AI Coalition, built with Claude. Every visitor picks a path and gets a clear next step.',
    link: '/mass-ai-coalition.html',
    thumb: '/images/mass-ai-coalition.jpg',
    year: '2026',
  },
]

const PAST: Project[] = [
  {
    title: 'Accessible Voting Machine',
    tags: ['HFE', 'Accessibility', 'UX Research'],
    description: 'Redesigned a voting machine UI for a class project: 8 screens, grounded in 5 user interviews and disability regulation research.',
    link: '/voting-machine.html',
    thumb: '/images/voting-machine-overview.png',
    year: '2026',
  },
  {
    title: 'Recube Dashboard',
    tags: ['Internship', 'Analytics', 'Figma'],
    description: 'Analytics dashboard I built for a reusable packaging startup. Gave 50+ restaurant partners their first look at live inventory and sustainability data.',
    link: '/recube.html',
    thumb: '/images/recube-hero.mp4',
    year: '2025',
  },
  {
    title: 'C2Pay',
    tags: ['Coding', 'C2PA', 'HackHarvard Winner'],
    description: 'Won HackHarvard Finance Track with an adaptive MFA SDK built in 36 hours. Uses device trust, biometrics, and C2PA manifests to verify payments.',
    link: '/c2pay.html',
    thumb: '/images/c2pay hero.png',
    year: '2025',
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

function ProjectCard({ title, tags, description, link, thumb, year, external, index, small }: Readonly<Project & { index: number; small?: boolean }>) {
  const [hovered, setHovered] = useState(false)
  const isVideo = thumb.endsWith('.mp4')

  return (
    <a
      href={link}
      target={external ? '_blank' : undefined}
      rel={external ? 'noopener noreferrer' : undefined}
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
      <div style={{ height: small ? 170 : 210, overflow: 'hidden', position: 'relative', flexShrink: 0, background: '#f4f0ec' }}>
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
          <span style={{ opacity: 0.5, marginRight: 3 }}>✿</span>{year}
        </span>
      </div>

      {/* Body */}
      <div style={{ padding: '18px 20px 20px', display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <h3 style={{
            fontFamily: 'var(--font-cormorant), Georgia, serif',
            fontWeight: 500, fontSize: small ? '1.25rem' : '1.40rem',
            color: '#1a1008', margin: 0, lineHeight: 1.1, letterSpacing: '-0.01em',
          }}>
            {title}
          </h3>
          <span style={{
            fontSize: '0.95rem', color: '#5a3c22', flexShrink: 0, marginLeft: 8, marginTop: 2,
            opacity: hovered ? 1 : 0,
            transform: hovered ? 'translate(0,0)' : 'translate(-5px,4px)',
            transition: 'opacity 160ms ease, transform 160ms ease',
          }}>{external ? '↗' : '→'}</span>
        </div>

        {/* Tags */}
        <p style={{
          fontFamily: "'General Sans', var(--font-dm-sans), sans-serif",
          fontSize: '0.72rem', fontWeight: 500,
          color: 'rgba(80,45,12,0.55)',
          margin: 0, lineHeight: 1,
          letterSpacing: '0.03em',
        }}>
          {tags.join('  ·  ')}
        </p>

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

function SectionLabel({ children, first }: Readonly<{ children: string; first?: boolean }>) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: first ? '64px 0 24px' : '88px 0 24px' }}>
      <span style={{
        fontSize: '0.9rem', color: '#7aad6a', display: 'inline-block', flexShrink: 0,
        animation: 'dotPulse 2.8s ease-in-out infinite', lineHeight: 1,
      }}>✿</span>
      <span style={{
        fontFamily: "'General Sans', var(--font-dm-sans), sans-serif",
        fontSize: '0.68rem', fontWeight: 500,
        letterSpacing: '0.14em', textTransform: 'uppercase', color: '#7a5030',
      }}>
        {children}
      </span>
    </div>
  )
}

export default function PhotoGrid() {
  const ref = useReveal()

  return (
    <section ref={ref}>
      <SectionLabel first>Recent Projects</SectionLabel>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))',
        gap: 16,
      }}>
        {RECENT.map((p, i) => <ProjectCard key={p.title} {...p} index={i} small />)}
      </div>

      <SectionLabel>Past Case Studies</SectionLabel>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 380px), 1fr))',
        gap: 16,
      }}>
        {PAST.map((p, i) => <ProjectCard key={p.title} {...p} index={i} />)}
      </div>
    </section>
  )
}
