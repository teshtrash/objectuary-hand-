import { useState, useEffect, useCallback } from 'react'

const API_BASE = '/api/attention'

export function useAttention() {
  const [views, setViews] = useState({})

  useEffect(() => {
    fetch(API_BASE)
      .then((r) => r.json())
      .then(setViews)
      .catch(() => console.warn('Attention API unavailable'))
  }, [])

  const increment = useCallback(async (tombId) => {
    try {
      const res = await fetch(`${API_BASE}/${tombId}`, { method: 'POST' })
      const data = await res.json()
      setViews(data)
      return data
    } catch {
      console.warn('Attention API unavailable')
      return views
    }
  }, [views])

  return { views, increment }
}
