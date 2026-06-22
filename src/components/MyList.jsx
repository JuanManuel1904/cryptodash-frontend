import useCryptoStore from '../store/useCryptoStore'

function formatPrice(price) {
  if (!price) return '$0.00'
  if (price >= 1000) return `$${price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  if (price >= 1) return `$${price.toFixed(2)}`
  return `$${price.toFixed(4)}`
}

export default function MyList() {
  const favorites      = useCryptoStore((s) => s.favorites)
  const favoritesData  = useCryptoStore((s) => s.favoritesData)
  const selectedCoin   = useCryptoStore((s) => s.selectedCoin)
  const setSelectedCoin = useCryptoStore((s) => s.setSelectedCoin)
  const toggleFavorite  = useCryptoStore((s) => s.toggleFavorite)

  // All followed coins — include those not in the live feed (searched coins)
  const followed = [...favorites].map((id) => favoritesData[id]).filter(Boolean)

  return (
    <div
      className="w-60 flex-shrink-0 flex flex-col p-5 border-l overflow-y-auto"
      style={{ background: 'var(--bg-surface)', borderColor: 'var(--border)' }}
    >
      <div className="mb-5">
        <h3 className="text-white font-bold text-sm">My List</h3>
        <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.25)' }}>
          {followed.length === 0 ? 'No coins followed yet' : `${followed.length} following`}
        </p>
      </div>

      {followed.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center pb-10 gap-3">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center"
            style={{ background: 'rgba(34,211,238,0.06)', border: '1px solid rgba(34,211,238,0.1)' }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-6 h-6" style={{ color: 'rgba(34,211,238,0.4)' }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
            </svg>
          </div>
          <p className="text-xs leading-relaxed" style={{ color: 'rgba(255,255,255,0.25)' }}>
            Star any coin to add it to your list
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-1">
          {followed.map((coin) => {
            const isSelected = selectedCoin === coin.id
            const positive   = (coin.change_24h ?? 0) >= 0

            return (
              <div
                key={coin.id}
                className="flex items-center justify-between rounded-xl px-3 py-2.5 group cursor-pointer transition-all duration-200"
                style={{
                  background: isSelected ? 'rgba(34,211,238,0.08)' : 'transparent',
                  border: `1px solid ${isSelected ? 'rgba(34,211,238,0.15)' : 'transparent'}`,
                }}
                onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = 'rgba(255,255,255,0.04)' }}
                onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = 'transparent' }}
              >
                <button
                  onClick={() => setSelectedCoin(coin.id)}
                  className="flex items-center gap-2.5 flex-1 min-w-0 text-left"
                >
                  <div className="relative flex-shrink-0">
                    <img src={coin.image} alt={coin.name} className="w-8 h-8 rounded-full" />
                    <div
                      className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2"
                      style={{
                        background: positive ? '#10b981' : '#f43f5e',
                        borderColor: 'var(--bg-surface)',
                      }}
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="text-white text-xs font-semibold leading-none truncate">{coin.symbol}</p>
                    <p
                      className="text-[10px] mt-0.5 font-medium"
                      style={{ color: positive ? '#10b981' : '#f43f5e' }}
                    >
                      {positive ? '+' : ''}{coin.change_24h?.toFixed(2) ?? '0.00'}%
                    </p>
                  </div>
                </button>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <p className="text-white text-xs font-mono font-medium">{formatPrice(coin.price)}</p>
                  <button
                    onClick={() => toggleFavorite(coin.id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ color: 'rgba(255,255,255,0.25)' }}
                  >
                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3">
                      <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                    </svg>
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
