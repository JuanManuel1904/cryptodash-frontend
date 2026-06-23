import { useState, useEffect } from 'react'
import useCryptoStore from '../store/useCryptoStore'
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'
import AddPositionModal from '../components/AddPositionModal'

const API = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const ALLOCATION_COLORS = ['#22d3ee', '#a855f7', '#10b981', '#f59e0b', '#ef4444', '#06b6d4', '#8b5cf6', '#14b8a6']

function formatPrice(p) {
  if (!p && p !== 0) return '-'
  if (p >= 1000) return `$${p.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  if (p >= 1) return `$${p.toFixed(4)}`
  return `$${p.toFixed(6)}`
}

function formatLarge(n) {
  if (!n) return '-'
  if (n >= 1e12) return `$${(n / 1e12).toFixed(2)}T`
  if (n >= 1e9) return `$${(n / 1e9).toFixed(2)}B`
  if (n >= 1e6) return `$${(n / 1e6).toFixed(2)}M`
  if (n >= 1e3) return `$${(n / 1e3).toFixed(2)}K`
  return `$${n.toFixed(2)}`
}

export default function PortfolioPage() {
  const prices = useCryptoStore((s) => s.prices)
  const holdings = useCryptoStore((s) => s.holdings)
  const removeHolding = useCryptoStore((s) => s.removeHolding)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingCoin, setEditingCoin] = useState(null)
  const [fetchedPrices, setFetchedPrices] = useState({}) // { coinId: { name, symbol, image, price } }

  // Fetch prices for holdings not in live stream
  useEffect(() => {
    const coinIdsToFetch = Object.keys(holdings).filter(
      (coinId) => !prices.find((p) => p.id === coinId)
    )

    if (coinIdsToFetch.length === 0) return

    const fetchPricesForCoins = async () => {
      const newPrices = { ...fetchedPrices }
      for (const coinId of coinIdsToFetch) {
        if (newPrices[coinId]) continue // Already fetched
        try {
          const r = await fetch(`${API}/api/coin/${coinId}`)
          const json = await r.json()
          if (json.data) {
            newPrices[coinId] = json.data
          }
        } catch (e) {
          console.error(`Failed to fetch price for ${coinId}:`, e)
        }
      }
      setFetchedPrices(newPrices)
    }

    fetchPricesForCoins()
  }, [holdings, prices])

  // Build portfolio stats
  const portfolio = Object.entries(holdings).map(([coinId, { amount, buyPrice }]) => {
    // Try live prices first, then fetched prices
    const priceObj = prices.find((p) => p.id === coinId) || fetchedPrices[coinId]
    const currentPrice = priceObj?.price || 0
    const currentValue = amount * currentPrice
    const costBasis = amount * buyPrice
    const gainLoss = currentValue - costBasis
    const gainLossPct = costBasis > 0 ? (gainLoss / costBasis) * 100 : 0
    return {
      coinId,
      amount,
      buyPrice,
      currentPrice,
      currentValue,
      costBasis,
      gainLoss,
      gainLossPct,
      name: priceObj?.name || coinId,
      symbol: priceObj?.symbol || '?',
      image: priceObj?.image,
    }
  })

  const totalValue = portfolio.reduce((sum, p) => sum + p.currentValue, 0)
  const totalCostBasis = portfolio.reduce((sum, p) => sum + p.costBasis, 0)
  const totalGainLoss = totalValue - totalCostBasis
  const totalGainLossPct = totalCostBasis > 0 ? (totalGainLoss / totalCostBasis) * 100 : 0
  const isGain = totalGainLoss >= 0

  // Allocation pie data
  const pieData = portfolio.map((p) => ({
    name: p.symbol,
    value: p.currentValue,
    coinId: p.coinId,
  }))

  const handleEditClick = (coin) => {
    setEditingCoin(coin)
    setModalOpen(true)
  }

  const handleAddClick = () => {
    setEditingCoin(null)
    setModalOpen(true)
  }

  const handleCloseModal = () => {
    setModalOpen(false)
    setEditingCoin(null)
  }

  if (portfolio.length === 0) {
    return (
      <div className="flex flex-col gap-6 h-full overflow-auto">
        <div>
          <h2 className="text-white text-xl font-bold">Portfolio</h2>
          <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.3)' }}>
            Track your cryptocurrency holdings
          </p>
        </div>

        <div
          className="flex flex-col items-center justify-center rounded-2xl py-12"
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
        >
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center mb-4"
            style={{ background: 'rgba(34,211,238,0.1)' }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-6 h-6" style={{ color: 'var(--cyan)' }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m6-6H6" />
            </svg>
          </div>
          <p className="text-white font-semibold text-sm mb-2">No holdings yet</p>
          <p className="text-xs mb-4" style={{ color: 'rgba(255,255,255,0.3)' }}>
            Add your first cryptocurrency position to get started
          </p>
          <button
            onClick={handleAddClick}
            className="px-4 py-2 rounded-lg text-sm font-semibold transition-all"
            style={{
              background: 'var(--cyan)',
              color: '#0d1424',
              boxShadow: '0 0 16px rgba(34,211,238,0.3)',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.boxShadow = '0 0 24px rgba(34,211,238,0.5)')}
            onMouseLeave={(e) => (e.currentTarget.style.boxShadow = '0 0 16px rgba(34,211,238,0.3)')}
          >
            Add Position
          </button>
        </div>

        <AddPositionModal open={modalOpen} onClose={handleCloseModal} editingCoin={editingCoin} />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 h-full overflow-auto">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-white text-xl font-bold">Portfolio</h2>
          <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.3)' }}>
            Total value and allocation
          </p>
        </div>
        <button
          onClick={handleAddClick}
          className="px-3.5 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2"
          style={{
            background: 'rgba(34,211,238,0.12)',
            color: 'var(--cyan)',
            border: '1px solid rgba(34,211,238,0.25)',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(34,211,238,0.18)')}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(34,211,238,0.12)')}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Add Position
        </button>
      </div>

      {/* Total value card */}
      <div
        className="rounded-2xl p-6"
        style={{
          background: 'linear-gradient(135deg, rgba(34,211,238,0.08) 0%, rgba(168,85,247,0.08) 100%)',
          border: '1px solid var(--border)',
        }}
      >
        <p className="text-xs uppercase tracking-widest font-semibold" style={{ color: 'rgba(255,255,255,0.3)' }}>
          Portfolio Value
        </p>
        <h3 className="text-white text-3xl font-bold mt-2">{formatLarge(totalValue)}</h3>
        <div className="flex items-center gap-3 mt-3">
          <span
            className="text-sm font-semibold"
            style={{ color: isGain ? '#10b981' : '#f43f5e' }}
          >
            {isGain ? '+' : ''}{formatLarge(totalGainLoss)}
          </span>
          <span
            className="text-xs font-semibold px-2.5 py-1 rounded-lg"
            style={{
              background: isGain ? 'rgba(16,185,129,0.12)' : 'rgba(244,63,94,0.12)',
              color: isGain ? '#10b981' : '#f43f5e',
            }}
          >
            {isGain ? '+' : ''}{totalGainLossPct.toFixed(2)}%
          </span>
        </div>
        <div className="flex items-center gap-6 mt-4 pt-4 border-t" style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
          <div>
            <p className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>Cost Basis</p>
            <p className="text-white font-semibold mt-1">{formatLarge(totalCostBasis)}</p>
          </div>
          <div>
            <p className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>Holdings</p>
            <p className="text-white font-semibold mt-1">{portfolio.length} {portfolio.length === 1 ? 'coin' : 'coins'}</p>
          </div>
        </div>
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-3 gap-6">
        {/* Holdings table */}
        <div className="col-span-2 rounded-2xl overflow-hidden border" style={{ borderColor: 'var(--border)' }}>
          <div className="border-b" style={{ background: 'rgba(255,255,255,0.03)', borderColor: 'var(--border)' }}>
            <div className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr_80px] gap-4 px-6 py-3">
              <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.25)' }}>
                Coin
              </p>
              <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.25)' }}>
                Amount
              </p>
              <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.25)' }}>
                Buy Price
              </p>
              <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.25)' }}>
                Current
              </p>
              <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.25)' }}>
                Value
              </p>
              <p className="text-xs font-semibold uppercase tracking-widest text-right" style={{ color: 'rgba(255,255,255,0.25)' }}>
                Actions
              </p>
            </div>
          </div>

          {portfolio.map((p, i) => {
            const isGainRow = p.gainLoss >= 0
            return (
              <div
                key={p.coinId}
                className="border-b last:border-0 grid grid-cols-[2fr_1fr_1fr_1fr_1fr_80px] gap-4 px-6 py-3 items-center"
                style={{ borderColor: 'rgba(255,255,255,0.04)' }}
              >
                <div className="flex items-center gap-3 min-w-0">
                  {p.image && <img src={p.image} alt={p.name} className="w-7 h-7 rounded-full flex-shrink-0" />}
                  <div className="min-w-0">
                    <p className="text-white text-sm font-semibold leading-none truncate">{p.name}</p>
                    <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.3)' }}>
                      {p.symbol}
                    </p>
                  </div>
                </div>

                <span className="text-sm text-white font-medium">{p.amount.toFixed(6)}</span>
                <span className="text-sm text-white font-medium">{formatPrice(p.buyPrice)}</span>
                <span className="text-sm text-white font-medium">{formatPrice(p.currentPrice)}</span>

                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-white">{formatLarge(p.currentValue)}</span>
                  <span
                    className="text-xs font-semibold mt-0.5"
                    style={{ color: isGainRow ? '#10b981' : '#f43f5e' }}
                  >
                    {isGainRow ? '+' : ''}{p.gainLossPct.toFixed(2)}%
                  </span>
                </div>

                <div className="flex items-center justify-end gap-1">
                  <button
                    onClick={() => handleEditClick(p)}
                    className="w-7 h-7 rounded flex items-center justify-center transition-colors"
                    style={{ color: 'rgba(255,255,255,0.3)' }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(255,255,255,0.08)'
                      e.currentTarget.style.color = 'var(--cyan)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'transparent'
                      e.currentTarget.style.color = 'rgba(255,255,255,0.3)'
                    }}
                  >
                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                      <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25z" />
                      <path d="M20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => removeHolding(p.coinId)}
                    className="w-7 h-7 rounded flex items-center justify-center transition-colors"
                    style={{ color: 'rgba(255,255,255,0.3)' }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(244,63,94,0.12)'
                      e.currentTarget.style.color = '#f43f5e'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'transparent'
                      e.currentTarget.style.color = 'rgba(255,255,255,0.3)'
                    }}
                  >
                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                      <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-9l-1 1H5v2h14V4z" />
                    </svg>
                  </button>
                </div>
              </div>
            )
          })}
        </div>

        {/* Allocation pie chart */}
        <div
          className="rounded-2xl p-6"
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
        >
          <p className="text-white font-semibold text-sm mb-4">Allocation</p>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={70}
                fill="#8884d8"
                dataKey="value"
              >
                {pieData.map((entry, i) => (
                  <Cell key={`cell-${i}`} fill={ALLOCATION_COLORS[i % ALLOCATION_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value) => formatLarge(value)}
                contentStyle={{ background: '#0d1424', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
              />
            </PieChart>
          </ResponsiveContainer>

          {/* Legend */}
          <div className="flex flex-col gap-2 mt-4 max-h-40 overflow-y-auto">
            {pieData.map((entry, i) => {
              const holding = portfolio.find((p) => p.coinId === entry.coinId)
              const pct = totalValue > 0 ? (entry.value / totalValue) * 100 : 0
              return (
                <div key={entry.coinId} className="flex items-center gap-2 text-xs">
                  <div
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ background: ALLOCATION_COLORS[i % ALLOCATION_COLORS.length] }}
                  />
                  <span className="flex-1 truncate" style={{ color: 'rgba(255,255,255,0.5)' }}>
                    {holding?.name || entry.name}
                  </span>
                  <span className="font-semibold text-white flex-shrink-0">{pct.toFixed(1)}%</span>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      <AddPositionModal open={modalOpen} onClose={handleCloseModal} editingCoin={editingCoin} />
    </div>
  )
}
