import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import StatusBar from './StatusBar'
import BootScreen from '../screens/BootScreen'
import HomeScreen from '../screens/HomeScreen'
import WorkScreen from '../screens/WorkScreen'
import AboutScreen from '../screens/AboutScreen'
import SkillsScreen from '../screens/SkillsScreen'
import ContactScreen from '../screens/ContactScreen'

function ScreenRouter({ screen, navigate, creatureAnim, setCreatureAnim, stats, setStats, sound, onSelectProject, homeIconIdx, onBootDone }) {
  switch (screen) {
    case 'boot':
      return <BootScreen onDone={onBootDone} sound={sound} />
    case 'home':
      return (
        <HomeScreen
          navigate={navigate}
          setCreatureAnim={setCreatureAnim}
          sound={sound}
          homeIconIdx={homeIconIdx}
        />
      )
    case 'work':
      return (
        <WorkScreen
          navigate={navigate}
          setCreatureAnim={setCreatureAnim}
          sound={sound}
          onSelectProject={onSelectProject}
        />
      )
    case 'about':
      return (
        <AboutScreen
          navigate={navigate}
          stats={stats}
          setCreatureAnim={setCreatureAnim}
        />
      )
    case 'skills':
      return (
        <SkillsScreen
          navigate={navigate}
          stats={stats}
          setStats={setStats}
          setCreatureAnim={setCreatureAnim}
          sound={sound}
        />
      )
    case 'contact':
      return (
        <ContactScreen
          navigate={navigate}
          sound={sound}
          setCreatureAnim={setCreatureAnim}
        />
      )
    default:
      return (
        <HomeScreen
          navigate={navigate}
          setCreatureAnim={setCreatureAnim}
          sound={sound}
          homeIconIdx={homeIconIdx}
        />
      )
  }
}

export default function Screen({
  currentScreen,
  navigate,
  creatureAnim,
  setCreatureAnim,
  stats,
  setStats,
  sound,
  onSelectProject,
  homeIconIdx,
  onBootDone,
}) {
  const [displayed, setDisplayed] = useState(currentScreen)
  const [wiping, setWiping] = useState(false)
  const prevScreen = useRef(currentScreen)

  useEffect(() => {
    if (currentScreen === prevScreen.current) return
    prevScreen.current = currentScreen

    setWiping(true)
    const t1 = setTimeout(() => {
      setDisplayed(currentScreen)
    }, 110)
    const t2 = setTimeout(() => {
      setWiping(false)
    }, 120)

    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
    }
  }, [currentScreen])

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <StatusBar currentScreen={displayed} stats={stats} />

      {/* Screen content */}
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        <ScreenRouter
          screen={displayed}
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

        {/* Wipe overlay */}
        <motion.div
          animate={{ scaleX: wiping ? 1 : 0 }}
          transition={{ duration: 0.1, ease: 'easeInOut' }}
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 10,
            background: '#3a1020',
            transformOrigin: 'left',
            pointerEvents: wiping ? 'all' : 'none',
          }}
        />
      </div>
    </div>
  )
}
