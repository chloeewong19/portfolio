import { useCallback } from 'react'
import { motion, useAnimation } from 'framer-motion'
import Screen from './Screen'

export default function Shell({
  currentScreen,
  navigate,
  stats,
  setStats,
  creatureAnim,
  setCreatureAnim,
  sound,
  toggleSound,
  onSelectProject,
  onLeft,
  onMiddle,
  onRight,
  homeIconIdx,
  onBootDone,
}) {
  const controls = useAnimation()

  const handleButtonPress = useCallback((which) => {
    controls.start({
      rotate: [0, -1.5, 1.5, -1, 1, 0],
      transition: { duration: 0.35 },
    })
    if (which === 'left') onLeft()
    else if (which === 'middle') onMiddle()
    else if (which === 'right') onRight()
  }, [controls, onLeft, onMiddle, onRight])

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'transparent',
      }}
    >
      <motion.div
        animate={controls}
        style={{
          width: 'min(480px, 92vw)',
          height: 'min(680px, 96vh)',
          borderRadius: '50% 50% 45% 45% / 40% 40% 48% 48%',
          background: '#fdf6f0',
          border: '5px solid #c47a8a',
          boxShadow: '0 0 0 3px #fdf0f0, 0 0 0 7px #c47a8a, 10px 16px 0 2px #e8b4c0, inset 0 3px 12px rgba(180,80,100,0.07)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'flex-start',
          paddingTop: 28,
          gap: 0,
          position: 'relative',
          userSelect: 'none',
        }}
      >
        {/* Keychain hole */}
        <div
          style={{
            position: 'absolute',
            top: -16,
            left: '50%',
            transform: 'translateX(-50%)',
            width: 20,
            height: 20,
            borderRadius: '50%',
            border: '4px solid #c47a8a',
            background: '#fdf0f0',
          }}
        />

        {/* Screen bezel */}
        <div
          style={{
            width: '84%',
            aspectRatio: '4/3',
            background: '#b06878',
            borderRadius: 18,
            padding: 6,
            boxShadow: 'inset 0 3px 10px rgba(100,30,50,0.35)',
            position: 'relative',
            flexShrink: 0,
          }}
        >
          {/* LCD area */}
          <div
            style={{
              width: '100%',
              height: '100%',
              background: '#ffe8f0',
              borderRadius: 13,
              overflow: 'hidden',
              position: 'relative',
            }}
          >
            {/* Screen reflection */}
            <div
              style={{
                position: 'absolute',
                top: 10,
                left: 14,
                width: 36,
                height: 18,
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.32)',
                pointerEvents: 'none',
                zIndex: 3,
              }}
            />

            {/* Screen content */}
            <div style={{ position: 'relative', zIndex: 1, width: '100%', height: '100%' }}>
              <Screen
                currentScreen={currentScreen}
                navigate={navigate}
                creatureAnim={creatureAnim}
                setCreatureAnim={setCreatureAnim}
                stats={stats}
                setStats={setStats}
                sound={sound}
                onSelectProject={onSelectProject}
                homeIconIdx={homeIconIdx}
                onBootDone={onBootDone}
              />
            </div>

            {/* Scanline overlay */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                backgroundImage:
                  'repeating-linear-gradient(to bottom, transparent 0px, transparent 3px, rgba(180,80,120,0.04) 3px, rgba(180,80,120,0.04) 4px)',
                pointerEvents: 'none',
                zIndex: 2,
              }}
            />
          </div>
        </div>

        {/* Left decorative dot */}
        <div
          style={{
            position: 'absolute',
            width: 10,
            height: 10,
            borderRadius: '50%',
            background: '#e8c0cc',
            top: '38%',
            left: '8%',
          }}
        />

        {/* Right decorative dot */}
        <div
          style={{
            position: 'absolute',
            width: 10,
            height: 10,
            borderRadius: '50%',
            background: '#e8c0cc',
            top: '38%',
            right: '8%',
          }}
        />

        {/* Buttons row */}
        <div
          style={{
            display: 'flex',
            gap: 24,
            marginTop: 20,
            alignItems: 'center',
          }}
        >
          {/* Left button */}
          <motion.button
            whileTap={{ y: 4, boxShadow: '0 1px 0 #9a4060' }}
            onClick={() => handleButtonPress('left')}
            style={{
              width: 36,
              height: 36,
              borderRadius: '50%',
              border: '4px solid #b06878',
              cursor: 'pointer',
              background: '#f4afc0',
              boxShadow: '0 5px 0 #9a4060',
              outline: 'none',
            }}
          />

          {/* Middle button */}
          <motion.button
            whileTap={{ y: 4, boxShadow: '0 1px 0 #b07090' }}
            onClick={() => handleButtonPress('middle')}
            style={{
              width: 42,
              height: 42,
              borderRadius: '50%',
              border: '4px solid #b06878',
              cursor: 'pointer',
              background: '#f9d4de',
              boxShadow: '0 5px 0 #b07090',
              outline: 'none',
            }}
          />

          {/* Right button */}
          <motion.button
            whileTap={{ y: 4, boxShadow: '0 1px 0 #9a6080' }}
            onClick={() => handleButtonPress('right')}
            style={{
              width: 36,
              height: 36,
              borderRadius: '50%',
              border: '4px solid #b06878',
              cursor: 'pointer',
              background: '#e8c8d8',
              boxShadow: '0 5px 0 #9a6080',
              outline: 'none',
            }}
          />
        </div>

        {/* Button labels */}
        <div
          style={{
            display: 'flex',
            gap: 24,
            marginTop: 4,
            alignItems: 'center',
          }}
        >
          <span
            style={{
              fontFamily: "'Press Start 2P', monospace",
              fontSize: 5,
              color: '#b07080',
              width: 36,
              textAlign: 'center',
            }}
          >
            BACK
          </span>
          <span
            style={{
              fontFamily: "'Press Start 2P', monospace",
              fontSize: 5,
              color: '#b07080',
              width: 42,
              textAlign: 'center',
            }}
          >
            OK
          </span>
          <span
            style={{
              fontFamily: "'Press Start 2P', monospace",
              fontSize: 5,
              color: '#b07080',
              width: 36,
              textAlign: 'center',
            }}
          >
            NEXT
          </span>
        </div>

        {/* Speaker grille */}
        <div
          style={{
            display: 'flex',
            gap: 6,
            marginTop: 12,
            alignItems: 'center',
          }}
        >
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              style={{
                width: 5,
                height: 5,
                background: '#e0b0bc',
                borderRadius: '50%',
              }}
            />
          ))}
        </div>

        {/* Sound toggle */}
        <button
          onClick={toggleSound}
          style={{
            position: 'absolute',
            bottom: 16,
            right: 24,
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontFamily: "'Press Start 2P', monospace",
            fontSize: 8,
            color: '#c47a8a',
            lineHeight: 1,
            padding: 4,
            opacity: sound ? 1 : 0.4,
          }}
          title={sound ? 'Sound on' : 'Sound off'}
        >
          {sound ? '♪' : '♪'}
        </button>
      </motion.div>
    </div>
  )
}
