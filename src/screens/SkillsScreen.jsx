import { useState } from 'react'
import { motion } from 'framer-motion'
import Creature from '../components/Creature'
import { sounds } from '../sound'

const SKILLS = [
  { id: 'figma',       label: 'FIGMA',   color: '#f4afc0' },
  { id: 'react',       label: 'REACT',   color: '#c8e0f4' },
  { id: 'framer',      label: 'FRAMER',  color: '#d4c8f4' },
  { id: 'solidworks',  label: 'SOLWRKS', color: '#f4e0c8' },
  { id: 'python',      label: 'PYTHON',  color: '#c8f4d4' },
  { id: 'r',           label: 'R STATS', color: '#f4c8e8' },
  { id: 'a11y',        label: 'ACCESS.', color: '#f4f0c8' },
  { id: 'ux',          label: 'UX RES.', color: '#c8f4f0' },
  { id: 'figma2',      label: 'PROTO',   color: '#f4d4c8' },
]

function SkillDot({ color }) {
  return (
    <div
      style={{
        width: 16,
        height: 16,
        borderRadius: '50%',
        background: color,
        border: '1.5px solid rgba(139,58,82,0.3)',
        flexShrink: 0,
      }}
    />
  )
}

export default function SkillsScreen({ navigate, stats, setStats, setCreatureAnim, sound }) {
  const [fedItems, setFedItems] = useState(new Set())
  const [showFull, setShowFull] = useState(false)
  const [creatureState, setCreatureState] = useState('idle')

  function feedSkill(id) {
    if (fedItems.has(id)) return

    sounds.nom(sound)
    setCreatureState('eat')
    setTimeout(() => setCreatureState('idle'), 800)
    setCreatureAnim('eat')
    setTimeout(() => setCreatureAnim('idle'), 800)

    const newFed = new Set(fedItems)
    newFed.add(id)
    setFedItems(newFed)

    if (setStats) {
      setStats(prev => ({
        ...prev,
        happiness: Math.min(5, prev.happiness + 1),
      }))
    }

    if (newFed.size === SKILLS.length) {
      setTimeout(() => {
        setShowFull(true)
        setCreatureState('levelup')
        setCreatureAnim('levelup')
        sounds.levelup(sound)
      }, 900)
    }
  }

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      {/* Header */}
      <div style={{ padding: '8px 10px 4px', flexShrink: 0 }}>
        <div
          style={{
            fontFamily: "'Press Start 2P', monospace",
            fontSize: 6,
            color: '#8b3a52',
          }}
        >
          FEED ME!
        </div>
        <div
          style={{
            fontFamily: "'Press Start 2P', monospace",
            fontSize: 4,
            color: '#b07080',
            marginTop: 3,
          }}
        >
          hover to feed
        </div>
      </div>

      {/* Creature center */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          flexShrink: 0,
          marginBottom: 4,
        }}
      >
        <Creature animState={creatureState} scale={0.8} />
      </div>

      {/* "So full" bubble */}
      {showFull && (
        <div
          style={{
            position: 'absolute',
            top: 44,
            left: '50%',
            transform: 'translateX(-50%)',
            background: '#fdf0f4',
            border: '1px solid #e8c0cc',
            borderRadius: 8,
            padding: '4px 8px',
            zIndex: 10,
          }}
        >
          <span
            style={{
              fontFamily: "'Press Start 2P', monospace",
              fontSize: 5,
              color: '#8b3a52',
            }}
          >
            SO FULL :)
          </span>
        </div>
      )}

      {/* Skills grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 5,
          padding: '0 8px 8px',
          flex: 1,
          alignContent: 'start',
          overflowY: 'auto',
        }}
      >
        {SKILLS.map((skill) => {
          const isFed = fedItems.has(skill.id)
          return (
            <motion.div
              key={skill.id}
              whileHover={{ y: -4 }}
              onHoverStart={() => feedSkill(skill.id)}
              style={{
                height: 44,
                background: isFed ? skill.color : '#fff0f5',
                border: `1.5px solid ${isFed ? 'rgba(139,58,82,0.3)' : '#e8c0cc'}`,
                borderRadius: 8,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 3,
                cursor: 'pointer',
                transition: 'background 0.3s, border-color 0.3s',
              }}
            >
              <SkillDot color={isFed ? 'rgba(139,58,82,0.5)' : skill.color} />
              <span
                style={{
                  fontFamily: "'Press Start 2P', monospace",
                  fontSize: 3.5,
                  color: '#8b3a52',
                  textAlign: 'center',
                }}
              >
                {skill.label}
              </span>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
