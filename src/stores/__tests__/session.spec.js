import { beforeEach, describe, it, expect, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useSessionStore } from '../session'
import * as db from '@/api/db'

// Mock everything external
vi.mock('@/api/db', () => ({
  findUser: vi.fn(),
  createUser: vi.fn(),
  updateUser: vi.fn(() => Promise.resolve({})),
  getBadges: vi.fn(() => Promise.resolve([])),
}))

vi.mock('@/login', () => ({
  fetchGithubUser: vi.fn(),
  logout: vi.fn(),
}))

vi.mock('../toast', () => ({
  useToastStore: vi.fn(() => ({
    show: vi.fn()
  }))
}))

// Mock global fetch to be safe
global.fetch = vi.fn(() => Promise.resolve({
  ok: true,
  json: () => Promise.resolve({})
}))

describe('Session Store - Full Suite', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  // 1. XP Calculations
  it('calculates XP required for next level correctly', () => {
    const store = useSessionStore()
    store.user = { id: '1', level: 1, xp: 0 }
    expect(store.xpNeededForNextLevel).toBe(1000)
    store.user = { id: '1', level: 2, xp: 1000 }
    expect(store.xpNeededForNextLevel).toBe(1100)
  })

  // 2. Multiplier Logic
  it('calculates active multiplier based on badge count', () => {
    const store = useSessionStore()
    store.user = { id: '1', badgeIds: [1] }
    expect(store.activeMultiplier).toBe(1.0)
    store.user = { id: '1', badgeIds: [1, 2, 3] }
    expect(store.activeMultiplier).toBe(1.10)
  })

  // 3. Balance Management
  it('handles deposits and withdrawals', async () => {
    const store = useSessionStore()
    store.user = { id: '1', balance: 500, goals: [], level: 1, xp: 0, badgeIds: [1] }
    await store.deposit(100)
    expect(store.user.balance).toBe(600)
    await store.withdraw(200)
    expect(store.user.balance).toBe(400)
  })

  // 4. Fractional Purchases
  it('handles fractional share purchases by currency amount', async () => {
    const store = useSessionStore()
    store.user = { id: '1', balance: 1000, portfolio: [], history: [], xp: 0, badgeIds: [1] }
    const stock = { symbol: 'AAPL', price: 200 }
    
    await store.buyStock(stock, 100) // Spend $100 @ $200
    expect(store.user.portfolio[0].quantity).toBe(0.5)
  })

  // 5. Goal Progression
  it('updates goal progress correctly', async () => {
    const store = useSessionStore()
    store.user = { 
      id: '1', level: 1, xp: 0, badgeIds: [1], balance: 0, portfolio: [],
      goals: [{ type: 'make_trades', description: 'Do 1 trades', progress: 0, xp: 100 }]
    }
    
    await store.deposit(100) // Deposit should update balance-related goals
    // Trigger a trade
    await store.buyStock({ symbol: 'AAPL', price: 10 }, 10)
    
    // Trade goal should be completed (removed from list)
    expect(store.user.goals).toHaveLength(0)
    expect(store.user.xp).toBeGreaterThan(100)
  })

  // 6. Badge Unlocking
  it('unlocks badges at milestones', async () => {
    const store = useSessionStore()
    store.badges = [{ id: 1, multiplier: 1 }, { id: 2, multiplier: 1.05 }]
    store.user = { id: '1', level: 4, xp: 4700, badgeIds: [1] } // Enough for level 5
    
    await store.deposit(100) // Triggers progress check
    expect(store.user.level).toBeGreaterThanOrEqual(5)
    expect(store.user.badgeIds).toContain(2)
  })
})
