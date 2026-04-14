import { motion } from 'framer-motion'

export default function HeroText({ isVisible }) {
  return (
    <div
      style={{
        textAlign: 'center',
        pointerEvents: 'none',
        userSelect: 'none',
      }}
    >
      <motion.h1
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 12 }}
        transition={{ delay: 0.3, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        style={{
          fontFamily: '"Cormorant Garamond", Georgia, serif',
          fontSize: 'clamp(48px, 5vw, 72px)',
          fontWeight: 300,
          fontStyle: 'italic',
          color: '#fdf0f0',
          margin: 0,
          lineHeight: 1.1,
          letterSpacing: '-0.01em',
        }}
      >
        Chloe Wong
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 8 }}
        transition={{ delay: 0.6, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        style={{
          fontFamily: '"DM Sans", sans-serif',
          fontSize: 'clamp(11px, 1.1vw, 15px)',
          fontWeight: 300,
          letterSpacing: '0.22em',
          color: '#e8c0cc',
          textTransform: 'uppercase',
          margin: '18px 0 0',
        }}
      >
        HFE + CS — Tufts University
      </motion.p>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: isVisible ? 1 : 0 }}
        transition={{ delay: 0.9, duration: 0.6 }}
        style={{
          fontFamily: '"Cormorant Garamond", Georgia, serif',
          fontSize: 'clamp(16px, 1.7vw, 22px)',
          fontWeight: 400,
          fontStyle: 'italic',
          color: 'rgba(253,240,240,0.68)',
          margin: '14px 0 0',
        }}
      >
        I design things that work — on screen and off it.
      </motion.p>
    </div>
  )
}
