import { useRef, useState } from 'react'
import { gsap } from 'gsap'
import { GATE_BG } from '../assets'
import { useAudio } from '../hooks/useAudio'
import { GATE_OPEN } from '../audio'
import './GateScreen.css'

export default function GateScreen({ onEnter, onStartOpening }) {
  const leftRef = useRef(null)
  const rightRef = useRef(null)
  const containerRef = useRef(null)
  const [opening, setOpening] = useState(false)
  const { play } = useAudio()

  const handleEnter = () => {
    if (opening) return
    setOpening(true)
    onStartOpening?.()
    play(GATE_OPEN)

    const tl = gsap.timeline({
      onComplete: () => {
        onEnter()
      }
    })

    tl.to(leftRef.current, {
      x: '-100%',
      duration: 2,
      ease: 'power2.inOut',
    })
    .to(rightRef.current, {
      x: '100%',
      duration: 2,
      ease: 'power2.inOut',
    }, '<')
  }

  return (
    <div
      className="screen gate-screen gate-overlay"
      ref={containerRef}
      onClick={handleEnter}
    >
      {/* Gate halves — real cemetery is already rendered underneath in App.jsx */}
      <div className="gate-half gate-half--left" ref={leftRef} style={{ backgroundImage: `url('${GATE_BG}')` }} />
      <div className="gate-half gate-half--right" ref={rightRef} style={{ backgroundImage: `url('${GATE_BG}')` }} />

      {!opening && <p className="gate-hint">click to enter</p>}
    </div>
  )
}
