import { create } from 'zustand'

const useCryptoStore = create((set, get) => ({
  prices: [],
  selectedCoin: 'bitcoin',
  wsStatus: 'disconnected',

  setPrices: (prices) => {
    const history = { ...get().history }
    prices.forEach(({ id, price, timestamp }) => {
      if (!history[id]) history[id] = []
      history[id] = [...history[id], { price, timestamp }].slice(-60)
    })
    set({ prices, history })
  },

  history: {},

  setSelectedCoin: (coin) => set({ selectedCoin: coin }),
  setWsStatus: (wsStatus) => set({ wsStatus }),
}))

export default useCryptoStore
