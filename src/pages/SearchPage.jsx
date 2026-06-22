import { useState, useRef, useEffect } from 'react'
import useCryptoStore from '../store/useCryptoStore'

const API = import.meta.env.VITE_API_URL || 'http://localhost:8000'

function formatPrice(price) {
  if (!price && price !== 0) return '-'
  if (price >= 1000) return `$${price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  if (price >= 1) return `$${price.toFixed(4)}`
  return `$${price.toFixed(6)}`
}

function formatLarge(n) {
  if (!n) return '-'
  if (n >= 1e12) return `$${(n / 1e12).toFixed(2)}T`
  if (n >= 1e9)  return `$${(n / 1e9).toFixed(2)}B`
  if (n >= 1e6)  return `$${(n / 1e6).toFixed(2)}M`
  return `$${n.toLocaleString('en-US')}`
}

function Change({ value }) {
  if (value == null) return <span className="text-slate-500">-</span>
  const pos = value >= 0
  return (
    <span className={`text-sm font-medium ${pos ? 'text-emerald-400' : 'text-red-400'}`}>
      {pos ? '+' : ''}{value.toFixed(2)}%
    </span>
  )
}

const FILTERS = [
  { id: 'market_cap', label: 'Market Cap' },
  { id: 'volume',     label: 'Volume 24h' },
  { id: 'price',      label: 'Price' },
]

export default function SearchPage() {
  const [query,         setQuery]         = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [searching,     setSearching]     = useState(false)
  const [filter,        setFilter]        = useState('market_cap')
  const [topCoins,      setTopCoins]      = useState([])
  const [loadingTop,    setLoadingTop]    = useState(true)
  const [selected,      setSelected]      = useState(null)
  const [loadingDetail, setLoadingDetail] = useState(false)
  const debounce = useRef(null)

  const favorites      = useCryptoStore((s) => s.favorites)
  const toggleFavorite = useCryptoStore((s) => s.toggleFavorite)

  useEffect(() => {
    let cancelled = false
    setLoadingTop(true)
    fetch(`${API}/api/top-coins?sort_by=${filter}&per_page=50`)
      .then((r) => r.json())
      .then(({ coins }) => { if (!cancelled) setTopCoins(coins || []) })
      .catch(() => { if (!cancelled) setTopCoins([]) })
      .finally(() => { if (!cancelled) setLoadingTop(false) })
    return () => { cancelled = true }
  }, [filter])

  const handleInput = (e) => {
    const val = e.target.value
    setQuery(val)
    clearTimeout(debounce.current)
    if (!val.trim()) { setSearchResults([]); return }
    debounce.current = setTimeout(async () => {
      setSearching(true)
      try {
        const r = await fetch(`${API}/api/search?q=${encodeURIComponent(val.trim())}`)
        const json = await r.json()
        setSearchResults(json.results || [])
      } catch {
        setSearchResults([])
      } finally {
        setSearching(false)
      }
    }, 400)
  }

  const selectCoin = async (coinId) => {
    setSelected(null)
    setLoadingDetail(true)
    try {
      const r = await fetch(`${API}/api/coin/${coinId}`)
      const json = await r.json()
      if (json.data) setSelected(json.data)
    } catch { /* ignore */ }
    finally { setLoadingDetail(false) }
  }

  const showSearch  = query.trim().length > 0
  const listItems   = showSearch ? searchResults : topCoins
  const listLoading = showSearch ? searching : loadingTop

  return (
    <div className="flex gap-6 h-full min-h-0">
      {/* Left: search + list */}
      <div className="flex flex-col flex-1 min-w-0 min-h-0">
        <h2 className="text-white text-xl font-semibold mb-4 flex-shrink-0">Search</h2>

        {/* Input */}
        <div className="relative mb-4 flex-shrink-0">
          <svg viewBox="0 0 24 24" fill="currentColor" className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none">
            <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
          </svg>
          <input
            type="text"
            value={query}
            onChange={handleInput}
            placeholder="Search by name or symbol..."
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-white placeholder-slate-500 text-sm outline-none focus:border-cyan-500/50 transition-colors"
          />
          {listLoading && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin" />
          )}
        </div>

        {/* Filter tabs */}
        {!showSearch && (
          <div className="flex items-center gap-2 mb-4 flex-shrink-0">
            <span className="text-slate-500 text-xs mr-1">Sort by</span>
            {FILTERS.map((f) => (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  filter === f.id
                    ? 'bg-cyan-400/15 text-cyan-400 border border-cyan-500/30'
                    : 'bg-white/5 text-slate-400 border border-white/8 hover:text-white hover:bg-white/10'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        )}

        {/* Table header */}
        {!listLoading && listItems.length > 0 && (
          <div className="grid grid-cols-[2rem_1fr_repeat(3,minmax(0,1fr))] gap-3 px-4 pb-2 flex-shrink-0">
            <span className="text-slate-600 text-xs">#</span>
            <span className="text-slate-600 text-xs">Name</span>
            <span className="text-slate-600 text-xs text-right">Price</span>
            <span className="text-slate-600 text-xs text-right">24h</span>
            <span className="text-slate-600 text-xs text-right">
              {showSearch ? 'Rank' : filter === 'volume' ? 'Volume 24h' : 'Market Cap'}
            </span>
          </div>
        )}

        {/* Coin list */}
        <div className="flex-1 overflow-y-auto rounded-xl border border-white/8 min-h-0" style={{ background: '#0d1424' }}>
          {listLoading ? (
            <div className="flex flex-col">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="grid grid-cols-[2rem_1fr_repeat(3,minmax(0,1fr))] gap-3 px-4 py-3 border-b border-white/5 last:border-0 animate-pulse">
                  <div className="h-3 w-4 bg-white/10 rounded self-center" />
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-white/10 flex-shrink-0" />
                    <div className="h-3 w-20 bg-white/10 rounded" />
                  </div>
                  <div className="h-3 w-16 bg-white/10 rounded self-center ml-auto" />
                  <div className="h-3 w-12 bg-white/10 rounded self-center ml-auto" />
                  <div className="h-3 w-14 bg-white/10 rounded self-center ml-auto" />
                </div>
              ))}
            </div>
          ) : listItems.length === 0 ? (
            <div className="flex items-center justify-center h-40 text-slate-500 text-sm">
              {showSearch ? `No results for "${query}"` : 'No data available'}
            </div>
          ) : (
            listItems.map((coin, i) => {
              const followed   = favorites.has(coin.id)
              const isSelected = selected?.id === coin.id
              const lastCol    = showSearch
                ? (coin.market_cap_rank ? `#${coin.market_cap_rank}` : '-')
                : filter === 'volume'
                ? formatLarge(coin.volume_24h)
                : formatLarge(coin.market_cap)

              return (
                <div
                  key={coin.id}
                  className={`grid grid-cols-[2rem_1fr_repeat(3,minmax(0,1fr))] gap-3 px-4 py-3 border-b border-white/5 last:border-0 group cursor-pointer transition-colors ${
                    isSelected ? 'bg-white/8' : 'hover:bg-white/5'
                  }`}
                  onClick={() => selectCoin(coin.id)}
                >
                  <span className="text-slate-600 text-xs self-center">
                    {coin.market_cap_rank ?? i + 1}
                  </span>

                  <div className="flex items-center gap-2 min-w-0">
                    <img
                      src={coin.image}
                      alt={coin.name}
                      className="w-7 h-7 rounded-full flex-shrink-0 bg-white/10"
                      onError={(e) => { e.target.style.display = 'none' }}
                    />
                    <div className="min-w-0">
                      <p className="text-white text-sm font-medium truncate leading-none">{coin.name}</p>
                      <p className="text-slate-500 text-xs mt-0.5">{coin.symbol}</p>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); toggleFavorite(coin.id, coin) }}
                      title={followed ? 'Unfollow' : 'Follow'}
                      className={`ml-1 flex-shrink-0 transition-all ${
                        followed
                          ? 'text-cyan-400'
                          : 'text-slate-700 opacity-0 group-hover:opacity-100 hover:text-slate-300'
                      }`}
                    >
                      <svg viewBox="0 0 24 24" fill={followed ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={followed ? 0 : 1.5} className="w-3.5 h-3.5">
                        <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                      </svg>
                    </button>
                  </div>

                  <span className="text-white text-sm font-mono text-right self-center">
                    {formatPrice(coin.price)}
                  </span>

                  <span className="text-right self-center">
                    <Change value={coin.change_24h} />
                  </span>

                  <span className="text-slate-300 text-sm text-right self-center">
                    {lastCol}
                  </span>
                </div>
              )
            })
          )}
        </div>
      </div>

      {/* Right: detail panel */}
      {(loadingDetail || selected) && (
        <div className="w-72 flex-shrink-0 rounded-2xl border border-white/10 p-5 overflow-y-auto" style={{ background: '#0d1424' }}>
          {loadingDetail ? (
            <div className="animate-pulse space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-white/10" />
                <div>
                  <div className="h-4 w-24 bg-white/10 rounded mb-2" />
                  <div className="h-3 w-12 bg-white/5 rounded" />
                </div>
              </div>
              <div className="h-8 w-32 bg-white/10 rounded" />
              <div className="space-y-3">
                {Array.from({ length: 7 }).map((_, i) => (
                  <div key={i} className="flex justify-between">
                    <div className="h-3 w-24 bg-white/10 rounded" />
                    <div className="h-3 w-16 bg-white/10 rounded" />
                  </div>
                ))}
              </div>
            </div>
          ) : selected ? (
            <CoinDetail coin={selected} favorites={favorites} toggleFavorite={(id) => toggleFavorite(id, selected)} />
          ) : null}
        </div>
      )}
    </div>
  )
}

