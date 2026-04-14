'use client'

import { useEffect, useRef, useState } from 'react'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

const SUGGESTIONS = [
  "What's Chloe working on?",
  'Tell me about Trovr',
  'What are her skills?',
]

export default function ChatWidget() {
  const [open, setOpen]       = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput]     = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef  = useRef<HTMLTextAreaElement>(null)

  // Scroll to bottom on new message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Focus input when opened
  useEffect(() => {
    if (open) inputRef.current?.focus()
  }, [open])

  // Close on Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const send = async (text: string) => {
    if (!text.trim() || loading) return
    const userMsg: Message = { role: 'user', content: text.trim() }
    const next = [...messages, userMsg]
    setMessages(next)
    setInput('')
    setLoading(true)

    // Placeholder for streaming assistant reply
    setMessages(m => [...m, { role: 'assistant', content: '' }])

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: next }),
      })
      if (!res.body) throw new Error('No stream')

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let full = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        full += decoder.decode(value, { stream: true })
        setMessages(m => [
          ...m.slice(0, -1),
          { role: 'assistant', content: full },
        ])
      }
    } catch {
      setMessages(m => [
        ...m.slice(0, -1),
        { role: 'assistant', content: "Sorry, something went wrong. Try emailing Chloe directly at chloewong052@gmail.com." },
      ])
    } finally {
      setLoading(false)
    }
  }

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      send(input)
    }
  }

  // ── styles ──────────────────────────────────────────────────────────────
  const panel: React.CSSProperties = {
    position: 'fixed',
    bottom: 84,
    right: 20,
    width: 340,
    maxHeight: 480,
    display: 'flex',
    flexDirection: 'column',
    background: 'rgba(253, 246, 240, 0.97)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    border: '1px solid #f4afc0',
    borderRadius: 18,
    overflow: 'hidden',
    boxShadow: '0 8px 40px rgba(61,16,32,0.12), 0 2px 8px rgba(0,0,0,0.06)',
    zIndex: 100,
    opacity: open ? 1 : 0,
    transform: open ? 'translateY(0) scale(1)' : 'translateY(12px) scale(0.97)',
    pointerEvents: open ? 'auto' : 'none',
    transition: 'opacity 220ms ease, transform 220ms cubic-bezier(0.16,1,0.3,1)',
    transformOrigin: 'bottom right',
  }

  const fab: React.CSSProperties = {
    position: 'fixed',
    bottom: 20,
    right: 20,
    width: 52,
    height: 52,
    borderRadius: 100,
    border: '1px solid #f4afc0',
    background: open ? '#3d1020' : 'rgba(253,246,240,0.95)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    boxShadow: '0 4px 20px rgba(61,16,32,0.14)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    zIndex: 101,
    transition: 'background 200ms ease, transform 200ms ease',
    color: open ? '#fdf6ec' : '#8b3a52',
    fontSize: '1.2rem',
  }

  return (
    <>
      {/* Chat panel */}
      <div style={panel} role="dialog" aria-label="Chat with Chloe's assistant" aria-modal="true">
        {/* Header */}
        <div style={{
          padding: '14px 16px',
          borderBottom: '1px solid #f4afc0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: 0,
        }}>
          <div>
            <p style={{ fontFamily: "'General Sans', sans-serif", fontSize: '0.78rem', fontWeight: 500, color: '#3d1020', margin: 0 }}>
              Ask me anything
            </p>
            <p style={{ fontFamily: "'General Sans', sans-serif", fontSize: '0.65rem', color: '#c47a8a', margin: 0, marginTop: 1 }}>
              I know all about Chloe
            </p>
          </div>
          <button
            onClick={() => setOpen(false)}
            aria-label="Close chat"
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#c47a8a', fontSize: '1rem', padding: 4, lineHeight: 1 }}
          >
            ✕
          </button>
        </div>

        {/* Messages */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          {messages.length === 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <p style={{ fontFamily: "'General Sans', sans-serif", fontSize: '0.78rem', color: '#8b3a52', lineHeight: 1.6, margin: 0 }}>
                Hi! I&apos;m Chloe&apos;s AI assistant. Ask me about her work, experience, or projects.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 4 }}>
                {SUGGESTIONS.map(s => (
                  <button
                    key={s}
                    onClick={() => send(s)}
                    style={{
                      textAlign: 'left',
                      background: '#fff0f5',
                      border: '1px solid #f4afc0',
                      borderRadius: 8,
                      padding: '7px 12px',
                      fontFamily: "'General Sans', sans-serif",
                      fontSize: '0.73rem',
                      color: '#8b3a52',
                      cursor: 'pointer',
                      transition: 'background 150ms ease',
                    }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((m, i) => (
              <div
                key={i}
                style={{
                  alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
                  maxWidth: '85%',
                  background: m.role === 'user' ? '#3d1020' : '#fff0f5',
                  color: m.role === 'user' ? '#fdf6ec' : '#3d1020',
                  border: m.role === 'user' ? 'none' : '1px solid #f4afc0',
                  borderRadius: m.role === 'user' ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
                  padding: '9px 13px',
                  fontFamily: "'General Sans', sans-serif",
                  fontSize: '0.80rem',
                  lineHeight: 1.6,
                  whiteSpace: 'pre-wrap',
                }}
              >
                {m.content || (loading && i === messages.length - 1
                  ? <span style={{ opacity: 0.5 }}>…</span>
                  : ''
                )}
              </div>
            ))
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div style={{
          borderTop: '1px solid #f4afc0',
          padding: '10px 12px',
          display: 'flex',
          gap: 8,
          alignItems: 'flex-end',
          flexShrink: 0,
        }}>
          <textarea
            ref={inputRef}
            rows={1}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Ask something…"
            style={{
              flex: 1,
              resize: 'none',
              border: '1px solid #f4afc0',
              borderRadius: 10,
              padding: '8px 12px',
              fontFamily: "'General Sans', sans-serif",
              fontSize: '0.78rem',
              color: '#3d1020',
              background: 'rgba(255,255,255,0.7)',
              outline: 'none',
              lineHeight: 1.5,
              maxHeight: 80,
              overflowY: 'auto',
            }}
          />
          <button
            onClick={() => send(input)}
            disabled={!input.trim() || loading}
            aria-label="Send message"
            style={{
              width: 34,
              height: 34,
              borderRadius: 10,
              border: 'none',
              background: '#3d1020',
              color: '#fdf6ec',
              cursor: input.trim() && !loading ? 'pointer' : 'default',
              opacity: input.trim() && !loading ? 1 : 0.4,
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              transition: 'opacity 150ms ease',
            }}
          >
            ↑
          </button>
        </div>
      </div>

      {/* FAB */}
      <button
        onClick={() => setOpen(o => !o)}
        style={fab}
        aria-label={open ? 'Close chat' : 'Open chat'}
        aria-expanded={open}
      >
        {open ? '✕' : '💬'}
      </button>
    </>
  )
}
