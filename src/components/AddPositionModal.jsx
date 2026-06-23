import { useState, useEffect } from 'react'
import useCryptoStore from '../store/useCryptoStore'
import CoinPicker from './CoinPicker'

const API = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export default function AddPositionModal({ open, onClose, editingCoin }) {
  const [coin, setCoin] = useState(null)
  const [amount, setAmount] = useState('')
  const [inputMode, setInputMode] = useState('quantity') // 'quantity' o 'usd'
  const [currentPrice, setCurrentPrice] = useState(0)
  const [loadingPrice, setLoadingPrice] = useState(false)
  const prices = useCryptoStore((s) => s.prices)
  const addHolding = useCryptoStore((s) => s.addHolding)
  const updateHolding = useCryptoStore((s) => s.updateHolding)

  // Initialize from editingCoin
  useEffect(() => {
    if (editingCoin) {
      setCoin({
        id: editingCoin.coinId,
        name: editingCoin.name,
        symbol: editingCoin.symbol,
        image: editingCoin.image,
      })
      setAmount(editingCoin.amount.toString())
      setInputMode('quantity')
    } else {
      setCoin(null)
      setAmount('')
      setInputMode('quantity')
    }
  }, [editingCoin, open])

  // Get or fetch current price when coin changes
  useEffect(() => {
    if (!coin) {
      setCurrentPrice(0)
      return
    }

    // Try to get from live prices first
    const livePrice = prices.find((p) => p.id === coin.id)?.price
    if (livePrice) {
      setCurrentPrice(livePrice)
      return
    }

    // If not in live prices, fetch from API
    setLoadingPrice(true)
    fetch(`${API}/api/coin/${coin.id}`)
      .then((r) => r.json())
      .then(({ data }) => {
        if (data?.price) {
          setCurrentPrice(data.price)
        }
      })
      .catch(() => {})
      .finally(() => setLoadingPrice(false))
  }, [coin, prices])

  const handleSave = () => {
    if (!coin || currentPrice <= 0) return

    let finalAmount = 0
    if (inputMode === 'quantity') {
      finalAmount = parseFloat(amount) || 0
    } else {
      const usdAmount = parseFloat(amount) || 0
      finalAmount = usdAmount / currentPrice
    }

    if (finalAmount <= 0) return

    if (editingCoin) {
      updateHolding(coin.id, finalAmount, currentPrice)
    } else {
      addHolding(coin.id, finalAmount, currentPrice)
    }
    onClose()
  }

  if (!open) return null

  const amountNum = parseFloat(amount) || 0
  let totalInvestment = 0

  if (inputMode === 'quantity') {
    totalInvestment = amountNum * currentPrice
  } else {
    totalInvestment = amountNum
  }

  const calculatedQuantity = currentPrice > 0 ? totalInvestment / currentPrice : 0
  const isValid = coin && amount && amountNum > 0 && currentPrice > 0

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
        onClick={onClose}
        style={{ background: 'rgba(0,0,0,0.5)' }}
      />

      {/* Modal */}
      <div
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md rounded-2xl z-50 p-6"
        style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-5">
          <div>
            <h3 className="text-white text-lg font-bold">
              {editingCoin ? 'Edit Position' : 'Add Position'}
            </h3>
            <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.3)' }}>
              {editingCoin ? 'Update your holding details' : 'Add a new cryptocurrency to your portfolio'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-6 h-6 rounded flex items-center justify-center transition-colors"
            style={{ color: 'rgba(255,255,255,0.3)' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.08)'
              e.currentTarget.style.color = 'white'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent'
              e.currentTarget.style.color = 'rgba(255,255,255,0.3)'
            }}
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <div className="flex flex-col gap-4">
          {/* Coin picker */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-widest mb-2 block" style={{ color: 'rgba(255,255,255,0.3)' }}>
              Cryptocurrency
            </label>
            <CoinPicker value={coin} onChange={setCoin} color="var(--cyan)" />
          </div>

          {/* Input mode toggle */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-widest mb-2 block" style={{ color: 'rgba(255,255,255,0.3)' }}>
              Investment Type
            </label>
            <div className="flex items-center gap-2 p-1 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)' }}>
              <button
                onClick={() => setInputMode('quantity')}
                className="flex-1 px-3 py-2 rounded-lg text-xs font-semibold transition-all"
                style={{
                  background: inputMode === 'quantity' ? 'rgba(34,211,238,0.12)' : 'transparent',
                  color: inputMode === 'quantity' ? 'var(--cyan)' : 'rgba(255,255,255,0.3)',
                  border: inputMode === 'quantity' ? '1px solid rgba(34,211,238,0.25)' : 'transparent',
                }}
              >
                Quantity
              </button>
              <button
                onClick={() => setInputMode('usd')}
                className="flex-1 px-3 py-2 rounded-lg text-xs font-semibold transition-all"
                style={{
                  background: inputMode === 'usd' ? 'rgba(34,211,238,0.12)' : 'transparent',
                  color: inputMode === 'usd' ? 'var(--cyan)' : 'rgba(255,255,255,0.3)',
                  border: inputMode === 'usd' ? '1px solid rgba(34,211,238,0.25)' : 'transparent',
                }}
              >
                USD Amount
              </button>
            </div>
          </div>

          {/* Amount input */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-widest mb-2 block" style={{ color: 'rgba(255,255,255,0.3)' }}>
              {inputMode === 'quantity' ? `Amount (${coin?.symbol || 'coins'})` : 'Investment Amount (USD)'}
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder={inputMode === 'quantity' ? 'e.g., 0.5' : 'e.g., 1000'}
              step={inputMode === 'quantity' ? '0.00000001' : '1'}
              min="0"
              className="w-full px-4 py-3 rounded-xl text-white outline-none text-sm"
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid var(--border)',
              }}
              onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--cyan)')}
              onBlur={(e) => (e.currentTarget.style.borderColor = 'var(--border)')}
            />
            <p className="text-xs mt-1.5" style={{ color: 'rgba(255,255,255,0.2)' }}>
              {inputMode === 'quantity' ? `How many ${coin?.symbol || 'coins'} do you own?` : 'Total amount you invested'}
            </p>
          </div>

          {/* Current price display */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-widest mb-2 block" style={{ color: 'rgba(255,255,255,0.3)' }}>
              Current Price
            </label>
            <div
              className="w-full px-4 py-3 rounded-xl text-white text-sm flex items-center justify-between"
              style={{
                background: 'rgba(34,211,238,0.08)',
                border: '1px solid rgba(34,211,238,0.2)',
              }}
            >
              {loadingPrice && coin ? (
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full border-2 animate-spin" style={{ borderColor: 'rgba(34,211,238,0.2)', borderTopColor: 'var(--cyan)' }} />
                  <span className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>Loading price...</span>
                </div>
              ) : (
                <>
                  <span className="font-semibold">
                    {coin && currentPrice > 0 ? `$${currentPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '—'}
                  </span>
                  <span className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>
                    per {coin?.symbol || 'unit'}
                  </span>
                </>
              )}
            </div>
            <p className="text-xs mt-1.5" style={{ color: 'rgba(255,255,255,0.2)' }}>
              Price at the moment of purchase
            </p>
          </div>

          {/* Summary preview */}
          {isValid && (
            <div
              className="rounded-xl p-3 mt-2"
              style={{ background: 'rgba(34,211,238,0.08)', border: '1px solid rgba(34,211,238,0.2)' }}
            >
              {inputMode === 'quantity' ? (
                <>
                  <div className="flex items-center justify-between text-xs">
                    <span style={{ color: 'rgba(255,255,255,0.3)' }}>Total Investment:</span>
                    <span className="font-semibold text-white">
                      ${totalInvestment.toLocaleString('en-US', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span style={{ color: 'rgba(255,255,255,0.3)' }}>Investment Amount:</span>
                    <span className="font-semibold text-white">
                      ${totalInvestment.toLocaleString('en-US', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span style={{ color: 'rgba(255,255,255,0.3)' }}>You will get:</span>
                    <span className="font-semibold text-white">
                      {calculatedQuantity.toFixed(8)} {coin?.symbol}
                    </span>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Buttons */}
          <div className="flex items-center gap-3 mt-4">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all"
              style={{
                background: 'rgba(255,255,255,0.06)',
                color: 'rgba(255,255,255,0.7)',
                border: '1px solid rgba(255,255,255,0.1)',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.08)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.06)')}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={!isValid}
              className="flex-1 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all"
              style={{
                background: isValid ? 'var(--cyan)' : 'rgba(34,211,238,0.2)',
                color: isValid ? '#0d1424' : 'rgba(34,211,238,0.5)',
                cursor: isValid ? 'pointer' : 'not-allowed',
              }}
              onMouseEnter={(e) => {
                if (isValid) e.currentTarget.style.boxShadow = '0 0 16px rgba(34,211,238,0.4)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = 'none'
              }}
            >
              {editingCoin ? 'Update' : 'Add'}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
