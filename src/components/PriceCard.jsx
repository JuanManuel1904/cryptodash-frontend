import { useEffect, useRef, useState } from 'react'
import useCryptoStore from '../store/useCryptoStore'

function formatPrice(price) {
  if (price >= 1000) return price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  if (price >= 1)    return price.toFixed(4)
  return price.toFixed(6)
}

function ChangeBadge({ value }) {
  if (value == null) return <span style={{ color: 'rgba(255,255,255,0.2)' }}>—</span>
  const pos = value >= 0
  return (
    <span
      className="text-[10px] font-semibold px-1.5 py-0.5 rounded-md"
      style={{
        background: pos ? 'rgba(16,185,129,0.12)' : 'rgba(244,63,94,0.12)',
        color: pos ? '#10b981' : '#f43f5e',
      }}
    >
      {pos ? '+' : ''}{Math.abs(value).toFixed(2)}%
    </span>
  )
}

export default function PriceCard({ coin }) {
  const selectedCoin   = useCryptoStore((s) => s.selectedCoin)
  const setSelectedCoin = useCryptoStore((s) => s.setSelectedCoin)
  const favorites      = useCryptoStore((s) => s.favorites)
  const toggleFavorite = useCryptoStore((s) => s.toggleFavorite)
  const isSelected     = selectedCoin === coin.id
  const followed       = favorites.has(coin.id)

  const prevPrice = useRef(coin.price)
  const [flash, setFlash] = useState(null)

  useEffect(() => {
    if (prevPrice.current === coin.price) return
    setFlash(coin.price > prevPrice.current ? 'up' : 'down')
    prevPrice.current = coin.price
    const t = setTimeout(() => setFlash(null), 700)
    return () => clearTimeout(t)
  }, [coin.price])

  const isPos = (coin.change_24h ?? 0) >= 0

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => setSelectedCoin(coin.id)}
      onKeyDown={(e) => e.key === 'Enter' && setSelectedCoin(coin.id)}
      className="relative p-4 rounded-2xl cursor-pointer transition-all duration-300 group overflow-hidden"
      style={{
        background: isSelected
          ? 'linear-gradient(135deg, rgba(34,211,238,0.1), rgba(34,211,238,0.04))'
          : flash === 'up'
          ? 'rgba(16,185,129,0.06)'
          : flash === 'down'
          ? 'rgba(244,63,94,0.06)'
          : 'var(--bg-card)',
        border: `1px solid ${isSelected ? 'rgba(34,211,238,0.3)' : flash ? 'rgba(255,255,255,0.06)' : 'var(--border)'}`,
        boxShadow: isSelected ? '0 0 24px rgba(34,211,238,0.08)' : 'none',
      }}
    >
      {/* Top stripe */}
      <div
        className="absolute top-0 left-0 right-0 h-px"
        style={{
          background: isSelected
            ? 'linear-gradient(90deg, transparent, rgba(34,211,238,0.6), transparent)'
            : 'linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent)',
        }}
      />

      {/* Header row */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="relative">
            <img src={coin.image} alt={coin.name} className="w-8 h-8 rounded-full" />
            {isSelected && (
              <div className="absolute inset-0 rounded-full" style={{ boxShadow: '0 0 10px rgba(34,211,238,0.5)' }} />
            )}
          </div>
          <div>
            <p className="text-sm font-semibold text-white leading-none">{coin.name}</p>
            <p className="text-[11px] mt-0.5 font-medium" style={{ color: 'rgba(255,255,255,0.3)' }}>{coin.symbol}</p>
          </div>
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); toggleFavorite(coin.id) }}
          className="transition-all duration-200 opacity-0 group-hover:opacity-100"
          style={{
            color: followed ? 'var(--cyan)' : 'rgba(255,255,255,0.25)',
            opacity: followed ? 1 : undefined,
          }}
        >
          <svg viewBox="0 0 24 24" fill={followed ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={followed ? 0 : 1.5} className="w-3.5 h-3.5">
            <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
          </svg>
        </button>
      </div>

      {/* Price */}
      <p
        className="text-lg font-bold font-mono mb-3 transition-colors duration-300"
        style={{
          color: flash === 'up' ? '#10b981' : flash === 'down' ? '#f43f5e' : '#ffffff',
        }}
      >
        ${formatPrice(coin.price)}
      </p>

      {/* Change row */}
      <div className="flex items-center justify-between">
        <div className="flex gap-1.5 flex-wrap">
          <span className="text-[10px]" style={{ color: 'rgba(255,255,255,0.25)' }}>24h</span>
          <ChangeBadge value={coin.change_24h} />
        </div>
        <div
          className="w-1.5 h-1.5 rounded-full"
          style={{ background: isPos ? '#10b981' : '#f43f5e', boxShadow: `0 0 6px ${isPos ? '#10b981' : '#f43f5e'}` }}
        />
      </div>

      {coin.source === 'mock' && (
        <span
          className="absolute top-2 right-2 text-[9px] px-1.5 py-0.5 rounded font-medium"
          style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.2)' }}
        >
          mock
        </span>
      )}
    </div>
  )
}