function CoinDetail({ coin, favorites, toggleFavorite }) {
  const followed = favorites.has(coin.id)

  const stats = [
    ['Market Cap',  formatLarge(coin.market_cap)],
    ['Volume 24h',  formatLarge(coin.volume_24h)],
    ['1h Change',   <Change key="1h"  value={coin.change_1h} />],
    ['24h Change',  <Change key="24h" value={coin.change_24h} />],
    ['7d Change',   <Change key="7d"  value={coin.change_7d} />],
  ]

  return (
    <div>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <img src={coin.image} alt={coin.name} className="w-12 h-12 rounded-full" />
          <div>
            <h3 className="text-white font-semibold">{coin.name}</h3>
            <p className="text-slate-500 text-sm">{coin.symbol}</p>
          </div>
        </div>
        <button
          onClick={() => toggleFavorite(coin.id)}
          className={`mt-1 flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border transition-colors ${
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
      </div>

      <div className="mb-5">
        <p className="text-3xl font-bold text-white font-mono">{formatPrice(coin.price)}</p>
        <div className="flex items-center gap-2 mt-1">
          <Change value={coin.change_24h} />
          <span className="text-slate-600 text-xs">24h</span>
        </div>
      </div>

      <div className="border-t border-white/5 pt-4">
        <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-3">Key Stats</p>
        <div className="space-y-2.5">
          {stats.map(([label, value]) => (
            <div key={label} className="flex justify-between items-center">
              <span className="text-slate-500 text-xs">{label}</span>
              <span className="text-white text-xs font-medium">{value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
