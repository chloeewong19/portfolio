import { useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import Creature from '../components/Creature'
import { projects } from '../data/projects'

function ProjectIcon({ type }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    ctx.clearRect(0, 0, 24, 24)

    ctx.strokeStyle = '#8b3a52'
    ctx.fillStyle = '#8b3a52'
    ctx.lineWidth = 1.5
    ctx.lineCap = 'round'

    if (type === 'magnifying-glass') {
      ctx.beginPath()
      ctx.arc(9, 9, 6, 0, Math.PI * 2)
      ctx.stroke()
      ctx.beginPath()
      ctx.moveTo(13, 13)
      ctx.lineTo(20, 20)
      ctx.stroke()
    } else if (type === 'calendar') {
      ctx.strokeRect(3, 5, 18, 16)
      ctx.beginPath()
      ctx.moveTo(3, 10)
      ctx.lineTo(21, 10)
      ctx.stroke()
      ctx.beginPath()
      ctx.moveTo(8, 2)
      ctx.lineTo(8, 7)
      ctx.moveTo(16, 2)
      ctx.lineTo(16, 7)
      ctx.stroke()
      // grid dots
      for (let row = 0; row < 2; row++) {
        for (let col = 0; col < 4; col++) {
          ctx.beginPath()
          ctx.arc(5.5 + col * 4, 13.5 + row * 4, 1, 0, Math.PI * 2)
          ctx.fill()
        }
      }
    } else if (type === 'coin') {
      ctx.beginPath()
      ctx.arc(12, 12, 9, 0, Math.PI * 2)
      ctx.stroke()
      ctx.font = 'bold 8px monospace'
      ctx.fillStyle = '#8b3a52'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText('$', 12, 12)
    } else if (type === 'sneaker') {
      // Simple shoe silhouette
      ctx.beginPath()
      ctx.moveTo(3, 18)
      ctx.lineTo(3, 12)
      ctx.quadraticCurveTo(4, 7, 10, 7)
      ctx.lineTo(18, 8)
      ctx.quadraticCurveTo(22, 9, 21, 14)
      ctx.lineTo(21, 18)
      ctx.closePath()
      ctx.stroke()
      // lace line
      ctx.beginPath()
      ctx.moveTo(8, 10)
      ctx.lineTo(16, 10)
      ctx.stroke()
    }
  }, [type])

  return (
    <canvas
      ref={canvasRef}
      width={24}
      height={24}
      style={{ imageRendering: 'pixelated', display: 'block' }}
    />
  )
}

export default function WorkScreen({ navigate, setCreatureAnim, sound, onSelectProject }) {
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
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '8px 10px 4px',
          flexShrink: 0,
        }}
      >
        <span
          style={{
            fontFamily: "'Press Start 2P', monospace",
            fontSize: 6,
            color: '#8b3a52',
          }}
        >
          ITEMS
        </span>
        <div style={{ flexShrink: 0 }}>
          <Creature animState="work" scale={0.5} />
        </div>
      </div>

      {/* Project grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 8,
          padding: '4px 10px 8px',
          flex: 1,
          alignContent: 'start',
        }}
      >
        {projects.map((project) => (
          <motion.div
            key={project.id}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => {
              setCreatureAnim('happy')
              setTimeout(() => {
                if (onSelectProject) onSelectProject(project)
              }, 400)
            }}
            style={{
              width: 56,
              height: 56,
              background: '#fff0f5',
              border: '1.5px solid #e8c0cc',
              borderRadius: 8,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 4,
              cursor: 'pointer',
              margin: '0 auto',
            }}
          >
            <ProjectIcon type={project.icon} />
            <span
              style={{
                fontFamily: "'Press Start 2P', monospace",
                fontSize: 4,
                color: '#8b3a52',
                textAlign: 'center',
              }}
            >
              {project.name}
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
