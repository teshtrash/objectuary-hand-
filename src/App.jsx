import { useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import OpeningScreen from './screens/OpeningScreen'
import GateScreen from './screens/GateScreen'
import ObjectuaryScreen from './screens/ObjectuaryScreen'
import './styles/global.css'

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('opening')
  const [revealing, setRevealing] = useState(false)

  const goTo = (screen) => setCurrentScreen(screen)

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
          key="objectuary"
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
