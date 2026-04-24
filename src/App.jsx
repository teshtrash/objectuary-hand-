import { useState, useEffect, useRef, useCallback } from 'react'
import { AnimatePresence } from 'framer-motion'
import OpeningScreen from './screens/OpeningScreen'
import GateScreen from './screens/GateScreen'
import ObjectuaryScreen from './screens/ObjectuaryScreen'
import HandCursor from './components/HandCursor'
import { useAudio } from './hooks/useAudio'
import { AMBIENT_SOUNDTRACK, GENERIC_CLICK } from './audio'
import './styles/global.css'

const INACTIVITY_TIMEOUT_MS = 30_000

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('opening')
  const [revealing, setRevealing] = useState(false)
  const [objectuaryKey, setObjectuaryKey] = useState(0)
  const [handTrackingEnabled, setHandTrackingEnabled] = useState(true)
  const inactivityTimer = useRef(null)
  const { loop, play } = useAudio()
  const soundtrackStarted = useRef(false)

  const goTo = (screen) => setCurrentScreen(screen)

  const resetToOpening = useCallback(() => {
    setCurrentScreen('opening')
    setRevealing(false)
    setObjectuaryKey(k => k + 1) // force fresh tomb layout next visit
  }, [])

  const restartTimer = useCallback(() => {
    if (inactivityTimer.current) clearTimeout(inactivityTimer.current)
    inactivityTimer.current = setTimeout(() => {
      setCurrentScreen((current) => {
        if (current !== 'opening') {
          setRevealing(false)
          setObjectuaryKey(k => k + 1) // fresh layout on inactivity reset
          return 'opening'
        }
        return current
      })
    }, INACTIVITY_TIMEOUT_MS)
  }, [])

  const handleGlobalClick = useCallback(() => {
    play(GENERIC_CLICK)
    const el = document.documentElement
    if (!document.fullscreenElement && 
        !document.webkitFullscreenElement && 
        !document.mozFullScreenElement && 
        !document.msFullscreenElement) {
      const requestFS =
        el.requestFullscreen ||
        el.webkitRequestFullscreen ||
        el.mozRequestFullScreen ||
        el.msRequestFullscreen
      if (requestFS) requestFS.call(el).catch(() => {})
    }

    // Start soundtrack on first interaction
    if (!soundtrackStarted.current) {
      loop(AMBIENT_SOUNDTRACK, { volume: 0.6 })
      soundtrackStarted.current = true
    }
  }, [loop])

  useEffect(() => {
    const inactivityEvents = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll']
    inactivityEvents.forEach((e) => window.addEventListener(e, restartTimer, { passive: true }))
    
    // Fullscreen trigger on any real user interaction
    // We use capture: true to ensure this runs even if child elements stop propagation
    const interactionEvents = ['click', 'mousedown', 'touchstart']
    interactionEvents.forEach((e) => window.addEventListener(e, handleGlobalClick, { capture: true }))

    // Toggle hand tracking with 'H' key
    const handleKeydown = (e) => {
      if (e.key === 'h' || e.key === 'H') {
        setHandTrackingEnabled(prev => !prev)
      }
    }
    window.addEventListener('keydown', handleKeydown)
    
    restartTimer() 
    return () => {
      inactivityEvents.forEach((e) => window.removeEventListener(e, restartTimer))
      interactionEvents.forEach((e) => window.removeEventListener(e, handleGlobalClick, { capture: true }))
      window.removeEventListener('keydown', handleKeydown)
      if (inactivityTimer.current) clearTimeout(inactivityTimer.current)
    }
  }, [restartTimer, handleGlobalClick])

  // Gate→Cemetery is special: cemetery renders underneath the gate,
  // gate slides apart revealing it, then gate unmounts. No AnimatePresence swap.
  const showCemeteryBehindGate = currentScreen === 'gate' || currentScreen === 'objectuary'

  const renderScreen = () => {
    switch (currentScreen) {
      case 'opening':
        return <OpeningScreen key="opening" onEnter={() => goTo('gate')} />
      default:
        return null
    }
  }

  return (
    <div className="app">
      {/* Hand gesture tracking overlay */}
      <HandCursor enabled={handTrackingEnabled} />
      {/* Cemetery lives permanently behind the gate — no swap, no flicker */}
      {showCemeteryBehindGate && (
        <ObjectuaryScreen
          key={`objectuary-${objectuaryKey}`}
          disableInteraction={currentScreen === 'gate'}
          revealing={revealing}
          onHome={resetToOpening}
        />
      )}

      {/* Gate overlays the cemetery, slides apart, then unmounts */}
      {currentScreen === 'gate' && (
        <GateScreen
          key="gate"
          onStartOpening={() => setRevealing(true)}
          onEnter={() => goTo('objectuary')}
        />
      )}

      {/* All other screens use AnimatePresence normally */}
      <AnimatePresence mode="wait">
        {renderScreen()}
      </AnimatePresence>
    </div>
  )
}
