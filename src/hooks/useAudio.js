import { useCallback, useRef, useEffect } from 'react'

/**
 * Resilient audio player hook.
 *
 * - Silently ignores missing, empty, or undecodable files.
 * - Caches Audio objects so repeated plays are instant.
 * - Provides play(), loop(), stop(), and stopAll().
 */
export function useAudio() {
  const cacheRef = useRef({})
  const loopsRef = useRef({})

  // Pre-validate: returns an Audio instance only if the file is real
  const getAudio = useCallback((src) => {
    if (!src) return null
    if (cacheRef.current[src] !== undefined) return cacheRef.current[src]

    const audio = new Audio(src)
    audio.preload = 'auto'

    // Mark as broken on error so we never retry
    audio.addEventListener('error', () => {
      cacheRef.current[src] = null
    }, { once: true })

    cacheRef.current[src] = audio
    return audio
  }, [])

  /** Play a one-shot sound. Returns a promise that resolves when done. */
  const play = useCallback((src, { volume = 1 } = {}) => {
    try {
      const audio = getAudio(src)
      if (!audio) return Promise.resolve()
      const clone = audio.cloneNode()
      clone.volume = Math.max(0, Math.min(1, volume))
      return clone.play().catch(() => {})
    } catch {
      return Promise.resolve()
    }
  }, [getAudio])

  /** Start a looping sound (e.g. ambient, scanner hum). */
  const loop = useCallback((src, { volume = 1 } = {}) => {
    try {
      // Don't double-loop
      if (loopsRef.current[src]) return
      const audio = getAudio(src)
      if (!audio) return
      const instance = audio.cloneNode()
      instance.loop = true
      instance.volume = Math.max(0, Math.min(1, volume))
      instance.play().catch(() => {})
      loopsRef.current[src] = instance
    } catch {
      // silent
    }
  }, [getAudio])

  /** Stop a specific loop. */
  const stop = useCallback((src) => {
    const instance = loopsRef.current[src]
    if (instance) {
      instance.pause()
      instance.currentTime = 0
      delete loopsRef.current[src]
    }
  }, [])

  /** Stop all active loops. */
  const stopAll = useCallback(() => {
    Object.keys(loopsRef.current).forEach(stop)
  }, [stop])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      Object.values(loopsRef.current).forEach((a) => {
        try { a.pause() } catch { /* noop */ }
      })
      loopsRef.current = {}
    }
  }, [])

  return { play, loop, stop, stopAll }
}
