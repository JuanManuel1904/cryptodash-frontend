import { create } from 'zustand'

const MAX_HISTORY = 60
const LS_FAVS     = 'cryptodash_favorites'
const LS_FAV_DATA = 'cryptodash_favorites_data'
const LS_HOLDINGS = 'cryptodash_holdings'

function loadFavorites() {
  try { return new Set(JSON.parse(localStorage.getItem(LS_FAVS) || '[]')) }
  catch { return new Set() }
}

function loadFavoritesData() {
  try { return JSON.parse(localStorage.getItem(LS_FAV_DATA) || '{}') }
  catch { return {} }
}

function loadHoldings() {
  try { return JSON.parse(localStorage.getItem(LS_HOLDINGS) || '{}') }
  catch { return {} }
}

function saveFavorites(set, data) {
  localStorage.setItem(LS_FAVS,     JSON.stringify([...set]))
  localStorage.setItem(LS_FAV_DATA, JSON.stringify(data))
}

function saveHoldings(holdings) {
  localStorage.setItem(LS_HOLDINGS, JSON.stringify(holdings))
}

const useCryptoStore = create((set, get) => ({
  prices:        [],
  selectedCoin:  'bitcoin',
  wsStatus:      'disconnected',
  history:       {},
  favorites:     loadFavorites(),
  favoritesData: loadFavoritesData(), // { [coinId]: { id, name, symbol, image, price, change_24h } }
  holdings:      loadHoldings(),      // { [coinId]: { amount, buyPrice } }

  setPrices: (prices) => {
    const history = { ...get().history }
    const now = new Date().toISOString()
    prices.forEach(({ id, price, timestamp }) => {
      const prev = history[id] ?? []
      const last = prev[prev.length - 1]
      const ts   = timestamp ?? now
      if (last && last.timestamp === ts) return
      history[id] = [...prev, { price, timestamp: ts }].slice(-MAX_HISTORY)
    })
    // Sync live prices into favoritesData so My List stays up to date
    const favoritesData = { ...get().favoritesData }
    prices.forEach((coin) => {
      if (get().favorites.has(coin.id)) {
        favoritesData[coin.id] = { ...favoritesData[coin.id], ...coin }
      }
    })
    set({ prices, history, favoritesData })
  },

  setHistory: (coinId, points) => {
    const history = { ...get().history }
    history[coinId] = points.slice(-MAX_HISTORY)
    set({ history })
  },

  // coinData: optional { id, name, symbol, image, price, change_24h, ... }
  toggleFavorite: (coinId, coinData) => {
    const favorites     = new Set(get().favorites)
    const favoritesData = { ...get().favoritesData }

    if (favorites.has(coinId)) {
      favorites.delete(coinId)
      delete favoritesData[coinId]
    } else {
      favorites.add(coinId)
      if (coinData) favoritesData[coinId] = coinData
      // Also check live prices
      else {
        const live = get().prices.find((p) => p.id === coinId)
        if (live) favoritesData[coinId] = live
      }
    }

    saveFavorites(favorites, favoritesData)
    set({ favorites, favoritesData })
  },

  setSelectedCoin: (coin) => set({ selectedCoin: coin }),
  setWsStatus:     (wsStatus) => set({ wsStatus }),

  // Holdings management
  addHolding: (coinId, amount, buyPrice) => {
    const holdings = { ...get().holdings }
    holdings[coinId] = { amount: parseFloat(amount) || 0, buyPrice: parseFloat(buyPrice) || 0 }
    saveHoldings(holdings)
    set({ holdings })
  },

  updateHolding: (coinId, amount, buyPrice) => {
    const holdings = { ...get().holdings }
    if (holdings[coinId]) {
      holdings[coinId] = { amount: parseFloat(amount) || 0, buyPrice: parseFloat(buyPrice) || 0 }
      saveHoldings(holdings)
      set({ holdings })
    }
  },

  removeHolding: (coinId) => {
    const holdings = { ...get().holdings }
    delete holdings[coinId]
    saveHoldings(holdings)
    set({ holdings })
  },
}))

export default useCryptoStore
