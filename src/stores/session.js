import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { findUser, createUser, updateUser, getBadges } from '@/api/db'
import { fetchGithubUser, logout as githubLogout } from '@/login'
import { useToastStore } from './toast'

/** @typedef {import("@/types").User} User */

export const useSessionStore = defineStore('session', () => {
  const toast = useToastStore()
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
    
    // Purchases are now free as per user request
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
      // balance remains same
      portfolio,
      history: [...(user.value.history || []), historyEntry],
      xp: user.value.xp + xpGained
    }

    await applyProgressAndSave(updates, { type: 'BUY', symbol: stock.symbol, quantity })
    toast.show(`Successfully purchased ${quantity} units of ${stock.symbol}!`)
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

    await applyProgressAndSave(updates, { type: 'SELL', pnl })
    toast.show(`Successfully sold ${quantity} units of ${portfolioItem.stockId} for $${revenue.toFixed(2)}`)
  }

  /**
   * Internal engine to handle level-ups, goal progress, and badge unlocks
   */
  async function applyProgressAndSave(updates, event) {
    const activeUser = { ...user.value, ...updates }
    
    // 1. Update Goal Progress
    if (activeUser.goals) {
      activeUser.goals = activeUser.goals.map(goal => {
        let newProgress = goal.progress

        if (event.type === 'BUY') {
          if (goal.description.toLowerCase().includes('watchlist') && activeUser.watchlist?.includes(event.symbol)) {
            newProgress += event.quantity
          } else if (goal.description.toLowerCase().includes('transactions') || goal.description.toLowerCase().includes('trade')) {
            newProgress += 1
          }
        }
        
        if (goal.description.toLowerCase().includes('balance')) {
          newProgress = activeUser.balance
        }

        if (goal.description.toLowerCase().includes('different stocks') || goal.description.toLowerCase().includes('diversify')) {
          newProgress = activeUser.portfolio.length
        }

        return { ...goal, progress: newProgress }
      })

      // 2. Check for completed goals
      const completedGoals = activeUser.goals.filter(g => {
        const targetNumber = g.description.match(/\d+/);
        const target = targetNumber ? parseInt(targetNumber[0]) : 0;
        return g.progress >= target
      })

      if (completedGoals.length > 0) {
        activeUser.xp += completedGoals.reduce((sum, g) => sum + g.xp, 0)
        activeUser.goals = activeUser.goals.filter(g => !completedGoals.includes(g))
      }
    }

    // 3. Handle Level Ups
    const getXPToLevel = (lvl) => Math.floor(1000 * Math.pow(1.1, lvl - 1))
    const getCumulativeXP = (lvl) => {
      let total = 0
      for (let i = 1; i < lvl; i++) total += getXPToLevel(i)
      return total
    }

    while (activeUser.xp >= getCumulativeXP(activeUser.level + 1)) {
      activeUser.level++
    }

    // 4. Unlock Badges
    const badgeMilestones = { 5: 2, 10: 3, 20: 4, 35: 5 }
    if (!activeUser.badgeIds) activeUser.badgeIds = [1]
    
    Object.entries(badgeMilestones).forEach(([level, badgeId]) => {
      const bid = parseInt(badgeId)
      if (activeUser.level >= parseInt(level) && !activeUser.badgeIds.includes(bid)) {
        activeUser.badgeIds.push(bid)
      }
    });

    await updateUser(user.value.id, activeUser)
    await refreshUser()
  }

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
      if (!user.value.badgeIds || user.value.badgeIds.length === 0) {
        await updateUser(user.value.id, { badgeIds: [1] })
        await refreshUser()
      }
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

  async function init() {
    const token = localStorage.getItem('accessToken')
    if (token) {
      try {
        await login(token)
      } catch (e) {
        logout()
      }
    }
  }

  async function refreshUser() {
    if (!user.value) return
    try {
      const updatedUser = await findUser(user.value.id)
      if (updatedUser) user.value = updatedUser
    } catch (e) {
      console.error('Failed to refresh user:', e)
    }
  }

  async function toggleWatchlist(stockId) {
    if (!user.value) return
    const currentWatchlist = [...(user.value.watchlist || [])]
    const index = currentWatchlist.indexOf(stockId)
    if (index === -1) currentWatchlist.push(stockId)
    else currentWatchlist.splice(index, 1)
    user.value.watchlist = currentWatchlist
    try {
      await updateUser(user.value.id, { watchlist: currentWatchlist })
    } catch (e) {
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
    toggleWatchlist,
    buyStock,
    sellStock
  }
})