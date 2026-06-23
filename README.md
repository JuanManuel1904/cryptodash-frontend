# 💰 CryptoDash - Crypto Portfolio Tracker

*A sleek cryptocurrency dashboard and portfolio tracker built with React, Vite, and Tailwind CSS.*

**Deployed** https://cryptodash-frontend.vercel.app/

---

## ✨ Features

### 🏠 **Home Dashboard**
- **Live price updates** via WebSocket — prices refresh every 30 seconds.
- **5 featured cryptocurrencies** displayed as glass-morphic cards.
- **Interactive price chart** with real-time data visualization using Recharts.
- **My List panel** — Track your favorite cryptocurrencies in a dedicated sidebar.

### 🔍 **Search & Discovery**
- **Search any cryptocurrency** from CoinGecko's database (10,000+ coins).
- **Top coins ranking** sortable by Market Cap, Volume, or Price.
- **Detailed coin stats** — Price, Market Cap, Volume 24h, Changes (1h/24h/7d), ATH/ATL.
- **One-click follow** to add coins to your watchlist.

### 📊 **Crypto Comparison**
- **Side-by-side comparison** of any two cryptocurrencies.
- **Normalized performance chart** — % change from period start (fair comparison).
- **Dynamic stats table** — Winner indicator shows which coin performs better.
- **Time range selector** — 24h, 7d, 1M, 3M, 1Y perspectives.

### 💼 **Portfolio Tracker**
- **Track holdings** — Record cryptocurrency quantity and buy price.
- **Smart input modes** — Input by quantity OR USD amount (auto-calculates).
- **Real-time P&L** — Gain/loss automatically calculated as prices update.
- **Allocation pie chart** — Visualize portfolio distribution.
- **Edit & delete holdings** — Manage positions with ease.

### 🎨 **Premium UI/UX**
- **Glassmorphism design** with CSS custom variables.
- **Dark theme** optimized for crypto trading vibes.
- **Smooth animations** on price changes (flash + glow effects).
- **Responsive layout** — Works perfectly on mobile, tablet, desktop.

---

## 🛠️ Technologies

- **React 18** (Hooks, Zustand for state)
- **Vite** (Lightning-fast build)
- **Tailwind CSS** (Utility-first styling)
- **Recharts** (Charts & visualization)
- **WebSocket** (Real-time price updates)
- **CoinGecko API** (Cryptocurrency data)

---

## 🚀 Core Functionality

### Real-Time Updates
- WebSocket connection for instant price broadcasts
- Fallback to REST API if WebSocket is unavailable
- Automatic reconnection with status indicator

### Smart Data Fetching
- Three-level data fallback: Live prices → Cached data → API
- Intelligent caching to respect API rate limits
- Background prefetch of coin details and historical data

### Persistent Storage
- **localStorage** for favorites, holdings, and portfolio state
- Automatic sync across browser tabs
- Data persists between sessions

---

## 🔮 Future Improvements

- `Price alerts` when coins reach target prices
- `Trading journal` to log buy/sell decisions
- `Advanced charting` with technical indicators (RSI, MACD, Moving Averages)
- `Portfolio backtest` — See historical performance
- `Export CSV` — Download portfolio and transaction history
- `Mobile app` version (React Native)
- `Dark/Light mode toggle`
- `Multi-currency support` (EUR, GBP, JPY, etc.)

---

## 📦 Deployment

Deployed on **Vercel** with:
- Automatic deployments from `develop` branch
- Environment variable support for API URLs
- CORS configured for Railway backend
