import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import useCryptoStore from '../store/useCryptoStore'

function formatPrice(price) {
  if (!price) return ''
  if (price >= 1000) return `$${price.toLocaleString('en-US', { maximumFractionDigits: 0 })}`
  if (price >= 1)    return `$${price.toFixed(2)}`
  return `$${price.toFixed(5)}`
}

function formatTime(iso) {
  if (!iso) return ''
  return new Date(iso).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) return null
  const { price, timestamp } = payload[0].payload
  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-xs shadow-sm">
      <p className="text-gray-400 mb-0.5">{formatTime(timestamp)}</p>
      <p className="font-semibold font-mono text-gray-900 dark:text-gray-100">{formatPrice(price)}</p>
    </div>
  )
}

export default function PriceChart() {
  const selectedCoin = useCryptoStore((s) => s.selectedCoin)
  const history = useCryptoStore((s) => s.history)
  const prices = useCryptoStore((s) => s.prices)

  const data = history[selectedCoin] || []
  const coin = prices.find((p) => p.id === selectedCoin)

  if (data.length < 2) {
    return (
      <div className="flex items-center justify-center h-48 text-sm text-gray-400">
        Esperando datos…
      </div>
    )
  }

  const values = data.map((d) => d.price)
  const min = Math.min(...values)
  const max = Math.max(...values)
  const padding = (max - min) * 0.1 || 1
  const isPositive = values[values.length - 1] >= values[0]
  const strokeColor = isPositive ? '#16a34a' : '#ef4444'

  return (
    <div>
      <div className="flex items-baseline justify-between mb-4">
        <div className="flex items-center gap-2">
          {coin?.image && <img src={coin.image} alt={coin?.name} className="w-6 h-6 rounded-full" />}
          <h2 className="text-base font-medium text-gray-900 dark:text-gray-100">{coin?.name ?? selectedCoin}</h2>
        </div>
        <p className="text-2xl font-semibold font-mono text-gray-900 dark:text-gray-100">
          {coin ? formatPrice(coin.price) : '—'}
        </p>
      </div>

      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-gray-100 dark:text-gray-800" />
          <XAxis
            dataKey="timestamp"
            tickFormatter={formatTime}
            tick={{ fontSize: 10, fill: 'currentColor' }}
            className="text-gray-400"
            interval="preserveStartEnd"
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            domain={[min - padding, max + padding]}
            tickFormatter={formatPrice}
            tick={{ fontSize: 10, fill: 'currentColor' }}
            className="text-gray-400"
            tickLine={false}
            axisLine={false}
            width={72}
          />
          <Tooltip content={<CustomTooltip />} />
          <Line
            type="monotone"
            dataKey="price"
            stroke={strokeColor}
            strokeWidth={1.5}
            dot={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
