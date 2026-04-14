import { useState, useEffect, useCallback } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import Shell from './components/Shell'
import CaseStudyModal from './modals/CaseStudyModal'
import HeroSection from './HeroSection'
import { sounds } from './sound'

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('boot')
  const [selectedProject, setSelectedProject] = useState(null)
  const [stats, setStats] = useState({ hunger: 3, happiness: 4, energy: 4 })
  const [level] = useState(2)
  const [sound, setSound] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [creatureAnim, setCreatureAnim] = useState('idle')
  const [homeIconIdx, setHomeIconIdx] = useState(0)
  const [entranceDone, setEntranceDone] = useState(false)

  const navigate = useCallback((screen) => {
    sounds.nav(sound)
    setCurrentScreen(screen)
  }, [sound])

  const handleLeft = useCallback(() => {
    sounds.button(sound)
    if (currentScreen !== 'home' && currentScreen !== 'boot') {
      navigate('home')
    }
  }, [currentScreen, navigate, sound])

  const handleMiddle = useCallback(() => {
    sounds.button(sound)
    if (currentScreen === 'home') {
      const screens = ['work', 'about', 'skills', 'contact']
      navigate(screens[homeIconIdx])
    }
  }, [currentScreen, navigate, homeIconIdx, sound])

  const handleRight = useCallback(() => {
    sounds.button(sound)
    if (currentScreen === 'home') {
      setHomeIconIdx(i => (i + 1) % 4)
    }
  }, [currentScreen, sound])

  const openModal = useCallback((project) => {
    setSelectedProject(project)
    setIsModalOpen(true)
    sounds.modal(sound)
  }, [sound])

  const closeModal = useCallback(() => {
    setIsModalOpen(false)
    setTimeout(() => setSelectedProject(null), 300)
  }, [])

  useEffect(() => {
    const handleKey = (e) => {
      if (isModalOpen) {
        if (e.key === 'Escape') closeModal()
        return
      }
      if (e.key === 'ArrowRight' || e.key === 'd') handleRight()
      if (e.key === 'ArrowLeft' || e.key === 'a') handleLeft()
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        handleMiddle()
      }
      if (e.key === 'Escape') handleLeft()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [currentScreen, isModalOpen, homeIconIdx, sound, handleLeft, handleMiddle, handleRight, closeModal])

  return (
    <>
      <AnimatePresence>
        {!entranceDone && (
          <motion.div
            key="shell"
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            style={{ position: 'fixed', inset: 0, zIndex: 10 }}
          >
            <Shell
              currentScreen={currentScreen}
              navigate={navigate}
              stats={stats}
              setStats={setStats}
              creatureAnim={creatureAnim}
              setCreatureAnim={setCreatureAnim}
              sound={sound}
              toggleSound={() => setSound(s => !s)}
              onSelectProject={openModal}
              onLeft={handleLeft}
              onMiddle={handleMiddle}
              onRight={handleRight}
              homeIconIdx={homeIconIdx}
              onBootDone={() => {
                setCurrentScreen('home')
                setCreatureAnim('idle')
                setTimeout(() => setEntranceDone(true), 1200)
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {entranceDone && (
        <HeroSection isVisible={entranceDone} sound={sound} />
      )}

      {isModalOpen && selectedProject && (
        <CaseStudyModal
          project={selectedProject}
          onClose={closeModal}
          sound={sound}
        />
      )}
    </>
  )
}
