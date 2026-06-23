import { useState, useRef, useEffect } from 'react'

const API = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const DEFAULT_COINS = [
  { id: 'bitcoin',     name: 'Bitcoin',  symbol: 'BTC', image: 'https://assets.coingecko.com/coins/images/1/large/bitcoin.png' },
  { id: 'ethereum',    name: 'Ethereum', symbol: 'ETH', image: 'https://assets.coingecko.com/coins/images/279/large/ethereum.png' },
  { id: 'solana',      name: 'Solana',   symbol: 'SOL', image: 'https://assets.coingecko.com/coins/images/4128/large/solana.png' },
  { id: 'binancecoin', name: 'BNB',      symbol: 'BNB', image: 'https://assets.coingecko.com/coins/images/825/large/bnb-icon2_2x.png' },
  { id: 'cardano',     name: 'Cardano',  symbol: 'ADA', image: 'https://assets.coingecko.com/coins/images/975/large/cardano.png' },
  { id: 'ripple',      name: 'XRP',      symbol: 'XRP', image: 'https://assets.coingecko.com/coins/images/44/large/xrp-symbol-white-128.png' },
  { id: 'dogecoin',    name: 'Dogecoin', symbol: 'DOGE', image: 'https://assets.coingecko.com/coins/images/5/large/dogecoin.png' },
]

export default function CoinPicker({ value, onChange, color, disabled }) {
  const [open,      setOpen]      = useState(false)
  const [query,     setQuery]     = useState('')
  const [results,   setResults]   = useState(DEFAULT_COINS)
  const [searching, setSearching] = useState(false)
  const debounce = useRef(null)
  const containerRef = useRef(null)

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false)
        setQuery('')
        setResults(DEFAULT_COINS)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleInput = (e) => {
    const val = e.target.value
    setQuery(val)
    clearTimeout(debounce.current)
    if (!val.trim()) { setResults(DEFAULT_COINS); return }
    debounce.current = setTimeout(async () => {
      setSearching(true)
      try {
        const r    = await fetch(`${API}/api/search?q=${encodeURIComponent(val.trim())}`)
        const json = await r.json()
        setResults(json.results || [])
      } catch { setResults([]) }
      finally  { setSearching(false) }
    }, 350)
  }

  const select = (coin) => {
    onChange(coin)
    setOpen(false)
    setQuery('')
    setResults(DEFAULT_COINS)
  }

  const clear = (e) => {
    e.stopPropagation()
    onChange(null)
  }

  return (
    <div ref={containerRef} className="relative">
      {/* Trigger */}
      <button
        onClick={() => !disabled && setOpen((o) => !o)}
        className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl border transition-all duration-200 text-left"
        style={{
          background: value ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.02)',
          border: `1px solid ${open ? color + '50' : 'var(--border)'}`,
          boxShadow: open ? `0 0 20px ${color}15` : 'none',
          cursor: disabled ? 'not-allowed' : 'pointer',
          opacity: disabled ? 0.5 : 1,
        }}
      >
        {value ? (
          <>
            <div className="relative">
              <img src={value.image} alt={value.name} className="w-9 h-9 rounded-full" />
              <div className="absolute inset-0 rounded-full" style={{ boxShadow: `0 0 10px ${color}60` }} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-semibold text-sm leading-none">{value.name}</p>
              <p className="text-xs mt-1 font-medium" style={{ color: 'rgba(255,255,255,0.35)' }}>{value.symbol}</p>
            </div>
            <button
              onClick={clear}
              className="w-6 h-6 rounded-full flex items-center justify-center transition-colors hover:bg-white/10"
              style={{ color: 'rgba(255,255,255,0.3)' }}
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
              </svg>
            </button>
          </>
        ) : (
          <>
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ background: `${color}15`, border: `1px dashed ${color}40` }}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-4 h-4" style={{ color }}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
            </div>
            <span className="text-sm" style={{ color: 'rgba(255,255,255,0.3)' }}>Select a cryptocurrency</span>
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 ml-auto flex-shrink-0" style={{ color: 'rgba(255,255,255,0.2)' }}>
              <path d="M7 10l5 5 5-5z" />
            </svg>
          </>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div
          className="absolute top-full left-0 right-0 mt-2 rounded-2xl border overflow-hidden z-50"
          style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', boxShadow: '0 20px 60px rgba(0,0,0,0.5)' }}
        >
          {/* Search input */}
          <div className="p-3 border-b" style={{ borderColor: 'var(--border)' }}>
            <div className="relative">
              <svg viewBox="0 0 24 24" fill="currentColor" className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 pointer-events-none" style={{ color: 'rgba(255,255,255,0.25)' }}>
                <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
              </svg>
              <input
                autoFocus
                type="text"
                value={query}
                onChange={handleInput}
                placeholder="Search coins..."
                className="w-full pl-8 pr-3 py-2 text-sm text-white placeholder-white/20 outline-none rounded-xl"
                style={{ background: 'rgba(255,255,255,0.05)' }}
              />
              {searching && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 border-2 border-t-cyan-400 border-white/10 rounded-full animate-spin" />
              )}
            </div>
          </div>

          {/* Results */}
          <div className="max-h-56 overflow-y-auto">
            {results.length === 0 ? (
              <p className="text-center py-6 text-xs" style={{ color: 'rgba(255,255,255,0.2)' }}>No results</p>
            ) : (
              results.map((coin) => (
                <button
                  key={coin.id}
                  onClick={() => select(coin)}
                  className="w-full flex items-center gap-3 px-4 py-2.5 transition-colors text-left"
                  style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <img
                    src={coin.image || coin.large || coin.thumb}
                    alt={coin.name}
                    className="w-7 h-7 rounded-full flex-shrink-0 bg-white/10"
                    onError={e => { e.target.style.display = 'none' }}
                  />
                  <div className="min-w-0">
                    <p className="text-white text-sm font-medium truncate leading-none">{coin.name}</p>
                    <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.3)' }}>{coin.symbol?.toUpperCase()}</p>
                  </div>
                  {coin.market_cap_rank && (
                    <span className="ml-auto text-xs flex-shrink-0" style={{ color: 'rgba(255,255,255,0.2)' }}>
                      #{coin.market_cap_rank}
                    </span>
                  )}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
