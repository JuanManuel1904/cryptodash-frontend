import { useState, useEffect } from 'react'
import CoinPicker from '../components/CoinPicker'
import CompareChart from '../components/CompareChart'

const API = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const RANGES = [
  { label: '24h', days: 1 },
  { label: '7d',  days: 7 },
  { label: '1M',  days: 30 },
  { label: '3M',  days: 90 },
  { label: '1Y',  days: 365 },
]

const COIN_COLORS = ['#22d3ee', '#a855f7']

function formatPrice(price) {
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

function PctCell({ value }) {
  if (value == null) return <span style={{ color: 'rgba(255,255,255,0.2)' }}>-</span>
  const pos = value >= 0
  return (
    <span className="font-semibold text-sm" style={{ color: pos ? '#10b981' : '#f43f5e' }}>
      {pos ? '+' : ''}{value.toFixed(2)}%
    </span>
  )
}

const STAT_ROWS = [
  { label: 'Price',        key: 'price',       fmt: (v) => formatPrice(v) },
  { label: 'Market Cap',   key: 'market_cap',  fmt: (v) => formatLarge(v) },
  { label: 'Volume 24h',   key: 'volume_24h',  fmt: (v) => formatLarge(v) },
  { label: '1h Change',    key: 'change_1h',   fmt: null },
  { label: '24h Change',   key: 'change_24h',  fmt: null },
  { label: '7d Change',    key: 'change_7d',   fmt: null },
  { label: 'All Time High',key: 'ath',         fmt: (v) => formatPrice(v) },
  { label: 'All Time Low', key: 'atl',         fmt: (v) => formatPrice(v) },
]

function StatValue({ row, value }) {
  if (row.fmt === null) return <PctCell value={value} />
  return <span className="text-white text-sm font-medium">{value != null ? row.fmt(value) : '-'}</span>
}

// Determines which coin "wins" a given stat
function winner(row, coinA, coinB) {
  const va = coinA?.[row.key]
  const vb = coinB?.[row.key]
  if (va == null || vb == null) return null
  // For price, market cap, volume, ATH: higher is better
  // For ATL: lower is better (smaller ATL means it never dropped as far)
  const higherIsBetter = row.key !== 'atl'
  if (va === vb) return null
  if (higherIsBetter) return va > vb ? 'a' : 'b'
  return va < vb ? 'a' : 'b'
}

export default function ComparePage() {
  const [coinA,      setCoinA]      = useState(null)
  const [coinB,      setCoinB]      = useState(null)
  const [detailA,    setDetailA]    = useState(null)
  const [detailB,    setDetailB]    = useState(null)
  const [rangeIdx,   setRangeIdx]   = useState(1)
  const [datasets,   setDatasets]   = useState({})
  const [loading,    setLoading]    = useState(false)

  const range  = RANGES[rangeIdx]
  const coins  = [coinA, coinB].filter(Boolean)

  // Fetch detail when coin selected
  useEffect(() => {
    if (!coinA) { setDetailA(null); return }
    fetch(`${API}/api/coin/${coinA.id}`)
      .then(r => r.json()).then(({ data }) => setDetailA(data)).catch(() => {})
  }, [coinA?.id])

  useEffect(() => {
    if (!coinB) { setDetailB(null); return }
    fetch(`${API}/api/coin/${coinB.id}`)
      .then(r => r.json()).then(({ data }) => setDetailB(data)).catch(() => {})
  }, [coinB?.id])

  // Fetch comparison chart data
  useEffect(() => {
    if (coins.length < 2) { setDatasets({}); return }
    let cancelled = false
    setLoading(true)
    const ids = coins.map(c => c.id).join(',')
    fetch(`${API}/api/compare?coins=${ids}&days=${range.days}`)
      .then(r => r.json())
      .then(({ coins: data }) => { if (!cancelled) setDatasets(data || {}) })
      .catch(() => { if (!cancelled) setDatasets({}) })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [coinA?.id, coinB?.id, rangeIdx])

  const detailMap = { [coinA?.id]: detailA, [coinB?.id]: detailB }

  return (
    <div className="flex flex-col gap-6 h-full overflow-auto">
      {/* Header */}
      <div>
        <h2 className="text-white text-xl font-bold">Compare</h2>
        <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.3)' }}>
          Select two cryptocurrencies to compare their performance
        </p>
      </div>

      {/* Pickers */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-xs font-semibold mb-2 uppercase tracking-widest" style={{ color: COIN_COLORS[0] }}>
            Coin A
          </p>
          <CoinPicker value={coinA} onChange={setCoinA} color={COIN_COLORS[0]} />
        </div>
        <div>
          <p className="text-xs font-semibold mb-2 uppercase tracking-widest" style={{ color: COIN_COLORS[1] }}>
            Coin B
          </p>
          <CoinPicker value={coinB} onChange={setCoinB} color={COIN_COLORS[1]} />
        </div>
      </div>

      {/* VS divider with summary when both selected */}
      {coinA && coinB && (
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <img src={coinA.image} alt={coinA.name} className="w-7 h-7 rounded-full" style={{ boxShadow: `0 0 10px ${COIN_COLORS[0]}60` }} />
            <span className="text-white font-bold text-sm">{coinA.symbol}</span>
          </div>
          <div
            className="flex-1 h-px"
            style={{ background: `linear-gradient(90deg, ${COIN_COLORS[0]}, ${COIN_COLORS[1]})` }}
          />
          <div
            className="px-3 py-1 rounded-full text-xs font-bold"
            style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            VS
          </div>
          <div
            className="flex-1 h-px"
            style={{ background: `linear-gradient(90deg, ${COIN_COLORS[1]}, ${COIN_COLORS[0]})` }}
          />
          <div className="flex items-center gap-3">
            <span className="text-white font-bold text-sm">{coinB.symbol}</span>
            <img src={coinB.image} alt={coinB.name} className="w-7 h-7 rounded-full" style={{ boxShadow: `0 0 10px ${COIN_COLORS[1]}60` }} />
          </div>
        </div>
      )}

      {/* Stats table */}
      {(coinA || coinB) && (
        <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid var(--border)' }}>
          {/* Table header */}
          <div className="grid grid-cols-[1fr_1fr_1fr] border-b" style={{ background: 'rgba(255,255,255,0.03)', borderColor: 'var(--border)' }}>
            <div className="px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.25)' }}>Metric</p>
            </div>
            {[{ coin: coinA, detail: detailA, color: COIN_COLORS[0] }, { coin: coinB, detail: detailB, color: COIN_COLORS[1] }].map(({ coin, detail, color }, i) => (
              <div key={i} className="px-4 py-3 flex items-center gap-2 border-l" style={{ borderColor: 'var(--border)' }}>
                {coin ? (
                  <>
                    <img src={coin.image} alt={coin.name} className="w-5 h-5 rounded-full" />
                    <span className="text-sm font-bold" style={{ color }}>{coin.symbol}</span>
                    <span className="text-xs truncate" style={{ color: 'rgba(255,255,255,0.3)' }}>{coin.name}</span>
                  </>
                ) : (
                  <span className="text-xs" style={{ color: 'rgba(255,255,255,0.2)' }}>—</span>
                )}
              </div>
            ))}
          </div>

          {/* Rows */}
          {STAT_ROWS.map((row, ri) => {
            const w = winner(row, detailA, detailB)
            return (
              <div
                key={row.key}
                className="grid grid-cols-[1fr_1fr_1fr] border-b last:border-0"
                style={{ borderColor: 'rgba(255,255,255,0.04)' }}
              >
                <div className="px-4 py-3 flex items-center">
                  <span className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>{row.label}</span>
                </div>
                {[
                  { detail: detailA, side: 'a' },
                  { detail: detailB, side: 'b' },
                ].map(({ detail, side }, ci) => {
                  const isWinner = w === side
                  return (
                    <div
                      key={ci}
                      className="px-4 py-3 flex items-center gap-2 border-l"
                      style={{
                        borderColor: 'rgba(255,255,255,0.04)',
                        background: isWinner ? `${COIN_COLORS[ci]}08` : 'transparent',
                      }}
                    >
                      {isWinner && (
                        <div className="w-1 h-4 rounded-full flex-shrink-0" style={{ background: COIN_COLORS[ci] }} />
                      )}
                      <StatValue row={row} value={detail?.[row.key]} />
                    </div>
                  )
                })}
              </div>
            )
          })}
        </div>
      )}

      {/* Chart */}
      <div className="rounded-2xl p-5" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
        {/* Chart header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <p className="text-white font-semibold text-sm">Performance Comparison</p>
            <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.3)' }}>
              % change from start of period — normalized so prices are comparable
            </p>
          </div>

          {/* Legend + range */}
          <div className="flex items-center gap-4">
            {coins.map((coin, i) => (
              <div key={coin.id} className="flex items-center gap-1.5">
                <div className="w-6 h-0.5 rounded-full" style={{ background: COIN_COLORS[i] }} />
                <span className="text-xs font-medium" style={{ color: COIN_COLORS[i] }}>{coin.symbol}</span>
              </div>
            ))}

            <div className="flex items-center gap-1 ml-2">
              {RANGES.map((r, i) => (
                <button
                  key={r.label}
                  onClick={() => setRangeIdx(i)}
                  className="px-2.5 py-1 rounded-lg text-xs font-semibold transition-all"
                  style={{
                    background: rangeIdx === i ? 'rgba(34,211,238,0.12)' : 'transparent',
                    color: rangeIdx === i ? 'var(--cyan)' : 'rgba(255,255,255,0.3)',
                    border: `1px solid ${rangeIdx === i ? 'rgba(34,211,238,0.25)' : 'transparent'}`,
                  }}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center" style={{ height: 320 }}>
            <div className="w-7 h-7 rounded-full border-2 animate-spin" style={{ borderColor: 'rgba(34,211,238,0.2)', borderTopColor: 'var(--cyan)' }} />
          </div>
        ) : (
          <CompareChart datasets={datasets} days={range.days} coins={coins} />
        )}
      </div>
    </div>
  )
}
