'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

const linkText: React.CSSProperties = {
  fontFamily: "'General Sans', var(--font-dm-sans), sans-serif",
  fontSize: '0.72rem',
  fontWeight: 500,
  letterSpacing: '0.07em',
  textTransform: 'uppercase',
  color: '#1a1008',
  textDecoration: 'none',
  display: 'inline-flex',
  alignItems: 'center',
}

export default function Nav() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      style={{
        position: 'fixed',
        top: scrolled ? 12 : 0,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 50,
        width: scrolled ? 480 : '100vw',
        height: scrolled ? 52 : 72,
        background: scrolled ? 'rgba(255, 255, 255, 0.82)' : '#ffffff',
        backdropFilter: scrolled ? 'blur(16px)' : 'none',
        WebkitBackdropFilter: scrolled ? 'blur(16px)' : 'none',
        borderRadius: scrolled ? 100 : 0,
        border: '1px solid transparent',
        borderBottom: scrolled
          ? '1px solid rgba(0, 0, 0, 0.09)'
          : '1px solid rgba(0, 0, 0, 0.055)',
        boxShadow: scrolled ? '0 4px 28px rgba(0,0,0,0.09)' : 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: scrolled ? '0 18px' : '0 24px',
        transition: [
          'top 400ms cubic-bezier(0.16,1,0.3,1)',
          'width 400ms cubic-bezier(0.16,1,0.3,1)',
          'height 400ms cubic-bezier(0.16,1,0.3,1)',
          'border-radius 400ms cubic-bezier(0.16,1,0.3,1)',
          'background 300ms ease',
          'box-shadow 300ms ease',
          'padding 300ms ease',
        ].join(', '),
        overflow: 'hidden',
      }}
    >
      {/* Name */}
      <Link
        href="/"
        style={{
          fontFamily: 'var(--font-cormorant), Georgia, serif',
          fontStyle: 'italic',
          fontWeight: 400,
          fontSize: '1.08rem',
          letterSpacing: '-0.01em',
          color: '#1a1008',
          textDecoration: 'none',
          padding: scrolled ? '4px 10px' : '4px 0',
          transition: 'padding 300ms ease',
          whiteSpace: 'nowrap',
        }}
      >
        Chloe W
      </Link>

      {/* Links */}
      <nav aria-label="Main navigation" style={{ display: 'flex', gap: scrolled ? 4 : 8, transition: 'gap 300ms ease' }}>
        {[
          { label: 'Work',    href: '/#work' },
          { label: 'About',   href: '/about' },
          { label: 'Contact', href: 'mailto:chloewong052@gmail.com' },
        ].map(({ label, href }) =>
          href.startsWith('mailto') ? (
            <a key={label} href={href} style={{ ...linkText, padding: '6px 14px' }}>{label}</a>
          ) : (
            <Link key={label} href={href} style={{ ...linkText, padding: '6px 14px' }}>{label}</Link>
          )
        )}
      </nav>
    </header>
  )
}
