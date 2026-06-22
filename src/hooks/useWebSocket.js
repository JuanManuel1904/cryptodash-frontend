import { useEffect, useRef } from 'react'
import useCryptoStore from '../store/useCryptoStore'

const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:8000'
const RECONNECT_DELAY = 3000

export default function useWebSocket() {
  const { setPrices, setWsStatus } = useCryptoStore()
  const wsRef = useRef(null)
  const reconnectTimer = useRef(null)
  const unmounted = useRef(false)

  const connect = () => {
    if (unmounted.current) return

    setWsStatus('connecting')
    const ws = new WebSocket(`${WS_URL}/ws/prices`)
    wsRef.current = ws

    ws.onopen = () => {
      setWsStatus('connected')
      console.log('[WS] Conectado')
    }

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data)
        if (msg.type === 'prices') {
          setPrices(msg.data)
        }
      } catch (e) {
        console.error('[WS] Error parseando mensaje:', e)
      }
    }

    ws.onclose = () => {
      if (unmounted.current) return
      setWsStatus('reconnecting')
      console.log(`[WS] Desconectado. Reconectando en ${RECONNECT_DELAY}ms...`)
      reconnectTimer.current = setTimeout(connect, RECONNECT_DELAY)
    }

    ws.onerror = (err) => {
      console.error('[WS] Error:', err)
      ws.close()
    }
  }

  useEffect(() => {
    unmounted.current = false
    connect()
    return () => {
      unmounted.current = true
      clearTimeout(reconnectTimer.current)
      wsRef.current?.close()
    }
  }, [])
}
