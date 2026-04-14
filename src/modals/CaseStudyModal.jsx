import { useState } from 'react'
import { motion } from 'framer-motion'

export default function CaseStudyModal({ project, onClose, sound }) {
  const [closing, setClosing] = useState(false)

  function handleClose() {
    setClosing(true)
    setTimeout(() => {
      if (onClose) onClose()
    }, 300)
  }

  if (!project) return null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: closing ? 0 : 1 }}
      transition={{ duration: 0.2 }}
      onClick={(e) => { if (e.target === e.currentTarget) handleClose() }}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        background: 'rgba(253,240,240,0.96)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px 16px',
        overflowY: 'auto',
      }}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: closing ? 0.9 : 1, opacity: closing ? 0 : 1 }}
        transition={{ duration: 0.2 }}
        style={{
          maxWidth: 680,
          width: '100%',
          background: 'rgba(253,246,240,0.99)',
          borderRadius: 16,
          border: '1px solid #e8c0cc',
          boxShadow: '0 8px 40px rgba(139,58,82,0.12)',
          position: 'relative',
          maxHeight: '90vh',
          overflowY: 'auto',
        }}
      >
        {/* Close button */}
        <button
          onClick={handleClose}
          style={{
            position: 'absolute',
            top: 16,
            right: 16,
            background: 'none',
            border: '1px solid #e8c0cc',
            borderRadius: 6,
            padding: '4px 8px',
            cursor: 'pointer',
            fontFamily: "'Press Start 2P', monospace",
            fontSize: 6,
            color: '#8b3a52',
            zIndex: 2,
          }}
        >
          ✕ CLOSE
        </button>

        {/* Content */}
        <div style={{ padding: '48px 40px' }}>
          {/* Project name */}
          <div style={{ marginBottom: 8 }}>
            <h1
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: 42,
                fontWeight: 400,
                color: '#2a1a20',
                lineHeight: 1.1,
                marginBottom: 8,
              }}
            >
              {project.name}
            </h1>
            <p
              style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 14,
                color: '#7a5060',
                fontWeight: 400,
              }}
            >
              {project.role} &nbsp;·&nbsp; {project.year}
            </p>
          </div>

          {/* Tags */}
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 20, marginTop: 12 }}>
            {project.tags && project.tags.map((tag) => (
              <span
                key={tag}
                style={{
                  fontFamily: "'Press Start 2P', monospace",
                  fontSize: 6,
                  color: '#8b3a52',
                  border: '1px solid #e8c0cc',
                  background: '#fdf0f4',
                  borderRadius: 4,
                  padding: '3px 8px',
                }}
              >
                {tag}
              </span>
            ))}
          </div>

          {/* Divider */}
          <div style={{ height: 1, background: '#e8c0cc', marginBottom: 24 }} />

          {/* Overview */}
          {project.overview && (
            <div style={{ marginBottom: 20 }}>
              <div
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: 13,
                  fontWeight: 500,
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  color: '#c47a8a',
                  marginBottom: 8,
                }}
              >
                Overview
              </div>
              <p
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: 15,
                  color: '#2a1a20',
                  lineHeight: 1.8,
                }}
              >
                {project.overview}
              </p>
            </div>
          )}

          {/* My Role */}
          {project.myRole && (
            <div style={{ marginBottom: 20 }}>
              <div
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: 13,
                  fontWeight: 500,
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  color: '#c47a8a',
                  marginBottom: 8,
                }}
              >
                My Role
              </div>
              <p
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: 15,
                  color: '#2a1a20',
                  lineHeight: 1.8,
                }}
              >
                {project.myRole}
              </p>
            </div>
          )}

          {/* Process */}
          {project.process && (
            <div style={{ marginBottom: 20 }}>
              <div
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: 13,
                  fontWeight: 500,
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  color: '#c47a8a',
                  marginBottom: 8,
                }}
              >
                Process
              </div>
              <p
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: 15,
                  color: '#2a1a20',
                  lineHeight: 1.8,
                  marginBottom: 12,
                }}
              >
                {project.process}
              </p>
              {/* Image placeholder */}
              <div
                style={{
                  aspectRatio: '16/9',
                  background: '#fdf0f4',
                  border: '1px dashed #e8c0cc',
                  borderRadius: 8,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <span
                  style={{
                    fontFamily: "'Press Start 2P', monospace",
                    fontSize: 6,
                    color: '#c47a8a',
                  }}
                >
                  [ project image ]
                </span>
              </div>
            </div>
          )}

          {/* Outcome */}
          {project.outcome && (
            <div style={{ marginBottom: 20 }}>
              <div
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: 13,
                  fontWeight: 500,
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  color: '#c47a8a',
                  marginBottom: 8,
                }}
              >
                Outcome
              </div>
              <p
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: 15,
                  color: '#2a1a20',
                  lineHeight: 1.8,
                }}
              >
                {project.outcome}
              </p>
            </div>
          )}

          {/* Footer */}
          <div style={{ marginTop: 32, paddingTop: 20, borderTop: '1px solid #e8c0cc' }}>
            <button
              onClick={handleClose}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontFamily: "'Press Start 2P', monospace",
                fontSize: 6,
                color: '#c47a8a',
                padding: 0,
              }}
            >
              ← BACK TO DEVICE
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
