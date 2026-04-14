'use client'

import { useEffect, useRef } from 'react'

export default function Cursor() {
  const wrapRef = useRef<HTMLDivElement>(null)
  const dotRef  = useRef<HTMLDivElement>(null)
  const rafId   = useRef<number>(0)

  useEffect(() => {
    if (window.matchMedia('(hover: none)').matches) return

    document.body.classList.add('has-cursor')

    const onMove = (e: MouseEvent) => {
      if (wrapRef.current) {
        wrapRef.current.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`
      }
    }

    const onEnter = () => dotRef.current?.style.setProperty('transform', 'scale(1.8)')
    const onLeave = () => dotRef.current?.style.setProperty('transform', 'scale(1)')

    window.addEventListener('mousemove', onMove)

    const interactives = () => document.querySelectorAll<HTMLElement>('a, button, [role="button"]')
    const attach = () => interactives().forEach(el => {
      el.addEventListener('mouseenter', onEnter)
      el.addEventListener('mouseleave', onLeave)
    })
    attach()

    const observer = new MutationObserver(attach)
    observer.observe(document.body, { childList: true, subtree: true })

    return () => {
      document.body.classList.remove('has-cursor')
      window.removeEventListener('mousemove', onMove)
      cancelAnimationFrame(rafId.current)
      observer.disconnect()
      interactives().forEach(el => {
        el.removeEventListener('mouseenter', onEnter)
        el.removeEventListener('mouseleave', onLeave)
      })
    }
  }, [])

  return (
    // Outer: positioned at cursor, no transition
    <div
      ref={wrapRef}
      aria-hidden
      style={{
        position: 'fixed',
        top: 0, left: 0,
        pointerEvents: 'none',
        zIndex: 9999,
        marginLeft: -4, marginTop: -4,
        willChange: 'transform',
        transform: 'translate(-100px, -100px)',
      }}
    >
      {/* Inner: only scale transitions */}
      <div
        ref={dotRef}
        style={{
          width: 8, height: 8,
          borderRadius: '50%',
          background: 'var(--color-red-dot)',
          transition: 'transform 150ms ease',
        }}
      />
    </div>
  )
}
