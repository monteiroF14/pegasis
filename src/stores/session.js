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

  const getXPForLevel = (lvl) => {
    const level = Number(lvl)
    if (level <= 1) return 0
    let total = 0
    for (let i = 1; i < level; i++) {
      total += Math.floor(1000 * Math.pow(1.1, i - 1))
    }
    return total
  }

  const xpRequiredForCurrentLevel = computed(() => getXPForLevel(user.value?.level || 1))
  const xpRequiredForNextLevel = computed(() => getXPForLevel(Number(user.value?.level || 1) + 1))
  const xpInCurrentLevel = computed(() => Math.max(0, Number(user.value?.xp || 0) - xpRequiredForCurrentLevel.value))
  const xpNeededForNextLevel = computed(() => Math.max(1, xpRequiredForNextLevel.value - xpRequiredForCurrentLevel.value))
  const xpProgress = computed(() => Math.min(100, (xpInCurrentLevel.value / xpNeededForNextLevel.value) * 100))

  const ownedBadges = computed(() => {
    if (!user.value || !user.value.badgeIds || !badges.value.length) return []
    return badges.value.filter(b => user.value.badgeIds.some(id => Number(id) === Number(b.id)))
  })

  const currentBadge = computed(() => {
    if (!user.value || !user.value.badgeIds?.length) return { id: 0, description: 'Novice Investor' }
    const latestId = user.value.badgeIds[user.value.badgeIds.length - 1]
    return badges.value.find(b => Number(b.id) === Number(latestId)) || { id: latestId, description: 'Pro Trader' }
  })

  const activeMultiplier = computed(() => {
    if (!user.value?.badgeIds?.length) return 1.0
    return 1.0 + (user.value.badgeIds.length - 1) * 0.05
  })

  async function fetchAllBadges() {
    try {
      const data = await getBadges()
      badges.value = Array.isArray(data) ? data : []
    } catch (e) {
      console.error('Badge fetch error', e)
    }
  }

  async function deposit(amount = 300) {
    if (!user.value) return
    await applyProgressAndSave({ balance: Number(user.value.balance || 0) + amount }, { type: 'DEPOSIT', amount })
    toast.show(`Successfully deposited $${amount}!`)
  }

  async function withdraw(amount = 300) {
    if (!user.value || user.value.balance < amount) return toast.show('Insufficient funds', 'error')
    await applyProgressAndSave({ balance: user.value.balance - amount }, { type: 'WITHDRAW', amount })
    toast.show(`Successfully withdrew $${amount}!`)
  }

  async function buyStock(stock, totalValue) {
    if (!user.value) return
    const quantity = totalValue / stock.price
    const xpGained = Math.floor(50 * activeMultiplier.value)
    const portfolio = [...(user.value.portfolio || [])]
    const idx = portfolio.findIndex(p => p.stockId === stock.symbol)
    
    if (idx > -1) {
      const existing = portfolio[idx]
      const newQty = existing.quantity + quantity
      portfolio[idx] = { ...existing, quantity: newQty, buyPrice: ((existing.buyPrice * existing.quantity) + totalValue) / newQty }
    } else {
      portfolio.push({ id: Date.now(), stockId: stock.symbol, name: stock.description, quantity, buyPrice: stock.price, buyDate: new Date().toISOString() })
    }

    const updates = {
      portfolio,
      history: [...(user.value.history || []), { id: Date.now(), type: 'BUY', stockId: stock.symbol, name: stock.description, quantity, price: stock.price, totalValue, date: new Date().toISOString() }],
      xp: Number(user.value.xp || 0) + xpGained
    }
    await applyProgressAndSave(updates, { type: 'BUY', symbol: stock.symbol, amount: totalValue })
    toast.show(`Purchased ${quantity.toFixed(4)} shares of ${stock.symbol}!`)
  }

  async function sellStock(item, quantity, currentPrice) {
    if (!user.value || item.quantity < quantity) return
    const revenue = currentPrice * quantity
    const xpGained = Math.floor(40 * activeMultiplier.value)
    const portfolio = user.value.portfolio.map(p => p.id === item.id ? { ...p, quantity: p.quantity - quantity } : p).filter(p => p.quantity > 0.0001)

    const updates = {
      balance: Number(user.value.balance || 0) + revenue,
      portfolio,
      history: [...(user.value.history || []), { id: Date.now(), type: 'SELL', stockId: item.stockId, name: item.name, quantity, price: currentPrice, totalValue: revenue, pnl: (currentPrice - item.buyPrice) * quantity, date: new Date().toISOString() }],
      xp: Number(user.value.xp || 0) + xpGained
    }
    await applyProgressAndSave(updates, { type: 'SELL', amount: revenue })
    toast.show(`Sold ${quantity.toFixed(4)} shares of ${item.stockId}!`)
  }

  async function applyProgressAndSave(updates, event) {
    const activeUser = { ...user.value, ...updates }
    if (activeUser.goals) {
      activeUser.goals = activeUser.goals.map(goal => {
        let prog = goal.progress
        if (event?.type === 'BUY' || event?.type === 'SELL') { if (goal.type === 'make_trades') prog += 1 }
        if (event?.type === 'BUY' && goal.type === 'total_invested') prog += (event.amount || 0)
        if (goal.type === 'reach_balance') prog = Math.max(prog, activeUser.balance)
        if (goal.type === 'diversify') prog = activeUser.portfolio.length
        return { ...goal, progress: prog }
      })
      const completed = activeUser.goals.filter(g => {
        const target = parseInt(g.description.match(/\d+/)?.[0] || '0')
        return g.progress >= target
      })
      if (completed.length > 0) {
        activeUser.xp += completed.reduce((sum, g) => sum + g.xp, 0)
        activeUser.goals = activeUser.goals.filter(g => !completed.includes(g))
        toast.show(`Goal Completed!`, 'success')
      }
    }

    const oldLevel = Number(activeUser.level || 1)
    if (!activeUser.level) activeUser.level = 1
    while (activeUser.xp >= getXPForLevel(activeUser.level + 1)) activeUser.level++
    if (activeUser.level > oldLevel) toast.show(`Level Up to ${activeUser.level}!`, 'success')

    const milestones = { 5: 2, 10: 3, 15: 4, 20: 5 }
    Object.entries(milestones).forEach(([lvl, bid]) => {
      if (activeUser.level >= Number(lvl) && !activeUser.badgeIds.some(id => Number(id) === Number(bid))) {
        activeUser.badgeIds.push(Number(bid))
        const b = badges.value.find(x => Number(x.id) === Number(bid))
        if (b) toast.show(`Rank Up: ${b.description}!`)
      }
    })

    await updateUser(user.value.id, activeUser)
    user.value = activeUser
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
    user, badges, loading, error, isAuthenticated, activeMultiplier, currentBadge, ownedBadges,
    xpProgress, xpInCurrentLevel, xpNeededForNextLevel,
    login, logout, refreshUser, init, toggleWatchlist, buyStock, sellStock, deposit, withdraw, fetchAllBadges
  }
})
