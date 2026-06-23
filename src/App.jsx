import { useState } from 'react'
import useWebSocket from './hooks/useWebSocket'
import useCryptoStore from './store/useCryptoStore'
import Sidebar from './components/Sidebar'
import PriceChart from './components/PriceChart'
import PriceCard from './components/PriceCard'
import SkeletonCard from './components/SkeletonCard'
import MyList from './components/MyList'
import SearchPage from './pages/SearchPage'
import ComparePage from './pages/ComparePage'
import PortfolioPage from './pages/PortfolioPage'
import StatusBadge from './components/StatusBadge'

export default function App() {
  useWebSocket()
  const [page, setPage] = useState('home')
  const prices  = useCryptoStore((s) => s.prices)
  const loading = prices.length === 0

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--bg-base)' }}>
      {/* Ambient background glows */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full opacity-20"
          style={{ background: 'radial-gradient(circle, rgba(34,211,238,0.15) 0%, transparent 70%)' }} />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, rgba(168,85,247,0.2) 0%, transparent 70%)' }} />
      </div>

      <Sidebar page={page} onNavigate={setPage} />

      <div className="flex flex-1 min-w-0 overflow-hidden relative">
        <main className="flex-1 min-w-0 overflow-auto p-6">
          {page === 'home' && (
            <div className="flex flex-col gap-5">
              {/* Price cards */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                {loading
                  ? Array.from({ length: 5 }).map((_, i) => <SkeletonCard key={i} />)
                  : prices.map((coin) => <PriceCard key={coin.id} coin={coin} />)
                }
              </div>

              {/* Chart */}
              <div className="card gradient-border p-6" style={{ background: 'var(--bg-card)' }}>
                <PriceChart />
              </div>
            </div>
          )}
          {page === 'search'    && <SearchPage />}
          {page === 'compare'   && <ComparePage />}
          {page === 'portfolio' && <PortfolioPage />}
        </main>

        {page === 'home' && <MyList />}
      </div>

      <div className="fixed bottom-5 left-5 z-50">
        <StatusBadge />
      </div>
    </div>
  )
}
