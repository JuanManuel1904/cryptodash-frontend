import { useState, useEffect } from 'react'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import useCryptoStore from '../store/useCryptoStore'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const RANGES = [
  { label: 'Live', days: 0 },
  { label: '24h',  days: 1 },
  { label: '7d',   days: 7 },
  { label: '1M',   days: 30 },
  { label: '3M',   days: 90 },
  { label: '1Y',   days: 365 },
]

function formatPrice(price) {
  if (!price && price !== 0) return ''
  if (price >= 1000) return `$${price.toLocaleString('en-US', { maximumFractionDigits: 0 })}`
  if (price >= 1)    return `$${price.toFixed(2)}`
  return `$${price.toFixed(5)}`
}

function formatPriceFull(price) {
  if (!price && price !== 0) return '-'
  if (price >= 1000) return `$${price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  if (price >= 1)    return `$${price.toFixed(4)}`
  return `$${price.toFixed(6)}`
}

function formatLarge(n) {
  if (!n) return '-'
  if (n >= 1e12) return `$${(n / 1e12).toFixed(2)}T`
  if (n >= 1e9)  return `$${(n / 1e9).toFixed(2)}B`
  if (n >= 1e6)  return `$${(n / 1e6).toFixed(2)}M`
  return `$${n.toLocaleString('en-US')}`
}

function formatTime(iso, days) {
  if (!iso) return ''
  const d = new Date(iso)
  if (days <= 1) return d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
  if (days <= 7) return d.toLocaleDateString(undefined, { weekday: 'short', hour: '2-digit', minute: '2-digit' })
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

function CustomTooltip({ active, payload, days }) {
  if (!active || !payload?.length) return null
  const { price, timestamp } = payload[0].payload
  return (
    <div className="rounded-lg px-3 py-2 text-xs shadow-lg border border-white/10" style={{ background: '#0d1424' }}>
      <p className="text-slate-400 mb-0.5">{formatTime(timestamp, days)}</p>
      <p className="font-semibold font-mono text-white">{formatPrice(price)}</p>
    </div>
  )
}

function RangeBar({ low, high, current }) {
  if (!low || !high || low === high) return null
  const pct = Math.max(0, Math.min(100, ((current - low) / (high - low)) * 100))
  return (
    <div>
      <div className="flex justify-between text-xs text-slate-500 mb-1.5">
        <span>{formatPrice(low)}</span>
        <span className="text-slate-600">24h Range</span>
        <span>{formatPrice(high)}</span>
      </div>
      <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
        <div
          className="h-full rounded-full"
          style={{
            background: 'linear-gradient(to right, #ef4444, #10b981)',
            width: '100%',
          }}
        />
      </div>
      <div className="relative h-2 mt-0.5">
        <div
          className="absolute w-2 h-2 rounded-full bg-white border-2 border-slate-800 -translate-x-1/2 -top-0.5"
          style={{ left: `${pct}%` }}
        />
      </div>
    </div>
  )
}

export default function PriceChart() {
  const selectedCoin   = useCryptoStore((s) => s.selectedCoin)
  const liveHistory    = useCryptoStore((s) => s.history)
  const prices         = useCryptoStore((s) => s.prices)
  const favorites      = useCryptoStore((s) => s.favorites)
  const favoritesData  = useCryptoStore((s) => s.favoritesData)
  const toggleFavorite = useCryptoStore((s) => s.toggleFavorite)

  const [rangeIdx,     setRangeIdx]     = useState(1) // default 24h
  const [chartData,    setChartData]    = useState([])
  const [loadingChart, setLoadingChart] = useState(false)
  const [coinDetail,   setCoinDetail]   = useState(null)

  // Check live prices first, then favoritesData, then freshly fetched detail
  const coin = prices.find((p) => p.id === selectedCoin)
    ?? favoritesData[selectedCoin]
    ?? coinDetail
  const range = RANGES[rangeIdx]

  // Reset to 24h when switching coins and fetch detail if not in live prices
  useEffect(() => {
    setRangeIdx(1)
    setCoinDetail(null)
    const inLive = prices.some((p) => p.id === selectedCoin)
    const inFavs = !!favoritesData[selectedCoin]
    if (!inLive && !inFavs) {
      fetch(`${API_URL}/api/coin/${selectedCoin}`)
        .then((r) => r.json())
        .then(({ data }) => { if (data) setCoinDetail(data) })
        .catch(() => {})
    }
  }, [selectedCoin])

  // Fetch historical data when range or coin changes
  useEffect(() => {
    if (range.days === 0) {
      setChartData([])
      setLoadingChart(false)
      return
    }
    let cancelled = false
    setLoadingChart(true)
    setChartData([])
    fetch(`${API_URL}/api/coin/${selectedCoin}/chart?days=${range.days}`)
      .then((r) => r.json())
      .then(({ points }) => { if (!cancelled) setChartData(points || []) })
      .catch(() => { if (!cancelled) setChartData([]) })
      .finally(() => { if (!cancelled) setLoadingChart(false) })
    return () => { cancelled = true }
  }, [selectedCoin, rangeIdx])

  const liveData = liveHistory[selectedCoin] || []
  const rawData  = range.days === 0 ? liveData : chartData
  const data     = rawData.length === 1 ? [rawData[0], rawData[0]] : rawData

  const values = data.map((d) => d.price).filter(Boolean)
  const min = values.length ? Math.min(...values) : 0
  const max = values.length ? Math.max(...values) : 1
  const padding = (max - min) * 0.08 || 1
  const isPositive  = values.length >= 2 ? values[values.length - 1] >= values[0] : true
  const strokeColor = isPositive ? '#10b981' : '#f43f5e'
  const change24    = coin?.change_24h ?? 0
  const change24Pos = change24 >= 0
  const followed    = favorites.has(coin?.id)

  return (
    <div className="flex gap-8">
      {/* ── Left info panel ── */}
      <div className="w-60 flex-shrink-0 flex flex-col gap-5">
        {/* Coin header */}
        <div className="flex items-center gap-3">
          {coin?.image && (
            <div className="relative">
              <img src={coin.image} alt={coin?.name} className="w-10 h-10 rounded-full" />
              <div className="absolute inset-0 rounded-full" style={{ boxShadow: `0 0 14px ${strokeColor}50` }} />
            </div>
          )}
          <div>
            <p className="text-white font-bold text-base leading-none">{coin?.name ?? selectedCoin}</p>
            <p className="text-xs mt-0.5 font-medium" style={{ color: 'rgba(255,255,255,0.3)' }}>{coin?.symbol}</p>
          </div>
        </div>

        {/* Price */}
        <div>
          <p className="font-bold font-mono leading-none mb-2" style={{ fontSize: 28, color: '#fff' }}>
            {coin ? formatPriceFull(coin.price) : <span style={{ color: 'rgba(255,255,255,0.2)' }}>—</span>}
          </p>
          <div className="flex items-center gap-2">
            <span
              className="text-sm font-bold px-2 py-0.5 rounded-lg"
              style={{
                background: change24Pos ? 'rgba(16,185,129,0.12)' : 'rgba(244,63,94,0.12)',
                color: change24Pos ? '#10b981' : '#f43f5e',
              }}
            >
              {change24Pos ? '+' : ''}{change24.toFixed(2)}%
            </span>
            <span className="text-xs" style={{ color: 'rgba(255,255,255,0.25)' }}>24h</span>
          </div>
        </div>

        {/* 24h Range bar */}
        {coin?.high_24h && coin?.low_24h && (
          <RangeBar low={coin.low_24h} high={coin.high_24h} current={coin.price} />
        )}

        {/* Stats */}
        <div className="flex flex-col gap-0" style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: 16 }}>
          {[
            ['Market Cap',  formatLarge(coin?.market_cap), null],
            ['Volume 24h',  formatLarge(coin?.volume_24h), null],
            ['1h Change',   null, coin?.change_1h],
            ['7d Change',   null, coin?.change_7d],
          ].map(([label, text, pct]) => (
            <div
              key={label}
              className="flex justify-between items-center py-2"
              style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
            >
              <span className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>{label}</span>
              {pct != null ? (
                <span className="text-xs font-semibold" style={{ color: pct >= 0 ? '#10b981' : '#f43f5e' }}>
                  {pct >= 0 ? '+' : ''}{pct.toFixed(2)}%
                </span>
              ) : (
                <span className="text-xs font-medium text-white">{text ?? '—'}</span>
              )}
            </div>
          ))}
        </div>

        {/* Follow button */}
        {coin && (
          <button
            onClick={() => toggleFavorite(coin.id)}
            className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-semibold transition-all duration-200"
            style={{
              background: followed ? 'rgba(34,211,238,0.1)' : 'rgba(255,255,255,0.04)',
              border: `1px solid ${followed ? 'rgba(34,211,238,0.3)' : 'rgba(255,255,255,0.08)'}`,
              color: followed ? 'var(--cyan)' : 'rgba(255,255,255,0.4)',
              boxShadow: followed ? '0 0 16px rgba(34,211,238,0.1)' : 'none',
            }}
          >
            <svg viewBox="0 0 24 24" fill={followed ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={followed ? 0 : 1.5} className="w-4 h-4">
              <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
            </svg>
            {followed ? 'Following' : 'Follow'}
          </button>
        )}
      </div>

      {/* ── Right chart panel ── */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Range tabs */}
        <div className="flex items-center gap-1 mb-5">
          {RANGES.map((r, i) => (
            <button
              key={r.label}
              onClick={() => setRangeIdx(i)}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200"
              style={{
                background: rangeIdx === i ? 'rgba(34,211,238,0.12)' : 'transparent',
                color: rangeIdx === i ? 'var(--cyan)' : 'rgba(255,255,255,0.3)',
                border: `1px solid ${rangeIdx === i ? 'rgba(34,211,238,0.25)' : 'transparent'}`,
                boxShadow: rangeIdx === i ? '0 0 12px rgba(34,211,238,0.1)' : 'none',
              }}
            >
              {r.label}
            </button>
          ))}
        </div>

        {/* Chart */}
        {loadingChart ? (
          <div className="flex items-center justify-center" style={{ height: 260 }}>
            <div
              className="w-7 h-7 rounded-full border-2 animate-spin"
              style={{ borderColor: 'rgba(34,211,238,0.2)', borderTopColor: 'var(--cyan)' }}
            />
          </div>
        ) : data.length === 0 ? (
          <div className="flex items-center justify-center text-sm" style={{ height: 260, color: 'rgba(255,255,255,0.15)' }}>
            Waiting for data...
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={data} margin={{ top: 8, right: 4, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%"    stopColor={strokeColor} stopOpacity={0.3} />
                  <stop offset="75%"   stopColor={strokeColor} stopOpacity={0.05} />
                  <stop offset="100%"  stopColor={strokeColor} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="1 6" stroke="rgba(255,255,255,0.04)" vertical={false} />
              <XAxis
                dataKey="timestamp"
                tickFormatter={(v) => formatTime(v, range.days)}
                tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.25)', fontFamily: 'Inter' }}
                interval="preserveStartEnd"
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                domain={[min - padding, max + padding]}
                tickFormatter={formatPrice}
                tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.25)', fontFamily: 'Inter' }}
                tickLine={false}
                axisLine={false}
                width={72}
              />
              <Tooltip content={<CustomTooltip days={range.days} />} />
              <Area
                type="monotone"
                dataKey="price"
                stroke={strokeColor}
                strokeWidth={2}
                fill="url(#areaGrad)"
                dot={false}
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  )
}
