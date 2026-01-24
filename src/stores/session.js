import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { findUser, createUser, updateUser, getBadges } from '@/api/db'
import { fetchGithubUser, logout as githubLogout } from '@/login'

/** @typedef {import("@/types").User} User */

export const useSessionStore = defineStore('session', () => {
  /** @type {import('vue').Ref<User | null>} */
  const user = ref(null)
  const loading = ref(false)
  const error = ref(null)

  const isAuthenticated = computed(() => !!user.value)

  /**
   * Calculates the current XP multiplier based on owned badges
   */
  async function getActiveMultiplier() {
    try {
      const allBadges = await getBadges()
      if (!user.value || !user.value.badgeIds || user.value.badgeIds.length === 0) return 1.0
      const ownedBadges = allBadges.filter(b => user.value.badgeIds.includes(b.id))
      if (ownedBadges.length === 0) return 1.0
      return Math.max(...ownedBadges.map(b => b.multiplier))
    } catch (e) {
      return 1.0
    }
  }

  async function buyStock(stock, quantity) {
    if (!user.value) return
    const cost = stock.price * quantity
    if (user.value.balance < cost) throw new Error('Insufficient balance')

    const multiplier = await getActiveMultiplier()
    const xpGained = Math.floor(50 * multiplier)

    const portfolio = [...(user.value.portfolio || [])]
    const existingIndex = portfolio.findIndex(p => p.stockId === stock.symbol)
    
    if (existingIndex > -1) {
      const existing = portfolio[existingIndex]
      const totalCost = (existing.buyPrice * existing.quantity) + cost
      portfolio[existingIndex] = {
        ...existing,
        quantity: existing.quantity + quantity,
        buyPrice: totalCost / (existing.quantity + quantity)
      }
    } else {
      portfolio.push({
        id: Date.now(),
        stockId: stock.symbol,
        name: stock.description,
        quantity,
        buyPrice: stock.price,
        buyDate: new Date().toISOString()
      })
    }

    const historyEntry = {
      id: Date.now(),
      type: 'BUY',
      stockId: stock.symbol,
      name: stock.description,
      quantity,
      price: stock.price,
      totalValue: cost,
      date: new Date().toISOString()
    }

    const updates = {
      balance: user.value.balance - cost,
      portfolio,
      history: [...(user.value.history || []), historyEntry],
      xp: user.value.xp + xpGained
    }

    // Auto level up logic (10% growth)
    let tempXp = updates.xp
    let tempLevel = user.value.level
    
    const getXPToLevel = (lvl) => Math.floor(1000 * Math.pow(1.1, lvl - 1))
    
    // This is a simplified cumulative XP check
    const getCumulativeXP = (lvl) => {
      let total = 0
      for (let i = 1; i < lvl; i++) total += getXPToLevel(i)
      return total
    }

    while (tempXp >= getCumulativeXP(tempLevel + 1)) {
      tempLevel++
    }
    updates.level = tempLevel

    await updateUser(user.value.id, updates)
    await refreshUser()
  }

  async function sellStock(portfolioItem, quantity, currentPrice) {
    if (!user.value) return
    if (portfolioItem.quantity < quantity) throw new Error('Insufficient quantity')

    const revenue = currentPrice * quantity
    const multiplier = await getActiveMultiplier()
    const xpGained = Math.floor(40 * multiplier)

    const portfolio = [...(user.value.portfolio || [])]
    const itemIndex = portfolio.findIndex(p => p.id === portfolioItem.id)
    
    if (portfolio[itemIndex].quantity === quantity) {
      portfolio.splice(itemIndex, 1)
    } else {
      portfolio[itemIndex].quantity -= quantity
    }

    const pnl = (currentPrice - portfolioItem.buyPrice) * quantity

    const historyEntry = {
      id: Date.now(),
      type: 'SELL',
      stockId: portfolioItem.stockId,
      name: portfolioItem.name,
      quantity,
      price: currentPrice,
      totalValue: revenue,
      pnl,
      date: new Date().toISOString()
    }

    const updates = {
      balance: user.value.balance + revenue,
      portfolio,
      history: [...(user.value.history || []), historyEntry],
      xp: user.value.xp + xpGained
    }

    await updateUser(user.value.id, updates)
    await refreshUser()
  }

  /**
   * Initializes the session by fetching the user data from DB using the GitHub token
   * @param {string} token 
   */
  async function login(token) {
    loading.value = true
    error.value = null
    try {
      const githubProfile = await fetchGithubUser(token)
      const userId = String(githubProfile.id)
      
      let dbUser = await findUser(userId)
      
      if (!dbUser) {
        dbUser = await createUser({
          id: userId,
          name: githubProfile.name || githubProfile.login,
          avatarUrl: githubProfile.avatar_url
        })
      }
      
      user.value = dbUser
      return dbUser
    } catch (e) {
      error.value = e.message
      throw e
    } finally {
      loading.value = false
    }
  }

  function logout() {
    user.value = null
    githubLogout()
  }

  /**
   * Attempt to restore session from local storage token
   */
  async function init() {
    const token = localStorage.getItem('accessToken')
    if (token) {
      try {
        await login(token)
      } catch (e) {
        console.error("Failed to restore session:", e)
        logout()
      }
    }
  }

  /**
   * Refresh user data from database
   */
  async function refreshUser() {
    if (!user.value) return
    try {
      const updatedUser = await findUser(user.value.id)
      if (updatedUser) {
        user.value = updatedUser
      }
    } catch (e) {
      console.error('Failed to refresh user:', e)
    }
  }

  /**
   * Toggles a stock in the user's watchlist
   * @param {string} stockId 
   */
  async function toggleWatchlist(stockId) {
    if (!user.value) return

    // Create a copy of the current watchlist
    const currentWatchlist = [...(user.value.watchlist || [])]
    const index = currentWatchlist.indexOf(stockId)

    if (index === -1) {
      // Add
      currentWatchlist.push(stockId)
    } else {
      // Remove
      currentWatchlist.splice(index, 1)
    }

    // Optimistic update
    user.value.watchlist = currentWatchlist

    try {
      await updateUser(user.value.id, { watchlist: currentWatchlist })
    } catch (e) {
      console.error('Failed to update watchlist:', e)
      // Revert on error could be implemented here
      await refreshUser() 
    }
  }

  return {
    user,
    loading,
    error,
    isAuthenticated,
    login,
    logout,
    refreshUser,
    init,
    toggleWatchlist
  }
})
