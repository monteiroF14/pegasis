import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { findUser, createUser, updateUser, getBadges } from '@/api/db'
import { fetchGithubUser, logout as githubLogout } from '@/login'
import { useToastStore } from './toast'

/** @typedef {import("@/types").User} User */
/** @typedef {import("@/types").Badge} Badge */

export const useSessionStore = defineStore('session', () => {
  const toast = useToastStore()
  const user = ref(null)
  const badges = ref([])
  const loading = ref(false)
  const error = ref(null)

  const isAuthenticated = computed(() => !!user.value)

  /**
   * The multiplier is 1.0 for the first badge, and adds 0.05 for each additional badge.
   * Logic: 1.0 + (number_of_badges - 1) * 0.05
   */
  const activeMultiplier = computed(() => {
    if (!user.value || !user.value.badgeIds || user.value.badgeIds.length === 0) return 1.0
    return 1.0 + (user.value.badgeIds.length - 1) * 0.05
  })

  /**
   * The current badge is the LATEST one added to the user's badgeIds array
   */
  const currentBadge = computed(() => {
    if (!user.value || !user.value.badgeIds || user.value.badgeIds.length === 0 || badges.value.length === 0) {
      return { id: 0, description: 'Novice Investor' }
    }
    
    // Get the ID of the last element in the badgeIds array
    const latestBadgeId = user.value.badgeIds[user.value.badgeIds.length - 1]
    
    // Find that badge in the global metadata list
    const badgeMatch = badges.value.find(b => Number(b.id) === Number(latestBadgeId))
    
    return badgeMatch || { id: latestBadgeId, description: 'New Rank' }
  })

  async function fetchAllBadges() {
    try {
      const data = await getBadges()
      badges.value = Array.isArray(data) ? data : []
    } catch (e) {
      console.error('Failed to fetch badges', e)
    }
  }

  async function deposit(amount = 300) {
    if (!user.value) return
    const updates = { balance: (user.value.balance || 0) + amount }
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

  async function buyStock(stock, totalValue) {
    if (!user.value) return
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

    const updates = {
      portfolio,
      history: [...(user.value.history || []), {
        id: Date.now(), type: 'BUY', stockId: stock.symbol, name: stock.description,
        quantity, price: stock.price, totalValue, date: new Date().toISOString()
      }],
      xp: (user.value.xp || 0) + xpGained
    }

    await applyProgressAndSave(updates, { type: 'BUY', symbol: stock.symbol, quantity })
    toast.show(`Purchased ${quantity.toFixed(4)} units of ${stock.symbol}! +${xpGained} XP`)
  }

  async function sellStock(portfolioItem, quantity, currentPrice) {
    if (!user.value) return
    const revenue = currentPrice * quantity
    const xpGained = Math.floor(40 * activeMultiplier.value)

    const portfolio = [...(user.value.portfolio || [])]
    const itemIndex = portfolio.findIndex(p => p.id === portfolioItem.id)
    
    if (portfolio[itemIndex].quantity === quantity) portfolio.splice(itemIndex, 1)
    else portfolio[itemIndex].quantity -= quantity

    const updates = {
      balance: (user.value.balance || 0) + revenue,
      portfolio,
      history: [...(user.value.history || []), {
        id: Date.now(), type: 'SELL', stockId: portfolioItem.stockId, name: portfolioItem.name,
        quantity, price: currentPrice, totalValue: revenue, pnl: (currentPrice - portfolioItem.buyPrice) * quantity,
        date: new Date().toISOString()
      }],
      xp: (user.value.xp || 0) + xpGained
    }

    await applyProgressAndSave(updates, { type: 'SELL' })
    toast.show(`Sold ${quantity.toFixed(4)} units of ${portfolioItem.stockId}. +${xpGained} XP`)
  }

  async function applyProgressAndSave(updates, event) {
    const activeUser = { ...user.value, ...updates }
    
    // Goals Logic
    if (activeUser.goals) {
      activeUser.goals = activeUser.goals.map(goal => {
        let newProgress = goal.progress
        if (event?.type === 'BUY') {
          if (goal.type === 'watchlist_buy' && activeUser.watchlist?.includes(event.symbol)) newProgress += event.quantity
          else if (goal.type === 'make_trades') newProgress += 1
        }
        if (goal.type === 'reach_balance') newProgress = activeUser.balance
        if (goal.type === 'diversify') newProgress = activeUser.portfolio.length
        return { ...goal, progress: newProgress }
      })

      const completed = activeUser.goals.filter(g => {
        const target = parseInt(g.description.match(/\d+/)?.[0] || '0')
        return g.progress >= target
      })

      if (completed.length > 0) {
        const bonus = completed.reduce((sum, g) => sum + g.xp, 0)
        activeUser.xp += bonus
        activeUser.goals = activeUser.goals.filter(g => !completed.includes(g))
        toast.show(`Challenge Completed! +${bonus} XP`)
      }
    }

    // Level Logic
    const getXPForLevel = (lvl) => lvl <= 1 ? 0 : Array.from({length: lvl-1}, (_, i) => Math.floor(1000 * Math.pow(1.1, i))).reduce((a,b)=>a+b, 0)
    const oldLevel = activeUser.level
    while (activeUser.xp >= getXPForLevel(activeUser.level + 1)) activeUser.level++
    if (activeUser.level > oldLevel) toast.show(`Level Up! You are now Level ${activeUser.level}`)

    // Badge Milestones Logic
    const badgeMilestones = { 5: 2, 10: 3, 15: 4, 20: 5 }
    if (!activeUser.badgeIds) activeUser.badgeIds = [1]
    Object.entries(badgeMilestones).forEach(([lvl, bid]) => {
      const milestoneLevel = Number(lvl)
      const badgeId = Number(bid)
      if (activeUser.level >= milestoneLevel && !activeUser.badgeIds.some(id => Number(id) === badgeId)) {
        activeUser.badgeIds.push(badgeId)
        const b = badges.value.find(x => Number(x.id) === badgeId)
        if (b) toast.show(`Rank Up: ${b.description}!`)
      }
    })

    await updateUser(user.value.id, activeUser)
    await refreshUser()
  }

  async function login(token) {
    loading.value = true
    try {
      const profile = await fetchGithubUser(token)
      const dbUser = await findUser(String(profile.id)) || await createUser({ id: profile.id, name: profile.name || profile.login, avatarUrl: profile.avatar_url })
      user.value = dbUser
      await fetchAllBadges()
      if (!user.value.badgeIds?.length) await applyProgressAndSave({ badgeIds: [1] })
      return dbUser
    } catch (e) { error.value = e.message; throw e }
    finally { loading.value = false }
  }

  async function init() {
    const token = localStorage.getItem('accessToken')
    await fetchAllBadges()
    if (token) { try { await login(token) } catch (e) { logout() } }
  }

  function logout() { user.value = null; githubLogout() }

  async function refreshUser() {
    if (user.value) {
      const u = await findUser(user.value.id)
      if (u) user.value = u
    }
  }

  async function toggleWatchlist(id) {
    if (!user.value) return
    const list = user.value.watchlist?.includes(id) ? user.value.watchlist.filter(x => x !== id) : [...(user.value.watchlist || []), id]
    await updateUser(user.value.id, { watchlist: list })
    await refreshUser()
  }

  return {
    user, badges, loading, error, isAuthenticated, activeMultiplier, currentBadge,
    login, logout, refreshUser, init, toggleWatchlist, buyStock, sellStock, deposit, withdraw, fetchAllBadges
  }
})