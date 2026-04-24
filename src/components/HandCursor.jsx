/**
 * HandCursor.jsx
 *
 * Visual feedback layer for hand gesture tracking.
 * Shows a glowing cursor dot where the detected hand is pointing,
 * plus a subtle status indicator for the current gesture state.
 *
 * This component is purely visual — all gesture→event logic
 * lives in useHandGestures.js.
 */

import { useState, useCallback, useRef, useEffect } from 'react'
import { useHandGestures } from '../hooks/useHandGestures'
import './HandCursor.css'

export default function HandCursor({ enabled = true }) {
  const [pos, setPos] = useState({ x: -100, y: -100 })
  const [visible, setVisible] = useState(false)
  const hideTimer = useRef(null)

  const handleCursorMove = useCallback((x, y) => {
    setPos({ x, y })
    setVisible(true)

    // Hide cursor if hand disappears (no updates for 500ms)
    clearTimeout(hideTimer.current)
    hideTimer.current = setTimeout(() => setVisible(false), 500)
  }, [])

  useHandGestures({ enabled, onCursorMove: handleCursorMove })

  useEffect(() => {
    return () => clearTimeout(hideTimer.current)
  }, [])

  if (!enabled) return null

  return (
    <div
      className={`hand-cursor ${visible ? 'hand-cursor--visible' : ''}`}
      style={{
        transform: `translate(${pos.x}px, ${pos.y}px)`,
      }}
    >
      <div className="hand-cursor__dot" />
      <div className="hand-cursor__ring" />
    </div>
  )
}
