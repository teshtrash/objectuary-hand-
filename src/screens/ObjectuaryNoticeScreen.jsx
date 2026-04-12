import { motion } from 'framer-motion'
import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { PALANQUIN_SEAL, SCANNER } from '../assets'
import './ObjectuaryNoticeScreen.css'

const PALANQUIN_TEXT = {
  title: 'The Palanquin',
  subtitle: 'Dalada Perahera, Kandy — carried annually, date of displacement: origin unknown',
  body: [
    'The palanquin was built to carry someone. It has never carried anyone. It appears in the Dalada Perahera each year as a ceremonial object moving through the procession in place of the Alathi Ammala — women with hereditary ties to the Dalada Maligawa whose ritual role is acknowledged by the temple and whose bodies are not permitted in the public procession. The object goes where they cannot.',
    'It was not made as an exclusion. It was made as a solution. The institution recognised that women belonged in the ritual and found a way to include them that did not require letting them in. The palanquin holds their place so precisely that the place appears full.',
    'From the street, watching the procession pass, there is no visible gap. The gap has been given a shape and the shape has been given legs. What was given to the Alathi Ammala was a marker, not a presence.',
    'A symbol that moved through Kandy in full public view while the people it stood for remained out of sight. This is the particular character of the burial: it was performed with great ceremony, in their name, and they were not there to see it.',
    'The palanquin is still carried. The women are still absent. The procession continues to call this an honour.',
    'What remains is a moving tombstone — visible, admired, and unable to speak for itself. The women it represents have not been asked whether it speaks for them.',
  ],
}

export default function ObjectuaryNoticeScreen({ onScan }) {
  const scrollRef = useRef(null)
  const scannerRef = useRef(null)

  useEffect(() => {
    gsap.from(scrollRef.current, {
      scale: 0.7,
      duration: 1,
      ease: 'back.out(1.2)',
      delay: 0.2,
    })

    gsap.from(scannerRef.current, {
      x: 60,
      duration: 0.6,
      delay: 1,
      ease: 'power2.out',
    })
  }, [])

  return (
    <motion.div
      className="screen notice-screen"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="notice-layout">
        <div className="scroll-container" ref={scrollRef}>
          <button className="scroll-close" aria-label="Close">×</button>
          <div className="scroll-top-rod" />

          <div className="scroll-body">
            <h2 className="notice-heading">OBJECTUARY NOTICE</h2>

            <div className="notice-palanquin-icon">
              <img src={PALANQUIN_SEAL} alt="Palanquin seal" />
            </div>

            <h3 className="notice-title">{PALANQUIN_TEXT.title}</h3>
            <p className="notice-subtitle">{PALANQUIN_TEXT.subtitle}</p>

            <div className="notice-text">
              {PALANQUIN_TEXT.body.map((para, i) => (
                <p key={i}>{para}</p>
              ))}
            </div>
          </div>

          <div className="scroll-bottom-rod" />
        </div>

        <div
          className="scanner-trigger"
          ref={scannerRef}
          onClick={onScan}
        >
          <img src={SCANNER} alt="Scanner" className="scanner-icon" />
          <span className="scanner-label">scan</span>
        </div>
      </div>
    </motion.div>
  )
}
