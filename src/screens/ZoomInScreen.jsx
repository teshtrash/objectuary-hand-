import { motion } from 'framer-motion'
import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { PALANQUIN, OBJECTUARY_ICON } from '../assets'
import './ZoomInScreen.css'

export default function ZoomInScreen({ onClickNotice }) {
  const palanquinRef = useRef(null)
  const noticeRef = useRef(null)
  const arrowRef = useRef(null)

  useEffect(() => {
    const tl = gsap.timeline({ delay: 0.3 })

    tl.from(palanquinRef.current, {
      scale: 0.5,
      duration: 1.2,
      ease: 'power3.out',
    })
    .from(noticeRef.current, {
      x: 40,
      rotation: 10,
      duration: 0.8,
      ease: 'back.out(1.4)',
    }, '-=0.3')
    .from(arrowRef.current, {
      x: 20,
      duration: 0.5,
      ease: 'power2.out',
    }, '-=0.2')

    // Arrow bounce
    gsap.to(arrowRef.current, {
      x: -10,
      duration: 0.8,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut',
    })
  }, [])

  return (
    <motion.div
      className="screen zoomin-screen"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="zoomin-layout">
        <div className="zoomin-palanquin" ref={palanquinRef}>
          <img src={PALANQUIN} alt="The Palanquin" />
        </div>

        <div className="zoomin-arrow" ref={arrowRef}>
          ►
        </div>

        <div
          className="zoomin-notice"
          ref={noticeRef}
          onClick={onClickNotice}
        >
          <img src={OBJECTUARY_ICON} alt="Objectuary notice" />
        </div>
      </div>

      <p className="zoomin-hint">click the objectuary notice to read</p>
    </motion.div>
  )
}
