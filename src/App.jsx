import { useState, useEffect, useRef, useCallback } from 'react'
import { AnimatePresence } from 'framer-motion'
import OpeningScreen from './screens/OpeningScreen'
import GateScreen from './screens/GateScreen'
import ObjectuaryScreen from './screens/ObjectuaryScreen'
import './styles/global.css'

const INACTIVITY_TIMEOUT_MS = 30_000

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('opening')
  const [revealing, setRevealing] = useState(false)
  const [objectuaryKey, setObjectuaryKey] = useState(0)
  const inactivityTimer = useRef(null)

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

  useEffect(() => {
    const events = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll']
    events.forEach((e) => window.addEventListener(e, restartTimer, { passive: true }))
    restartTimer() // start the timer on mount
    return () => {
      events.forEach((e) => window.removeEventListener(e, restartTimer))
      if (inactivityTimer.current) clearTimeout(inactivityTimer.current)
    }
  }, [restartTimer])

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
      {/* Cemetery lives permanently behind the gate — no swap, no flicker */}
      {showCemeteryBehindGate && (
        <ObjectuaryScreen
          key={`objectuary-${objectuaryKey}`}
          disableInteraction={currentScreen === 'gate'}
          revealing={revealing}
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
