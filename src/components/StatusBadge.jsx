import { useEffect, useState } from 'react'
import useCryptoStore from '../store/useCryptoStore'

const CONFIG = {
  connected:    { label: 'Live',           color: '#10b981' },
  connecting:   { label: 'Connecting',     color: '#f59e0b' },
  reconnecting: { label: 'Retrying',       color: '#f97316' },
  disconnected: { label: 'Offline',        color: '#f43f5e' },
}

export default function StatusBadge() {
  const wsStatus = useCryptoStore((s) => s.wsStatus)
  const [secs, setSecs] = useState(0)

  useEffect(() => {
    if (wsStatus !== 'reconnecting') { setSecs(0); return }
    const t = setInterval(() => setSecs((s) => s + 1), 1000)
    return () => clearInterval(t)
  }, [wsStatus])

  const { label, color } = CONFIG[wsStatus] || CONFIG.disconnected
  const text = wsStatus === 'reconnecting' && secs > 0 ? `${label} (${secs}s)` : label

  return (
    <div
      className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium"
      style={{
        background: 'rgba(0,0,0,0.6)',
        backdropFilter: 'blur(12px)',
        border: `1px solid ${color}30`,
        color,
      }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full animate-pulse"
        style={{ background: color, boxShadow: `0 0 6px ${color}` }}
      />
      {text}
    </div>
  )
}
