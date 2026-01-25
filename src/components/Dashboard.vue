<script setup>
import { ref, computed, onMounted } from 'vue'
import { useSessionStore } from '../stores/session'
import { getBadges, updateUser } from '../api/db'
import { LayoutDashboard } from 'lucide-vue-next'

const sessionStore = useSessionStore()
const badges = ref([])
const user = computed(() => sessionStore.user)

// ---- GOAL CREATION ----
const goalAction = ref('watchlist_buy')
const goalTarget = ref(5)
const errorMessage = ref('')

const goalTemplates = {
  watchlist_buy: { label: 'Buy stocks from watchlist', unit: 'stocks', baseXP: 150 },
  reach_balance: { label: 'Reach a balance of', unit: '', baseXP: 1 },
  make_trades: { label: 'Perform transactions', unit: 'trades', baseXP: 100 },
  diversify: { label: 'Own different stocks', unit: 'companies', baseXP: 300 }
}

const calculatedXP = computed(() => {
  const template = goalTemplates[goalAction.value]
  if (goalAction.value === 'reach_balance') {
    const diff = goalTarget.value - (user.value?.balance || 0)
    return diff > 0 ? Math.floor(diff / 2) : 0
  }
  return goalTarget.value * template.baseXP
})

const createGoal = async () => {
  if (!user.value) return
  errorMessage.value = ''
  
  // Validation
  if (goalAction.value === 'reach_balance' && goalTarget.value <= user.value.balance) {
    errorMessage.value = `Target balance must be higher than your current balance ($${user.value.balance.toFixed(2)})`
    return
  }

  if (goalAction.value === 'diversify' && goalTarget.value <= user.value.portfolio.length) {
    errorMessage.value = `You already own ${user.value.portfolio.length} different stocks. Set a higher target!`
    return
  }

  if (goalTarget.value <= 0) {
    errorMessage.value = "Target must be greater than zero."
    return
  }

  const template = goalTemplates[goalAction.value]
  const newGoal = {
    type: goalAction.value,
    description: `${template.label} ${goalTarget.value} ${template.unit}`,
    xp: calculatedXP.value,
    progress: goalAction.value === 'reach_balance' ? user.value.balance : 
              (goalAction.value === 'diversify' ? user.value.portfolio.length : 0)
  }
  
  const updatedGoals = [...(user.value.goals || []), newGoal]
  
  try {
    await updateUser(user.value.id, { goals: updatedGoals })
    await sessionStore.refreshUser()
    goalTarget.value = 5 // reset
  } catch (e) {
    console.error('Failed to create goal', e)
    errorMessage.value = "Failed to save goal. Please try again."
  }
}

onMounted(async () => {
  try {
    // Ensure we have fresh user data (and goals) from DB
    await sessionStore.refreshUser()
    badges.value = await getBadges()
  } catch (e) {
    console.error('Failed to fetch dashboard data', e)
  }
})

const currentBadge = computed(() => {
  if (!user.value || !user.value.badgeIds || user.value.badgeIds.length === 0) return null
  const ownedBadges = badges.value.filter(b => user.value.badgeIds.includes(b.id))
  if (ownedBadges.length === 0) return null
  return ownedBadges.sort((a, b) => b.multiplier - a.multiplier)[0]
})

const activeMultiplier = computed(() => {
  return currentBadge.value ? currentBadge.value.multiplier : 1.0
})

/**
 * Calculates the total XP required to reach a specific level
 * Formula: 1000 * (1.1 ^ (level - 1))
 */
const getXPForLevel = (level) => {
  if (level <= 1) return 0
  // Cumulative XP needed to reach 'level'
  let total = 0
  for (let i = 1; i < level; i++) {
    total += Math.floor(1000 * Math.pow(1.1, i - 1))
  }
  return total
}

const xpRequiredForCurrentLevel = computed(() => getXPForLevel(user.value?.level || 1))
const xpRequiredForNextLevel = computed(() => getXPForLevel((user.value?.level || 1) + 1))

const xpInCurrentLevel = computed(() => (user.value?.xp || 0) - xpRequiredForCurrentLevel.value)
const xpNeededForNextLevel = computed(() => xpRequiredForNextLevel.value - xpRequiredForCurrentLevel.value)

const xpProgress = computed(() => {
  if (!user.value || xpNeededForNextLevel.value === 0) return 0
  return Math.min(100, (xpInCurrentLevel.value / xpNeededForNextLevel.value) * 100)
})

const greeting = computed(() => {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 18) return 'Good afternoon'
  return 'Good evening'
})

const rankTitle = computed(() => {
  if (!user.value) return 'Trader'
  const level = user.value.level
  if (level < 5) return 'Intern Trader'
  if (level < 10) return 'Junior Analyst'
  if (level < 20) return 'Senior Analyst'
  if (level < 35) return 'Portfolio Manager'
  if (level < 50) return 'Market Guru'
  return 'Market Legend'
})
</script>

