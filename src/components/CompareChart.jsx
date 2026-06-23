import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine } from 'recharts'

const COIN_COLORS = ['#22d3ee', '#a855f7']

function formatTime(iso, days) {
  if (!iso) return ''
  const d = new Date(iso)
  if (days <= 1)  return d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
  if (days <= 7)  return d.toLocaleDateString(undefined, { weekday: 'short' })
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

function formatPct(v) {
  if (v == null) return ''
  return `${v >= 0 ? '+' : ''}${v.toFixed(2)}%`
}

function CustomTooltip({ active, payload, days, coins }) {
  if (!active || !payload?.length) return null
  const ts = payload[0]?.payload?.timestamp
  return (
    <div
      className="rounded-xl px-4 py-3 text-xs"
      style={{ background: '#0d1424', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}
    >
      {ts && <p className="mb-2" style={{ color: 'rgba(255,255,255,0.35)' }}>{formatTime(ts, days)}</p>}
      {payload.map((entry, i) => {
        const coin = coins[i]
        if (!coin) return null
        const pct = entry.value
        const pos = pct >= 0
        return (
          <div key={i} className="flex items-center gap-2 mb-1 last:mb-0">
            <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: COIN_COLORS[i] }} />
            <span className="font-medium" style={{ color: 'rgba(255,255,255,0.7)' }}>{coin.symbol}</span>
            <span className="font-bold ml-auto pl-4" style={{ color: pos ? '#10b981' : '#f43f5e' }}>
              {formatPct(pct)}
            </span>
          </div>
        )
      })}
    </div>
  )
}

// Normalize two datasets to % change from first point, aligned by index
function buildChartData(datasets) {
  const keys = Object.keys(datasets)
  if (!keys.length) return []

  // Normalize each series to % change
  const normalized = {}
  keys.forEach((key) => {
    const pts = datasets[key]
    if (!pts?.length) { normalized[key] = []; return }
    const base = pts[0].price
    normalized[key] = pts.map((p) => ({
      timestamp: p.timestamp,
      pct: base ? ((p.price - base) / base) * 100 : 0,
    }))
  })

  // Align by index using the longest series
  const maxLen = Math.max(...keys.map((k) => normalized[k].length))
  const result = []
  for (let i = 0; i < maxLen; i++) {
    const point = { timestamp: normalized[keys[0]]?.[i]?.timestamp }
    keys.forEach((key, ki) => {
      const p = normalized[key][i]
      if (p) point[`pct_${ki}`] = parseFloat(p.pct.toFixed(4))
    })
    result.push(point)
  }
  return result
}

export default function CompareChart({ datasets, days, coins }) {
  const data = buildChartData(datasets)

  if (!data.length) {
    return (
      <div
        className="flex items-center justify-center text-sm rounded-2xl"
        style={{ height: 320, background: 'rgba(255,255,255,0.02)', color: 'rgba(255,255,255,0.15)' }}
      >
        Select two coins to compare their performance
      </div>
    )
  }

  // Dynamic Y domain
  const allVals = data.flatMap((d) => coins.map((_, i) => d[`pct_${i}`]).filter((v) => v != null))
  const minVal  = Math.min(...allVals)
  const maxVal  = Math.max(...allVals)
  const pad     = (maxVal - minVal) * 0.12 || 2

  return (
    <ResponsiveContainer width="100%" height={320}>
      <LineChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <defs>
          {coins.map((_, i) => (
            <filter key={i} id={`glow_${i}`}>
              <feGaussianBlur stdDeviation="3" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          ))}
        </defs>

        <CartesianGrid strokeDasharray="1 6" stroke="rgba(255,255,255,0.04)" vertical={false} />

        <XAxis
          dataKey="timestamp"
          tickFormatter={(v) => formatTime(v, days)}
          tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.25)' }}
          interval="preserveStartEnd"
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          domain={[minVal - pad, maxVal + pad]}
          tickFormatter={(v) => `${v >= 0 ? '+' : ''}${v.toFixed(1)}%`}
          tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.25)' }}
          tickLine={false}
          axisLine={false}
          width={60}
        />

        <ReferenceLine y={0} stroke="rgba(255,255,255,0.12)" strokeDasharray="4 4" />

        <Tooltip content={<CustomTooltip days={days} coins={coins} />} />

        {coins.map((coin, i) => (
          <Line
            key={coin.id}
            type="monotone"
            dataKey={`pct_${i}`}
            stroke={COIN_COLORS[i]}
            strokeWidth={2.5}
            dot={false}
            isAnimationActive={false}
            connectNulls
            filter={`url(#glow_${i})`}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  )
}
