import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { findUser, createUser, updateUser, getBadges } from '@/api/db'
import { fetchGithubUser, logout as githubLogout } from '@/login'
import { useToastStore } from './toast'

/** @typedef {import("@/types").User} User */
/** @typedef {import("@/types").Badge} Badge */

export const useSessionStore = defineStore('session', () => {
  const toast = useToastStore()
  /** @type {import('vue').Ref<User | null>} */
  const user = ref(null)
  /** @type {import('vue').Ref<Badge[]>} */
  const badges = ref([])
  const loading = ref(false)
  const error = ref(null)

  const isAuthenticated = computed(() => !!user.value)

  /**
   * Calculates the current XP multiplier based on owned badges
   */
  const activeMultiplier = computed(() => {
    if (!user.value || !user.value.badgeIds || user.value.badgeIds.length === 0 || badges.value.length === 0) return 1.0
    const ownedBadges = badges.value.filter(b => user.value.badgeIds.includes(b.id))
    if (ownedBadges.length === 0) return 1.0
    return Math.max(...ownedBadges.map(b => b.multiplier))
  })

  async function fetchAllBadges() {
    try {
      badges.value = await getBadges()
    } catch (e) {
      console.error('Failed to fetch badges', e)
    }
  }

  async function deposit(amount = 300) {
    if (!user.value) return
    const updates = { balance: user.value.balance + amount }
    await applyProgressAndSave(updates, { type: 'DEPOSIT' })
    toast.show(`Successfully deposited $${amount}!`)
  }

  async function withdraw(amount = 300) {
    if (!user.value) return
    if (user.value.balance < amount) {
      toast.show('Insufficient balance for withdrawal', 'error')
      return
    }
    const updates = { balance: user.value.balance - amount }
    await applyProgressAndSave(updates, { type: 'WITHDRAW' })
    toast.show(`Successfully withdrew $${amount}!`)
  }

  /**
   * Buys stock based on total currency value
   * @param {Object} stock 
   * @param {number} totalValue - Amount in dollars to spend
   */
  async function buyStock(stock, totalValue) {
    if (!user.value) return
    if (totalValue <= 0) throw new Error('Amount must be greater than zero')
    
    // Fractional quantity
    const quantity = totalValue / stock.price
    
    const xpGained = Math.floor(50 * activeMultiplier.value)

    const portfolio = [...(user.value.portfolio || [])]
    const existingIndex = portfolio.findIndex(p => p.stockId === stock.symbol)
    
    if (existingIndex > -1) {
      const existing = portfolio[existingIndex]
      const totalCost = (existing.buyPrice * existing.quantity) + totalValue
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
      totalValue: totalValue,
      date: new Date().toISOString()
    }

    const updates = {
      portfolio,
      history: [...(user.value.history || []), historyEntry],
      xp: user.value.xp + xpGained
    }

    await applyProgressAndSave(updates, { type: 'BUY', symbol: stock.symbol, quantity })
    toast.show(`Purchased ${quantity.toFixed(4)} units of ${stock.symbol}! +${xpGained} XP`)
  }

  async function sellStock(portfolioItem, quantity, currentPrice) {
    if (!user.value) return
    if (portfolioItem.quantity < quantity) throw new Error('Insufficient quantity')

    const revenue = currentPrice * quantity
    const multiplier = activeMultiplier.value
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
    toast.show(`Sold ${quantity.toFixed(4)} units of ${portfolioItem.stockId}. +${xpGained} XP`)
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
          if (goal.type === 'watchlist_buy' && activeUser.watchlist?.includes(event.symbol)) {
            newProgress += event.quantity
          } else if (goal.type === 'make_trades') {
            newProgress += 1
          }
        }
        
        if (goal.type === 'reach_balance' || event.type === 'DEPOSIT' || event.type === 'WITHDRAW') {
          newProgress = activeUser.balance
        }

        if (goal.type === 'diversify') {
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
        const totalGoalXp = completedGoals.reduce((sum, g) => sum + g.xp, 0)
        activeUser.xp += totalGoalXp
        activeUser.goals = activeUser.goals.filter(g => !completedGoals.includes(g))
        toast.show(`Challenge Completed! Gained ${totalGoalXp} bonus XP`, 'success')
      }
    }

    // 3. Handle Level Ups
    const getXPToLevel = (lvl) => Math.floor(1000 * Math.pow(1.1, lvl - 1))
    const getCumulativeXP = (lvl) => {
      let total = 0
      for (let i = 1; i < lvl; i++) total += getXPToLevel(i)
      return total
    }

    const oldLevel = activeUser.level
    while (activeUser.xp >= getCumulativeXP(activeUser.level + 1)) {
      activeUser.level++
    }
    
    if (activeUser.level > oldLevel) {
      toast.show(`Level Up! You are now Level ${activeUser.level}`, 'success')
    }

    // 4. Unlock Badges
    const badgeMilestones = { 5: 2, 10: 3, 15: 4, 20: 5 }
    if (!activeUser.badgeIds) activeUser.badgeIds = [1]
    
    Object.entries(badgeMilestones).forEach(([level, badgeId]) => {
      const bid = parseInt(badgeId)
      const targetLevel = parseInt(level)
      if (activeUser.level >= targetLevel && !activeUser.badgeIds.includes(bid)) {
        activeUser.badgeIds.push(bid)
        const badge = badges.value.find(b => b.id === bid)
        if (badge) {
          toast.show(`Rank Up! New Badge: ${badge.description}!`, 'success')
        }
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
      await fetchAllBadges()
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
    } else {
      await fetchAllBadges()
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
    badges,
    loading,
    error,
    isAuthenticated,
    activeMultiplier,
    login,
    logout,
    refreshUser,
    init,
    toggleWatchlist,
    buyStock,
    sellStock,
    deposit,
    withdraw
  }
})