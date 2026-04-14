import { useState } from 'react'
import Creature from '../components/Creature'
import { sounds } from '../sound'

const inputStyle = {
  background: '#fff0f5',
  border: '1.5px solid #c47a8a',
  borderRadius: 4,
  padding: '4px 8px',
  fontFamily: "'Press Start 2P', monospace",
  fontSize: 5,
  color: '#8b3a52',
  outline: 'none',
  width: '100%',
}

function LinkItem({ href, label }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 4,
        textDecoration: 'none',
      }}
    >
      <span
        style={{
          fontFamily: "'Press Start 2P', monospace",
          fontSize: 4,
          color: '#c47a8a',
        }}
      >
        {label}
      </span>
    </a>
  )
}

export default function ContactScreen({ navigate, sound, setCreatureAnim }) {
  const [name, setName] = useState('')
  const [message, setMessage] = useState('')
  const [sent, setSent] = useState(false)
  const [creatureState, setCreatureState] = useState('wave')

  function handleSend() {
    if (!name.trim() || !message.trim()) return
    setCreatureState('happy')
    setCreatureAnim('happy')
    setSent(true)
    sounds.send(sound)
  }

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        gap: 8,
        padding: '8px 10px',
        overflow: 'hidden',
      }}
    >
      {/* Left: Creature */}
      <div
        style={{
          flexShrink: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          paddingTop: 10,
        }}
      >
        <Creature animState={creatureState} scale={1} />
      </div>

      {/* Right: Form */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: 6,
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            fontFamily: "'Press Start 2P', monospace",
            fontSize: 6,
            color: '#8b3a52',
          }}
        >
          SEND MSG
        </div>

        {sent ? (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              flex: 1,
              gap: 6,
            }}
          >
            <div
              style={{
                fontFamily: "'Press Start 2P', monospace",
                fontSize: 6,
                color: '#8b3a52',
                textAlign: 'center',
              }}
            >
              MSG SENT!
            </div>
            <div
              style={{
                fontFamily: "'Press Start 2P', monospace",
                fontSize: 5,
                color: '#c47a8a',
                textAlign: 'center',
              }}
            >
              ✨ ✨ ✨
            </div>
          </div>
        ) : (
          <>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="NAME"
              style={{ ...inputStyle, height: 22 }}
            />
            <textarea
              value={message}
              onChange={e => setMessage(e.target.value)}
              placeholder="MSG..."
              style={{
                ...inputStyle,
                height: 40,
                resize: 'none',
                lineHeight: 1.5,
              }}
            />
            <button
              onClick={handleSend}
              style={{
                background: '#c47a8a',
                border: 'none',
                borderRadius: 4,
                padding: '5px 10px',
                fontFamily: "'Press Start 2P', monospace",
                fontSize: 5,
                color: '#fdf0f4',
                cursor: 'pointer',
                alignSelf: 'flex-start',
              }}
            >
              SEND
            </button>
          </>
        )}

        {/* Links */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 'auto' }}>
          <LinkItem href="https://www.linkedin.com/in/chloe-wong-29b412234/" label="→ LINKEDIN" />
          <LinkItem href="https://drive.google.com/file/d/1dmoGwxz_-ciB32ECIx9Ien_B3U7O9V2Z/view?usp=sharing" label="→ RESUME" />
          <LinkItem href="mailto:chloewong052@gmail.com" label="→ EMAIL" />
        </div>
      </div>
    </div>
  )
}
