import { useEffect, useRef, useState } from 'react'
import useCryptoStore from '../store/useCryptoStore'

function formatPrice(price) {
  if (price >= 1000) return price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  if (price >= 1)    return price.toFixed(4)
  return price.toFixed(6)
}

function ChangeCell({ value }) {
  if (value == null) return <span className="text-gray-400">—</span>
  const positive = value >= 0
  return (
    <span className={positive ? 'text-green-600 dark:text-green-400' : 'text-red-500 dark:text-red-400'}>
      {positive ? '▲' : '▼'} {Math.abs(value).toFixed(2)}%
    </span>
  )
}

export default function PriceCard({ coin }) {
  const selectedCoin = useCryptoStore((s) => s.selectedCoin)
  const setSelectedCoin = useCryptoStore((s) => s.setSelectedCoin)
  const isSelected = selectedCoin === coin.id

  const prevPrice = useRef(coin.price)
  const [flash, setFlash] = useState(null)

  useEffect(() => {
    if (prevPrice.current === coin.price) return
    setFlash(coin.price > prevPrice.current ? 'up' : 'down')
    prevPrice.current = coin.price
    const t = setTimeout(() => setFlash(null), 600)
    return () => clearTimeout(t)
  }, [coin.price])

  const flashClass = flash === 'up'
    ? 'bg-green-50 dark:bg-green-950'
    : flash === 'down'
    ? 'bg-red-50 dark:bg-red-950'
    : ''

  return (
    <button
      onClick={() => setSelectedCoin(coin.id)}
      className={`
        w-full text-left p-4 rounded-xl border transition-all duration-300 cursor-pointer
        ${isSelected
          ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/40 dark:border-blue-400'
          : `border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 hover:border-gray-300 dark:hover:border-gray-700 ${flashClass}`
        }
      `}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <img src={coin.image} alt={coin.name} className="w-7 h-7 rounded-full" />
          <div>
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100 leading-none">{coin.name}</p>
            <p className="text-xs text-gray-400 mt-0.5">{coin.symbol}</p>
          </div>
        </div>
        {coin.source === 'mock' && (
          <span className="text-xs text-gray-400 bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded">mock</span>
        )}
      </div>

      <p className={`text-xl font-semibold font-mono mb-2 transition-colors duration-300
        ${flash === 'up' ? 'text-green-600 dark:text-green-400' : flash === 'down' ? 'text-red-500 dark:text-red-400' : 'text-gray-900 dark:text-gray-100'}
      `}>
        ${formatPrice(coin.price)}
      </p>

      <div className="flex gap-4 text-xs">
        <div><span className="text-gray-400 mr-1">1h</span><ChangeCell value={coin.change_1h} /></div>
        <div><span className="text-gray-400 mr-1">24h</span><ChangeCell value={coin.change_24h} /></div>
        <div><span className="text-gray-400 mr-1">7d</span><ChangeCell value={coin.change_7d} /></div>
      </div>
    </button>
  )
}
