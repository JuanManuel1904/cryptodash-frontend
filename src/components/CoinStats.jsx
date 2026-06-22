function fmtLarge(n) {
  if (n == null) return 'N/A'
  if (n >= 1e12) return `$${(n / 1e12).toFixed(2)}T`
  if (n >= 1e9)  return `$${(n / 1e9).toFixed(2)}B`
  if (n >= 1e6)  return `$${(n / 1e6).toFixed(2)}M`
  return `$${n.toLocaleString('en-US')}`
}


function Change({ value }) {
  if (value == null) return <span className="text-slate-400 font-medium text-sm">N/A</span>
  const pos = value >= 0
  return (
    <span className={`font-medium text-sm ${pos ? 'text-emerald-400' : 'text-red-400'}`}>
      {pos ? '+' : ''}{value.toFixed(2)}%
    </span>
  )
}

function StatRow({ label, value }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-white/5 last:border-0">
      <span className="text-slate-400 text-sm">{label}</span>
      <span className="text-sm font-medium text-white">{value}</span>
    </div>
  )
}

export default function CoinStats({ coin, favorites, toggleFavorite }) {
  if (!coin) return null

  const followed = favorites?.has(coin.id)

  const stats = [
    { label: 'Market Cap',  value: fmtLarge(coin.market_cap) },
    { label: 'Volume 24h',  value: fmtLarge(coin.volume_24h) },
    { label: '1h Change',   value: <Change value={coin.change_1h} /> },
    { label: '24h Change',  value: <Change value={coin.change_24h} /> },
    { label: '7d Change',   value: <Change value={coin.change_7d} /> },
  ]

  return (
    <div className="mt-6 pt-6 border-t border-white/5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-white font-semibold">Key Stats</h3>
          <p className="text-slate-500 text-xs mt-0.5">{coin.name} · {coin.symbol}</p>
        </div>
        {toggleFavorite && (
          <button
            onClick={() => toggleFavorite(coin.id)}
            className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border transition-colors ${
              followed
                ? 'border-cyan-500/40 text-cyan-400 bg-cyan-400/10'
                : 'border-white/10 text-slate-400 hover:border-white/20 hover:text-white'
            }`}
          >
            <svg viewBox="0 0 24 24" fill={followed ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={followed ? 0 : 1.5} className="w-3.5 h-3.5">
              <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
            </svg>
            {followed ? 'Following' : 'Follow'}
          </button>
        )}
      </div>
      <div>
        {stats.map(({ label, value }) => (
          <StatRow key={label} label={label} value={value} />
        ))}
      </div>
    </div>
  )
}
