import useCryptoStore from '../store/useCryptoStore'

function formatPrice(price) {
  if (!price) return '$0.00'
  if (price >= 1000) return `$${price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  if (price >= 1) return `$${price.toFixed(2)}`
  return `$${price.toFixed(4)}`
}

export default function MyAssets() {
  const prices = useCryptoStore((s) => s.prices)
  const selectedCoin = useCryptoStore((s) => s.selectedCoin)
  const setSelectedCoin = useCryptoStore((s) => s.setSelectedCoin)

  if (!prices.length) {
    return (
      <div className="w-72 flex-shrink-0 p-5 border-l border-white/5">
        <h3 className="text-white font-semibold mb-4">My Assets</h3>
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-white/10 animate-pulse" />
              <div>
                <div className="h-3 w-16 bg-white/10 rounded animate-pulse mb-1" />
                <div className="h-2.5 w-10 bg-white/5 rounded animate-pulse" />
              </div>
            </div>
            <div className="text-right">
              <div className="h-3 w-14 bg-white/10 rounded animate-pulse mb-1" />
              <div className="h-2.5 w-12 bg-white/5 rounded animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="w-72 flex-shrink-0 p-5 border-l border-white/5">
      <h3 className="text-white font-semibold mb-5">My Assets</h3>
      <div className="flex flex-col gap-3">
        {prices.map((coin) => {
          const isSelected = selectedCoin === coin.id
          const positive = (coin.change_24h ?? 0) >= 0
          const changeColor = positive ? 'text-emerald-400' : 'text-red-400'

          return (
            <button
              key={coin.id}
              onClick={() => setSelectedCoin(coin.id)}
              className={`flex items-center justify-between w-full rounded-xl px-3 py-2.5 transition-colors text-left ${
                isSelected ? 'bg-white/10' : 'hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-3">
                <img src={coin.image} alt={coin.name} className="w-9 h-9 rounded-full" />
                <div>
                  <p className="text-white text-sm font-medium leading-none">{coin.symbol}</p>
                  <p className="text-slate-500 text-xs mt-0.5">{coin.price < 1 ? coin.price.toFixed(5) : (coin.price < 100 ? coin.price.toFixed(4) : coin.price.toFixed(2))}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-white text-sm font-medium">{formatPrice(coin.price)}</p>
                <p className={`text-xs mt-0.5 ${changeColor}`}>
                  {positive ? '+' : ''}{coin.change_24h?.toFixed(2) ?? '0.00'}%
                </p>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
