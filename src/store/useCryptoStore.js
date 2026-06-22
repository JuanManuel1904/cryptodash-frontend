import { create } from 'zustand'

const MAX_HISTORY = 60
const LS_FAVS     = 'cryptodash_favorites'
const LS_FAV_DATA = 'cryptodash_favorites_data'

function loadFavorites() {
  try { return new Set(JSON.parse(localStorage.getItem(LS_FAVS) || '[]')) }
  catch { return new Set() }
}

function loadFavoritesData() {
  try { return JSON.parse(localStorage.getItem(LS_FAV_DATA) || '{}') }
  catch { return {} }
}

function saveFavorites(set, data) {
  localStorage.setItem(LS_FAVS,     JSON.stringify([...set]))
  localStorage.setItem(LS_FAV_DATA, JSON.stringify(data))
}

const useCryptoStore = create((set, get) => ({
  prices:        [],
  selectedCoin:  'bitcoin',
  wsStatus:      'disconnected',
  history:       {},
  favorites:     loadFavorites(),
  favoritesData: loadFavoritesData(), // { [coinId]: { id, name, symbol, image, price, change_24h } }

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
}))

export default useCryptoStore