<template>
  <div class="bg-gray-50 min-h-screen">
    <div class="w-4/5 mx-auto pt-10 pb-20">
      <h1 class="text-4xl font-bold flex items-center gap-3">
        <LayoutDashboard class="w-10 h-10 text-violet-600" />
        Hub
      </h1>
      <p class="text-gray-600 mt-2">Level up your trading career.</p>

      <!-- USER PROFILE INFO -->
      <div v-if="user"
        class="mt-8 bg-white rounded-2xl p-6 shadow-sm border border-violet-100 flex flex-col md:flex-row items-center gap-8">
        <div class="relative">
          <img :src="user.avatarUrl" class="w-20 h-20 rounded-full border-4 border-violet-500 shadow-sm" />
          <div
            class="absolute -bottom-2 -right-2 bg-violet-600 text-white text-[10px] font-bold px-2 py-1 rounded-lg shadow-sm">
            LVL {{ user.level }}
          </div>
        </div>

        <div class="flex-1 w-full">
          <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 class="text-2xl font-bold text-gray-800">{{ greeting }}, <span class="text-violet-600">{{ rankTitle }}</span></h2>
              <p class="text-sm text-gray-500">Keep trading to earn more XP and unlock badges!</p>
            </div>
            <div class="flex gap-3">
              <div class="bg-gray-50 px-4 py-2 rounded-xl border border-gray-100 flex flex-col items-center">
                <span class="text-[10px] uppercase text-gray-400 font-bold tracking-wider">Current Badge</span>
                <span class="text-sm font-semibold text-gray-700">{{ currentBadge?.description || 'Novice' }}</span>
              </div>
              <div class="bg-violet-50 px-4 py-2 rounded-xl border border-violet-100 flex flex-col items-center">
                <span class="text-[10px] uppercase text-violet-400 font-bold tracking-wider">XP Multiplier</span>
                <span class="text-sm font-semibold text-violet-700">x{{ activeMultiplier.toFixed(2) }}</span>
              </div>
            </div>
          </div>

          <div class="mt-4">
            <div class="flex justify-between text-xs mb-1.5">
              <span class="text-gray-400 font-semibold uppercase tracking-tight">Level Progress</span>
              <span class="text-violet-600 font-bold">{{ Math.floor(xpInCurrentLevel) }} / {{ Math.floor(xpNeededForNextLevel) }} XP to LVL {{ user.level + 1 }}</span>
            </div>
            <div class="w-full bg-gray-100 rounded-full h-2 overflow-hidden shadow-inner">
              <div class="bg-violet-500 h-full transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(124,58,237,0.5)]"
                :style="{ width: xpProgress + '%' }"></div>
            </div>
            <p class="text-[10px] text-gray-400 mt-1">Total Lifetime XP: {{ user.xp }}</p>
          </div>
        </div>
      </div>

      <!-- NEW GOAL FORM (Always Visible) -->
      <div class="mt-12 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h2 class="text-xl font-bold text-gray-800 mb-6">Start a New Challenge</h2>
        
        <div v-if="errorMessage" class="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          {{ errorMessage }}
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
          <div>
            <label class="block text-xs font-semibold text-gray-400 uppercase mb-2">I want to...</label>
            <select v-model="goalAction" class="w-full bg-gray-50 border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-violet-500 focus:border-violet-500">
              <option v-for="(t, key) in goalTemplates" :key="key" :value="key">{{ t.label }}</option>
            </select>
          </div>
          <div>
            <label class="block text-xs font-semibold text-gray-400 uppercase mb-2">Target ({{ goalTemplates[goalAction].unit || '$' }})</label>
            <input v-model.number="goalTarget" type="number" class="w-full bg-gray-50 border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-violet-500 focus:border-violet-500" />
          </div>
          <button 
            @click="createGoal"
            class="w-full bg-violet-600 text-white rounded-xl py-2.5 text-sm font-bold hover:bg-violet-700 transition-all shadow-lg shadow-violet-200 active:scale-[0.98]"
          >
            Create for {{ calculatedXP }} XP
          </button>
        </div>
      </div>

      <!-- ACTIVE GOALS -->
      <div class="mt-12">
        <h2 class="text-2xl font-bold text-gray-800 mb-6">Active Goals</h2>
        
        <div v-if="user?.goals && user.goals.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div v-for="(goal, idx) in user.goals" :key="idx" class="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 relative overflow-hidden">
            <div class="absolute top-0 right-0 p-3">
              <span class="text-[10px] font-bold bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">+{{ goal.xp }} XP</span>
            </div>
            <p class="font-semibold text-gray-800 pr-12">{{ goal.description }}</p>
            
            <div class="mt-4">
              <div class="flex justify-between text-[10px] font-semibold text-gray-400 mb-1">
                <span>PROGRESS</span>
                <span>{{ Math.min(100, Math.round((goal.progress / (goal.xp / 10 || 1)) * 100)) }}%</span>
              </div>
              <div class="w-full bg-gray-50 rounded-full h-1.5 overflow-hidden">
                <div 
                  class="bg-green-500 h-full transition-all duration-500" 
                  :style="{ width: Math.min(100, (goal.progress / (goal.xp / 10 || 1)) * 100) + '%' }"
                ></div>
              </div>
            </div>
          </div>
        </div>

        <div v-else class="bg-gray-100 border-2 border-dashed border-gray-200 rounded-2xl py-12 flex flex-col items-center justify-center text-gray-400">
           <p class="text-lg font-medium">No goals found</p>
           <p class="text-sm">Start challenges to earn XP and level up!</p>
        </div>
      </div>
    </div>
  </div>
</template>