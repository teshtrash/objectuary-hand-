import { motion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { PALANQUIN_SEAL, SCANNER_ON } from '../assets'
import './ScannerScreen.css'

const RESULTS = ['burial', 'cremated', 'organ-donation', 'preserved']

export default function ScannerScreen({ onComplete }) {
  const beamRef = useRef(null)
  const scannerRef = useRef(null)
  const progressRef = useRef(null)
  const [scanning, setScanning] = useState(false)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    gsap.from(scannerRef.current, {
      x: 100,
      duration: 0.8,
      ease: 'power2.out',
      delay: 0.3,
    })
  }, [])

  const startScan = () => {
    if (scanning) return
    setScanning(true)

    const tl = gsap.timeline()

    // Beam sweep animation
    tl.to(beamRef.current, {
      opacity: 1,
      duration: 0.3,
    })

    // Sweep the beam down
    tl.fromTo(
      beamRef.current,
      { clipPath: 'polygon(60% 0%, 100% 0%, 100% 0%, 0% 0%)' },
      {
        clipPath: 'polygon(60% 0%, 100% 0%, 100% 100%, 0% 100%)',
        duration: 3,
        ease: 'none',
        onUpdate: function () {
          setProgress(Math.round(this.progress() * 100))
        },
      }
    )

    // Flash on complete
    tl.to(beamRef.current, {
      opacity: 0,
      duration: 0.5,
    })

    tl.call(() => {
      const randomResult = RESULTS[Math.floor(Math.random() * RESULTS.length)]
      onComplete(randomResult)
    }, null, '+=0.3')
  }

  return (
    <motion.div
      className="screen scanner-screen"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="scanner-layout">
        <div className="scan-target">
          <div className="scan-document">
            <div className="scroll-top-rod" />
            <div className="scan-doc-body">
              <h3>OBJECTUARY NOTICE</h3>
              <div className="scan-doc-placeholder">
                <img src={PALANQUIN_SEAL} alt="" className="scan-seal" />
                <h4>The Palanquin</h4>
                <p className="scan-subtitle">Dalada Perahera, Kandy</p>
                <div className="scan-text-lines">
                  {Array.from({ length: 12 }).map((_, i) => (
                    <div key={i} className="text-line" style={{ width: `${60 + Math.random() * 30}%` }} />
                  ))}
                </div>
              </div>
            </div>
            <div className="scroll-bottom-rod" />
          </div>

          <div className="scan-beam" ref={beamRef} />
        </div>

        <div className="scanner-device" ref={scannerRef} onClick={startScan}>
          <img src={SCANNER_ON} alt="Scanner" />
          {!scanning && <span className="scanner-click-hint">click to scan</span>}
        </div>
      </div>

      {scanning && (
        <div className="scan-progress" ref={progressRef}>
          <div className="scan-progress-bar">
            <div className="scan-progress-fill" style={{ width: `${progress}%` }} />
          </div>
          <span className="scan-progress-text">{progress}%</span>
        </div>
      )}
    </motion.div>
  )
}
