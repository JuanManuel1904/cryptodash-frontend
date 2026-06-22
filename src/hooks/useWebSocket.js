import { useEffect, useRef } from 'react'
import useCryptoStore from '../store/useCryptoStore'

const WS_URL  = import.meta.env.VITE_WS_URL  || 'ws://localhost:8000'
const API_URL = import.meta.env.VITE_API_URL  || 'http://localhost:8000'
const RECONNECT_DELAY = 3000
const MAX_RECONNECT_DELAY = 30000

// Pre-loads prices and per-coin history so the chart is ready before the
// first WebSocket broadcast (which can take up to 10 seconds).
async function prefetch(setPrices, setHistory) {
  try {
    const res = await fetch(`${API_URL}/api/prices`)
    if (!res.ok) return
    const { data } = await res.json()
    if (data?.length) setPrices(data)

    // Fetch history for every coin in parallel
    const ids = data.map((c) => c.id)
    const histories = await Promise.allSettled(
      ids.map((id) =>
        fetch(`${API_URL}/api/history/${id}`)
          .then((r) => r.json())
          .then(({ history }) => ({ id, history }))
      )
    )
    histories.forEach((result) => {
      if (result.status === 'fulfilled' && result.value.history?.length) {
        setHistory(result.value.id, result.value.history)
      }
    })
  } catch (e) {
    console.warn('[prefetch] Could not load initial data:', e)
  }
}

export default function useWebSocket() {
  const { setPrices, setHistory, setWsStatus } = useCryptoStore()
  const wsRef = useRef(null)
  const reconnectTimer = useRef(null)
  const reconnectDelay = useRef(RECONNECT_DELAY)
  const unmounted = useRef(false)
  const prefetched = useRef(false)

  const connect = () => {
    if (unmounted.current) return

    setWsStatus('connecting')
    const ws = new WebSocket(`${WS_URL}/ws/prices`)
    wsRef.current = ws

    ws.onopen = () => {
      setWsStatus('connected')
      reconnectDelay.current = RECONNECT_DELAY
    }

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data)
        if (msg.type === 'prices') setPrices(msg.data)
      } catch (e) {
        console.error('[WS] Parse error:', e)
      }
    }

    ws.onclose = () => {
      if (unmounted.current) return
      setWsStatus('reconnecting')
      reconnectTimer.current = setTimeout(() => {
        reconnectDelay.current = Math.min(reconnectDelay.current * 1.5, MAX_RECONNECT_DELAY)
        connect()
      }, reconnectDelay.current)
    }

    ws.onerror = () => ws.close()
  }

  useEffect(() => {
    unmounted.current = false

    // Pre-load data only once per mount so the chart isn't empty
    if (!prefetched.current) {
      prefetched.current = true
      prefetch(setPrices, setHistory)
    }

    connect()

    return () => {
      unmounted.current = true
      clearTimeout(reconnectTimer.current)
      wsRef.current?.close()
    }
  }, [])
}
