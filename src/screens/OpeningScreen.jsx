import { motion } from 'framer-motion'
import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import './OpeningScreen.css'

export default function OpeningScreen({ onEnter }) {
  const containerRef = useRef(null)

  useEffect(() => {
    const tl = gsap.timeline({ delay: 0.8 })
    
    const items = containerRef.current.querySelectorAll('.critique-item')
    // Only animate position, not opacity — Framer Motion handles the fade
    items.forEach(el => { el.style.opacity = '1' })
    tl.from(items, {
      y: 25,
      stagger: 0.25,
      duration: 0.8,
      ease: 'power2.out',
    })
    .from('.enter-btn', {
      y: 15,
      duration: 0.6,
      ease: 'power2.out',
    }, '-=0.2')
  }, [])

  return (
    <motion.div
      className="screen opening-screen"
      ref={containerRef}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="opening-content">
        <div className="critique-block">
          <p className="critique-item">
            <strong>1. The "Designer as Savior" Complex</strong> — You claim to represent the
            "othered," but your document is entirely your own voice. You describe the Pavement
            Hawker Stall with flowery, poetic prose — "fruit, grams, and small comforts" —
            which feels like a romanticized observation from a student's sketchbook rather than
            a rigorous interrogation of displacement. By "writing the story on behalf of them,"
            you are technically performing the exact act of "Othering" you claim to critique:
            you are the dominant voice defining the silent subject.
          </p>
          <p className="critique-item">
            <strong>2. Visual Language vs. Conceptual Weight</strong> — Your sketches are literal.
            A cemetery for dead things is the most "Entry Level" metaphor possible for "Otherness".
            While the concept of the "Objectuary" is clever, the visual execution (simple tombstones)
            doesn't yet live up to the complexity of the sociological theory you are citing about
            "unbridgeable unknown" states of being.
          </p>
          <p className="critique-item">
            <strong>3. The Interaction Paradox</strong> — Your "zero-sum" attention mechanic is your
            strongest idea, but it's currently a double-edged sword. If this is a library intended
            for "memorium and celebration," allowing the most vulnerable stories to disappear because
            they aren't "popular" is a cruel design choice. You've built a system that punishes the
            "Other" for not being interesting enough to the user.
          </p>
          <p className="critique-item">
            <strong>4. Technical Sloppiness</strong> — In the second semester, details matter.
            Misspelling "DECEASED" as "DESEASED" on your primary cover image is a "hard fail" in
            a professional or academic presentation. It suggests that while you are thinking deeply
            about "Otherness," you aren't looking closely at your own canvas.
          </p>
        </div>

        <button className="enter-btn" onClick={onEnter}>
          Enter
        </button>
      </div>
    </motion.div>
  )
}
