/**
 * useHandGestures.js
 *
 * MediaPipe Hands gesture integration hook.
 * Detects hand landmarks from the webcam and maps gestures
 * to synthetic DOM events that the existing app already listens for.
 *
 * Gesture mapping:
 *   - Pinch (thumb + index close)   → click / mousedown+mouseup
 *   - Fist (all fingers curled)     → grab & drag (mousemove while "down")
 *   - Two-hand spread/pinch         → zoom in / zoom out via wheel events
 *
 * This file is entirely additive — it does NOT touch any existing component.
 */

import { useEffect, useRef, useCallback } from 'react'

// ─── Tuning constants ───────────────────────────────────────────
const PINCH_THRESHOLD     = 0.055  // normalised distance (0–1) for thumb↔index pinch
const FIST_CURL_THRESHOLD = 0.08   // finger-tip-to-palm distance to count as "curled"
const ZOOM_SENSITIVITY    = 800    // multiplier for two-hand distance → wheel delta
const LERP_FACTOR         = 0.1    // smoothing (0 = frozen, 1 = raw/jittery) — 0.1 = silk-smooth damping
const COOLDOWN_MS         = 350    // min ms between successive pinch-clicks
const SWIPE_THRESHOLD     = 0.18   // normalised X distance for a swipe (0–1)
const SWIPE_FRAMES        = 8      // number of frames to track for swipe detection
const SWIPE_COOLDOWN_MS   = 800    // min ms between successive swipe-backs

// ─── Helpers ────────────────────────────────────────────────────
function lerp(a, b, t) { return a + (b - a) * t }

function dist(a, b) {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2 + ((a.z || 0) - (b.z || 0)) ** 2)
}

/** Convert MediaPipe 0-1 coords (mirrored) to window pixels */
function toScreen(landmark) {
  return {
    x: (1 - landmark.x) * window.innerWidth,   // mirror X for natural movement
    y: landmark.y * window.innerHeight,
  }
}

/** Are all four non-thumb fingers curled toward the palm? */
function isFist(landmarks) {
  // Palm base ≈ landmark 0
  const palm = landmarks[0]
  // Finger tips: index=8, middle=12, ring=16, pinky=20
  const tips = [8, 12, 16, 20]
  return tips.every(i => dist(landmarks[i], palm) < FIST_CURL_THRESHOLD * 3.5)
}

/** Palm centre = average of wrist(0) + MCP bases (5,9,13,17) */
function palmCenter(landmarks) {
  const ids = [0, 5, 9, 13, 17]
  const sum = ids.reduce((acc, i) => ({ x: acc.x + landmarks[i].x, y: acc.y + landmarks[i].y }), { x: 0, y: 0 })
  return { x: sum.x / ids.length, y: sum.y / ids.length }
}

// ─── Synthetic event dispatchers ────────────────────────────────
function fireMouseEvent(type, x, y, extra = {}) {
  const el = document.elementFromPoint(x, y) || document.body
  const evt = new MouseEvent(type, {
    bubbles: true,
    cancelable: true,
    clientX: x,
    clientY: y,
    view: window,
    ...extra,
  })
  el.dispatchEvent(evt)
}

function fireWheelEvent(x, y, deltaY) {
  const el = document.elementFromPoint(x, y) || document.body
  const evt = new WheelEvent('wheel', {
    bubbles: true,
    cancelable: true,
    clientX: x,
    clientY: y,
    deltaY,
    view: window,
  })
  el.dispatchEvent(evt)
}

function fireClick(x, y) {
  const el = document.elementFromPoint(x, y) || document.body
  const evt = new MouseEvent('click', {
    bubbles: true,
    cancelable: true,
    clientX: x,
    clientY: y,
    view: window,
  })
  el.dispatchEvent(evt)
}

// ─── CDN loader ─────────────────────────────────────────────────
let _loadPromise = null
function loadMediaPipe() {
  if (_loadPromise) return _loadPromise
  _loadPromise = new Promise((resolve, reject) => {
    // Hands model + camera utils
    const scripts = [
      'https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js',
      'https://cdn.jsdelivr.net/npm/@mediapipe/hands/hands.js',
    ]
    let loaded = 0
    scripts.forEach(src => {
      const s = document.createElement('script')
      s.src = src
      s.async = false               // preserve order
      s.onload = () => { if (++loaded === scripts.length) resolve() }
      s.onerror = reject
      document.head.appendChild(s)
    })
  })
  return _loadPromise
}

