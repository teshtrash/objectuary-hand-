import { motion } from 'framer-motion'
import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { PALANQUIN, SCANNER_ON } from '../assets'
import './ResultScreen.css'

const RESULT_DATA = {
  preserved: {
    label: 'Preserved',
    tagline: 'Image is taken for aesthetic purposes',
    bgClass: 'result--preserved',
    description:
      'The object is kept intact — displayed, admired, catalogued. Its context is stripped but its form survives. A beautiful cage. The story behind it is replaced by the story the institution chooses to tell.',
  },
  cremated: {
    label: 'Cremated',
    tagline: 'presence is vanished',
    bgClass: 'result--cremated',
    description:
      'Complete erasure. The object, its story, and the people it represented are consumed. Nothing remains — not even the gap. The absence itself has been made absent.',
  },
  burial: {
    label: 'Buried',
    tagline: 'Essence of it is left in a form of a symbol',
    bgClass: 'result--burial',
    description:
      'The object is reduced to a symbol — a stamp, a shorthand, a footnote. It exists only as reference. The weight is gone. What survives is the shape of meaning without the substance of presence.',
  },
  'organ-donation': {
    label: 'Organ Donated',
    tagline: 'Only the useful parts are taken',
    bgClass: 'result--organ',
    description:
      'The object is selectively harvested. Useful fragments — a date, a material, a decorative pattern — are extracted for academic papers, museum labels, gift shop reproductions. The rest is discarded.',
  },
}

export default function ResultScreen({ result, onBack }) {
  const data = RESULT_DATA[result] || RESULT_DATA.preserved
  const containerRef = useRef(null)
  const labelRef = useRef(null)
  const contentRef = useRef(null)

  useEffect(() => {
    const tl = gsap.timeline({ delay: 0.3 })

    tl.from(labelRef.current, {
      y: -40,
      duration: 0.8,
      ease: 'power3.out',
    }).from(
      contentRef.current.querySelectorAll('.result-visual, .result-description'),
      {
        y: 30,
        stagger: 0.15,
        duration: 0.6,
        ease: 'power2.out',
      },
      '-=0.3'
    )

    // Result-specific animations (scoped to container)
    if (result === 'cremated') {
      const visual = containerRef.current.querySelector('.result-visual')
      if (visual) {
        gsap.to(visual, {
          opacity: 0.03,
          duration: 4,
          ease: 'power2.in',
          delay: 2,
        })
      }
    }

    if (result === 'organ-donation') {
      const blocks = containerRef.current.querySelectorAll('.redacted-block')
      if (blocks.length) {
        gsap.from(blocks, {
          scaleX: 0,
          stagger: 0.2,
          duration: 0.4,
          ease: 'power2.out',
          delay: 1.5,
        })
      }
    }

    if (result === 'burial') {
      const cross = containerRef.current.querySelector('.burial-cross')
      if (cross) {
        gsap.from(cross, {
          scale: 0,
          rotation: 180,
          duration: 1,
          ease: 'back.out(1.4)',
          delay: 1.5,
        })
      }
    }
  }, [result])

  return (
    <motion.div
      className={`screen result-screen ${data.bgClass}`}
      ref={containerRef}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8 }}
    >
      <div className="result-scroll">
        <button className="result-close" onClick={onBack} aria-label="Close">
          ×
        </button>

        <div className="result-header" ref={labelRef}>
          <div className="result-label-bar">
            <h2 className="result-label">{data.label}</h2>
            <p className="result-tagline">{data.tagline}</p>
          </div>
        </div>

        <div className="result-content" ref={contentRef}>
          <div className="result-visual">
            {result === 'preserved' && (
              <div className="preserved-frame">
                <img src={PALANQUIN} alt="Preserved palanquin" />
              </div>
            )}

            {result === 'cremated' && (
              <div className="cremated-void" />
            )}

            {result === 'burial' && (
              <div className="burial-container">
                <img src={PALANQUIN} alt="Buried palanquin" className="burial-palanquin" />
                <div className="burial-cross">✝</div>
              </div>
            )}

            {result === 'organ-donation' && (
              <div className="organ-text">
                <p>
                  The palanquin was built to carry someone.
                  <span className="redacted-block" /> anyone. It appears in the Dalada Perahera
                  each year as a ceremonial object
                  <span className="redacted-block" /> whose ritual role is acknowledged by the
                  temple and whose bodies are not permitted in the public procession.
                </p>
                <p>
                  <span className="redacted-block" /> The institution recognised that women belonged
                  <span className="redacted-block" /> way to include them that did not require
                  letting them in.
                </p>
                <p>
                  The gap has been given a shape <span className="redacted-block" />
                  A symbol that moved through Kandy in full public view
                  <span className="redacted-block" /> remained out of sight.
                </p>
              </div>
            )}
          </div>

          <p className="result-description">{data.description}</p>
        </div>
      </div>

      <div className="result-scanner">
        <img src={SCANNER_ON} alt="" />
      </div>

      <button className="result-back" onClick={onBack}>
        ← return to the objectuary
      </button>
    </motion.div>
  )
}
