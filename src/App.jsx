import useWebSocket from './hooks/useWebSocket'
import useCryptoStore from './store/useCryptoStore'
import PriceCard from './components/PriceCard'
import PriceChart from './components/PriceChart'
import SkeletonCard from './components/SkeletonCard'
import StatusBadge from './components/StatusBadge'
import ThemeToggle from './components/ThemeToggle'

function App() {
  useWebSocket()

  const prices = useCryptoStore((s) => s.prices)
  const loading = prices.length === 0

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors">
      <header className="sticky top-0 z-10 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="text-lg font-semibold text-gray-900 dark:text-gray-100">CryptoDash</span>
            <StatusBadge />
          </div>
          <ThemeToggle />
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {loading
            ? Array.from({ length: 5 }).map((_, i) => <SkeletonCard key={i} />)
            : prices.map((coin) => <PriceCard key={coin.id} coin={coin} />)
          }
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
          <PriceChart />
        </div>
      </main>
    </div>
  )
}

export default App