// ─── Hook ───────────────────────────────────────────────────────
export function useHandGestures({ enabled = true, onCursorMove } = {}) {
  const smoothPos     = useRef({ x: window.innerWidth / 2, y: window.innerHeight / 2 })
  const prevPinch     = useRef(false)
  const prevFist      = useRef(false)
  const fistOrigin    = useRef(null)
  const lastClickTime = useRef(0)
  const prevTwoHandDist = useRef(null)
  const handsRef      = useRef(null)
  const cameraRef     = useRef(null)
  const videoRef      = useRef(null)

  // Swipe tracking
  const swipeHistoryX = useRef([])    // recent raw wrist X positions (normalised 0–1)
  const swipeHistoryY = useRef([])    // recent raw wrist Y positions (normalised 0–1)
  const lastSwipeTime = useRef(0)
  const scanAnimating = useRef(false) // prevent overlapping scan animations

  // Called every frame by MediaPipe
  const onResults = useCallback((results) => {
    const hands = results.multiHandLandmarks || []
    const numHands = hands.length

    // ── Two-hand zoom ──────────────────────────────────────────
    if (numHands >= 2) {
      const c1 = palmCenter(hands[0])
      const c2 = palmCenter(hands[1])
      const d  = dist(c1, c2)

      if (prevTwoHandDist.current !== null) {
        const delta = d - prevTwoHandDist.current
        if (Math.abs(delta) > 0.005) {
          // negative deltaY = zoom in (spread), positive = zoom out (pinch)
          const cx = window.innerWidth / 2
          const cy = window.innerHeight / 2
          fireWheelEvent(cx, cy, -delta * ZOOM_SENSITIVITY)
        }
      }
      prevTwoHandDist.current = d
      return   // don't process single-hand gestures while zooming
    }
    prevTwoHandDist.current = null

    // ── Single-hand gestures ───────────────────────────────────
    if (numHands === 0) {
      // Release fist drag if hand disappears
      if (prevFist.current) {
        const { x, y } = smoothPos.current
        fireMouseEvent('mouseup', x, y)
        prevFist.current = false
        fistOrigin.current = null
      }
      return
    }

    const lm = hands[0]

    // Smooth the index-finger-tip position for cursor placement
    const rawScreen = toScreen(lm[8])
    smoothPos.current = {
      x: lerp(smoothPos.current.x, rawScreen.x, LERP_FACTOR),
      y: lerp(smoothPos.current.y, rawScreen.y, LERP_FACTOR),
    }
    const { x, y } = smoothPos.current

    // Report cursor position to visual layer
    onCursorMove?.(x, y)

    // ── Pinch detection (click) ────────────────────────────────
    const pinchDist = dist(lm[4], lm[8])   // thumb tip ↔ index tip
    const isPinching = pinchDist < PINCH_THRESHOLD

    if (isPinching && !prevPinch.current) {
      const now = Date.now()
      if (now - lastClickTime.current > COOLDOWN_MS) {
        lastClickTime.current = now
        fireMouseEvent('mousedown', x, y)
        fireMouseEvent('mouseup', x, y)
        fireClick(x, y)
      }
    }
    prevPinch.current = isPinching

    // ── Fist detection (grab & drag / pan) ─────────────────────
    const fist = isFist(lm)

    if (fist && !prevFist.current) {
      // Fist just formed — start drag
      fistOrigin.current = { x, y }
      fireMouseEvent('mousedown', x, y)
    } else if (fist && prevFist.current) {
      // Fist sustained — drag move
      fireMouseEvent('mousemove', x, y)
    } else if (!fist && prevFist.current) {
      // Fist released — end drag
      fireMouseEvent('mouseup', x, y)
      fistOrigin.current = null
    }
    prevFist.current = fist

    // ── Swipe detection ────────────────────────────────────────
    // Track raw (unsmoothed) wrist position over recent frames
    const wristX = lm[0].x  // 0–1, mirrored
    const wristY = lm[0].y  // 0–1
    swipeHistoryX.current.push(wristX)
    swipeHistoryY.current.push(wristY)
    if (swipeHistoryX.current.length > SWIPE_FRAMES) {
      swipeHistoryX.current.shift()
      swipeHistoryY.current.shift()
    }

    if (swipeHistoryX.current.length === SWIPE_FRAMES) {
      const oldestX = swipeHistoryX.current[0]
      const newestX = swipeHistoryX.current[SWIPE_FRAMES - 1]
      const deltaX = oldestX - newestX  // positive = rightward swipe in real world

      const oldestY = swipeHistoryY.current[0]
      const newestY = swipeHistoryY.current[SWIPE_FRAMES - 1]
      const deltaY = newestY - oldestY  // positive = downward swipe in real world

      const now = Date.now()
      const cooldownOk = now - lastSwipeTime.current > SWIPE_COOLDOWN_MS

      // ── Swipe RIGHT → go back ────────────────────────────────
      if (deltaX > SWIPE_THRESHOLD && Math.abs(deltaX) > Math.abs(deltaY) && cooldownOk) {
        lastSwipeTime.current = now
        swipeHistoryX.current = []
        swipeHistoryY.current = []

        const backBtn =
          document.querySelector('.scan-return-btn') ||
          document.querySelector('.paper-close') ||
          document.querySelector('.hover-back-btn') ||
          document.querySelector('.zoom-out-btn')
        if (backBtn) backBtn.click()
      }

      // ── Swipe DOWN → scan ────────────────────────────────────
      if (deltaY > SWIPE_THRESHOLD && Math.abs(deltaY) > Math.abs(deltaX) && cooldownOk && !scanAnimating.current) {
        const scannerEl = document.querySelector('.scanner-device')
        const containerEl = document.querySelector('.scanner-overlay')
        if (scannerEl && containerEl) {
          lastSwipeTime.current = now
          swipeHistoryX.current = []
          swipeHistoryY.current = []
          scanAnimating.current = true

          // Simulate the full scanner drag: mousedown → move down → mouseup
          const scannerRect = scannerEl.getBoundingClientRect()
          const containerRect = containerEl.getBoundingClientRect()
          const startX = scannerRect.left + scannerRect.width / 2
          const startY = scannerRect.top + scannerRect.height / 2
          const endY = containerRect.bottom - 10
          const steps = 25
          const stepDuration = 40  // ms per step — total ~1s

          // Start the drag
          fireMouseEvent('mousedown', startX, startY)

          // Animate mousemove events downward
          for (let i = 1; i <= steps; i++) {
            setTimeout(() => {
              const progress = i / steps
              const currentY = startY + (endY - startY) * progress
              fireMouseEvent('mousemove', startX, currentY)

              // Final step — release
              if (i === steps) {
                fireMouseEvent('mouseup', startX, currentY)
                scanAnimating.current = false
              }
            }, i * stepDuration)
          }
        }
      }
    }

  }, [onCursorMove])

  // ── Lifecycle: load MediaPipe, start camera ──────────────────
  useEffect(() => {
    if (!enabled) return

    let cancelled = false

    async function init() {
      console.log('[HandGestures] Initializing MediaPipe...')
      try {
        await loadMediaPipe()
        console.log('[HandGestures] Scripts loaded.')
      } catch (err) {
        console.error('[HandGestures] Failed to load MediaPipe CDN:', err)
        return
      }
      if (cancelled) return

      try {
        /* global Hands, Camera */
        const hands = new window.Hands({
          locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
        })
        hands.setOptions({
          maxNumHands: 2,
          modelComplexity: 1,
          minDetectionConfidence: 0.7,
          minTrackingConfidence: 0.6,
        })
        hands.onResults(onResults)
        handsRef.current = hands
        console.log('[HandGestures] Hands model initialized.')

        // Hidden video element for webcam
        const video = document.createElement('video')
        video.setAttribute('playsinline', '')
        video.style.cssText = 'position:fixed;top:0;left:0;width:1px;height:1px;opacity:0;pointer-events:none;z-index:-9999;'
        document.body.appendChild(video)
        videoRef.current = video

        const camera = new window.Camera(video, {
          onFrame: async () => {
            if (handsRef.current) {
              await handsRef.current.send({ image: video })
            }
          },
          width: 640,
          height: 480,
        })
        
        console.log('[HandGestures] Starting camera...')
        await camera.start()
        cameraRef.current = camera
        console.log('[HandGestures] Camera started successfully.')
      } catch (err) {
        console.error('[HandGestures] Initialization error:', err)
        if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
          alert('Camera access is required for hand gestures. Please check your browser permissions.')
        }
      }
    }

    init()

    return () => {
      cancelled = true
      cameraRef.current?.stop()
      handsRef.current?.close()
      if (videoRef.current) {
        videoRef.current.srcObject?.getTracks().forEach(t => t.stop())
        videoRef.current.remove()
      }
    }
  }, [enabled, onResults])
}
