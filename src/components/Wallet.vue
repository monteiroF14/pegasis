<script setup>
import { computed, onMounted, ref } from 'vue'
import { useSessionStore } from '../stores/session'
import { getMarketData } from '../api/db'
import { Wallet, TrendingUp, History, ArrowUpRight, ArrowDownRight, Briefcase, X, Minus } from 'lucide-vue-next'

const sessionStore = useSessionStore()
const marketData = ref([])
const loading = ref(true)

const selectedAsset = ref(null)
const sellQuantity = ref(1)
const isSelling = ref(false)

const openSellModal = (item) => {
  selectedAsset.value = item
  sellQuantity.value = 1
}

const confirmSell = async () => {
  if (!selectedAsset.value || sellQuantity.value <= 0) return
  isSelling.value = true
  try {
    const livePrice = getLivePrice(selectedAsset.value.stockId) || selectedAsset.value.buyPrice
    await sessionStore.sellStock(selectedAsset.value, sellQuantity.value, livePrice)
    selectedAsset.value = null
  } catch (e) {
    alert(e.message)
  } finally {
    isSelling.value = false
  }
}

const user = computed(() => sessionStore.user)
const portfolio = computed(() => user.value?.portfolio || [])
const history = computed(() => {
  if (!user.value?.history) return []
  return [...user.value.history].reverse().map(tx => {
    const stock = marketData.value.find(s => s.symbol === tx.stockId)
    return {
      ...tx,
      logo: stock ? stock.logo : null
    }
  })
})

const fetchMarket = async () => {
  try {
    marketData.value = await getMarketData()
  } catch (e) {
    console.error('Failed to fetch market data for wallet', e)
  } finally {
    loading.value = false
  }
}

onMounted(fetchMarket)

const getLivePrice = (symbol) => {
  const stock = marketData.value.find(s => s.symbol === symbol)
  return stock ? stock.price : null
}

const portfolioWithLivePrices = computed(() => {
  return portfolio.value.map(item => {
    const stock = marketData.value.find(s => s.symbol === item.stockId)
    const livePrice = stock ? stock.price : null
    const logo = stock ? stock.logo : null
    const currentValue = livePrice ? livePrice * item.quantity : item.buyPrice * item.quantity
    const pnl = livePrice ? (livePrice - item.buyPrice) * item.quantity : 0
    const pnlPercent = livePrice ? ((livePrice - item.buyPrice) / item.buyPrice) * 100 : 0
    
    return {
      ...item,
      livePrice,
      logo,
      currentValue,
      pnl,
      pnlPercent
    }
  })
})

const totalPortfolioValue = computed(() => {
  return portfolioWithLivePrices.value.reduce((acc, item) => acc + item.currentValue, 0)
})

const totalPnl = computed(() => {
  return portfolioWithLivePrices.value.reduce((acc, item) => acc + item.pnl, 0)
})

const formatDate = (dateStr) => {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}
</script>

<template>
  <div class="bg-gray-50 min-h-screen">
    <div class="w-4/5 mx-auto pt-10 pb-20">
      <header class="mb-10">
        <h1 class="text-4xl font-bold flex items-center gap-3">
          <Wallet class="w-10 h-10 text-violet-600" />
          Wallet
        </h1>
        <p class="text-gray-600 mt-2 text-lg">Manage your assets and track your financial journey.</p>
      </header>

      <!-- TOP STATS -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div class="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 relative overflow-hidden group">
          <div class="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-110 transition-transform duration-500">
            <Wallet class="w-20 h-20 text-violet-600" />
          </div>
          <p class="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">Available Balance</p>
          <p class="text-4xl font-bold text-gray-900">${{ user?.balance?.toLocaleString() || '0' }}</p>
          <div class="mt-4 flex items-center gap-2 text-xs font-semibold text-violet-600 bg-violet-50 w-fit px-3 py-1 rounded-full">
            Ready to invest
          </div>
        </div>

        <div class="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 relative overflow-hidden group">
          <div class="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-110 transition-transform duration-500">
            <Briefcase class="w-20 h-20 text-blue-600" />
          </div>
          <p class="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">Portfolio Value</p>
          <p class="text-4xl font-bold text-gray-900">${{ totalPortfolioValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}</p>
          <div class="mt-4 flex items-center gap-2 text-xs font-semibold text-blue-600 bg-blue-50 w-fit px-3 py-1 rounded-full">
            {{ portfolio.length }} Assets held
          </div>
        </div>

        <div class="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 relative overflow-hidden group">
          <div class="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-110 transition-transform duration-500">
            <TrendingUp class="w-20 h-20 text-green-600" />
          </div>
          <p class="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">Total Profit/Loss</p>
          <p class="text-4xl font-bold" :class="totalPnl >= 0 ? 'text-green-600' : 'text-red-600'">
            {{ totalPnl >= 0 ? '+' : '' }}${{ totalPnl.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}
          </p>
          <div class="mt-4 flex items-center gap-2 text-xs font-semibold w-fit px-3 py-1 rounded-full"
               :class="totalPnl >= 0 ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'">
            Overall performance
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <!-- HOLDINGS -->
        <div>
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <Briefcase class="w-6 h-6 text-gray-400" />
              Your Assets
            </h2>
          </div>

          <div class="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
            <div v-if="loading" class="p-12 text-center text-gray-400">
              <div class="animate-spin w-8 h-8 border-4 border-violet-500 border-t-transparent rounded-full mx-auto mb-4"></div>
              Calculating live portfolio values...
            </div>
            
            <div v-else-if="portfolioWithLivePrices.length === 0" class="p-12 text-center">
              <div class="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Briefcase class="w-8 h-8 text-gray-300" />
              </div>
              <p class="text-gray-500 font-medium">No assets yet.</p>
              <router-link to="/market" class="text-violet-600 font-bold text-sm hover:underline mt-2 inline-block">Visit the market to start trading</router-link>
            </div>

            <table v-else class="w-full">
              <thead class="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th class="text-left px-8 py-4 text-[10px] font-semibold text-gray-400 uppercase tracking-widest">Asset</th>
                  <th class="text-right px-8 py-4 text-[10px] font-semibold text-gray-400 uppercase tracking-widest">Quantity</th>
                  <th class="text-right px-8 py-4 text-[10px] font-semibold text-gray-400 uppercase tracking-widest">Profit/Loss</th>
                  <th class="text-center px-8 py-4 text-[10px] font-semibold text-gray-400 uppercase tracking-widest">Trade</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-50">
                <tr v-for="item in portfolioWithLivePrices" :key="item.id" class="hover:bg-gray-50 transition-colors">
                  <td class="px-8 py-5">
                    <div class="flex items-center gap-4">
                      <img v-if="item.logo" :src="item.logo" class="w-12 h-12 rounded-2xl bg-white object-contain shadow-sm border border-gray-100 p-1" />
                      <div v-else class="w-12 h-12 rounded-2xl bg-violet-50 flex items-center justify-center text-violet-600 font-semibold text-xs shadow-sm border border-violet-100">
                        {{ item.stockId.substring(0, 2) }}
                      </div>
                      <div>
                        <p class="font-semibold text-gray-900 leading-tight">{{ item.name }}</p>
                        <p class="text-[10px] text-gray-400 font-semibold tracking-[0.2em] uppercase">{{ item.stockId }}</p>
                      </div>
                    </div>
                  </td>
                  <td class="px-8 py-5 text-right font-semibold text-gray-700">{{ item.quantity }}</td>
                  <td class="px-8 py-5 text-right">
                    <div class="flex flex-col items-end">
                      <span class="flex items-center gap-1 font-semibold text-sm" :class="item.pnl >= 0 ? 'text-green-600' : 'text-red-600'">
                        <ArrowUpRight v-if="item.pnl >= 0" class="w-3 h-3" />
                        <ArrowDownRight v-else class="w-3 h-3" />
                        {{ item.pnlPercent >= 0 ? '+' : '' }}{{ item.pnlPercent.toFixed(2) }}%
                      </span>
                      <span class="text-[10px] font-semibold uppercase tracking-tighter" :class="item.pnl >= 0 ? 'text-green-500/80' : 'text-red-400'">
                        {{ item.pnl >= 0 ? '+' : '' }}${{ item.pnl.toFixed(2) }}
                      </span>
                    </div>
                  </td>
                  <td class="px-8 py-5 text-center">
                    <button 
                      @click="openSellModal(item)"
                      class="bg-red-50 text-red-600 px-4 py-2 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all active:scale-95 border border-red-100"
                    >
                      Sell
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- TRANSACTION HISTORY -->
        <div>
          <h2 class="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2 px-2">
            <History class="w-6 h-6 text-gray-400" />
            History
          </h2>
          <div class="bg-white rounded-[32px] shadow-sm border border-gray-100 overflow-hidden">
            <div v-if="history.length === 0" class="p-12 text-center text-gray-400">
              <p class="text-sm font-bold uppercase tracking-widest">No activity yet</p>
            </div>
            <div v-else class="divide-y divide-gray-50 max-h-[600px] overflow-y-auto custom-scrollbar">
              <div v-for="tx in history" :key="tx.id" class="p-6 hover:bg-gray-50 transition-colors">
                <div class="flex items-center gap-4">
                  <div class="relative">
                    <img v-if="tx.logo" :src="tx.logo" class="w-12 h-12 rounded-2xl bg-white object-contain shadow-sm border border-gray-100 p-1" />
                    <div v-else class="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center text-gray-400 font-bold text-xs">{{ tx.stockId.substring(0,2) }}</div>
                    
                    <div class="absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center shadow-md border-2 border-white"
                         :class="tx.type === 'BUY' ? 'bg-red-500' : 'bg-green-500'">
                      <ArrowUpRight v-if="tx.type === 'BUY'" class="w-3 h-3 text-white rotate-180" />
                      <ArrowDownRight v-else class="w-3 h-3 text-white -rotate-90" />
                    </div>
                  </div>
                  
                  <div class="flex-1 min-w-0">
                    <div class="flex justify-between items-center">
                      <div>
                        <p class="text-sm font-bold text-gray-900 truncate">{{ tx.name }}</p>
                        <p class="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{{ tx.stockId }} • {{ formatDate(tx.date) }}</p>
                      </div>
                      <div class="text-right">
                        <p class="text-sm font-bold" :class="tx.type === 'BUY' ? 'text-red-600' : 'text-green-600'">
                          {{ tx.type === 'BUY' ? '-' : '+' }}${{ tx.totalValue.toLocaleString(undefined, { minimumFractionDigits: 2 }) }}
                        </p>
                        <p class="text-[10px] text-gray-400 font-bold uppercase">{{ tx.quantity }} units @ ${{ tx.price.toFixed(2) }}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- SELL MODAL -->
    <div v-if="selectedAsset" class="fixed inset-0 bg-gray-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div class="bg-white rounded-[32px] w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in duration-200">
        <div class="p-8">
          <div class="flex justify-between items-start mb-8">
            <div class="flex items-center gap-4">
              <img v-if="selectedAsset.logo" :src="selectedAsset.logo" class="w-14 h-14 rounded-2xl bg-white object-contain shadow-sm border border-gray-100 p-1" />
              <div v-else class="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center text-red-600 font-semibold text-sm shadow-sm border border-red-100">
                {{ selectedAsset.stockId.substring(0, 2) }}
              </div>
              <div>
                <h3 class="text-2xl font-bold text-gray-900 leading-tight">Sell {{ selectedAsset.name }}</h3>
                <p class="text-xs text-red-500 font-semibold uppercase tracking-[0.2em]">{{ selectedAsset.stockId }}</p>
              </div>
            </div>
            <button @click="selectedAsset = null" class="bg-gray-50 p-2 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
              <X class="w-5 h-5" />
            </button>
          </div>

          <div class="space-y-8">
            <div class="grid grid-cols-2 gap-4">
              <div class="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                <p class="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Market Price</p>
                <p class="text-xl font-semibold text-gray-900">${{ (getLivePrice(selectedAsset.stockId) || selectedAsset.buyPrice).toFixed(2) }}</p>
              </div>
              <div class="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                <p class="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Available</p>
                <p class="text-xl font-semibold text-gray-900">{{ selectedAsset.quantity }} <span class="text-xs text-gray-400">units</span></p>
              </div>
            </div>

            <div>
              <label class="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 px-1">Quantity to sell</label>
              <div class="flex items-center gap-3 bg-gray-50 p-2 rounded-2xl border border-gray-100">
                <button 
                  @click="sellQuantity = Math.max(1, sellQuantity - 1)"
                  class="w-12 h-12 rounded-xl bg-white shadow-sm border border-gray-100 flex items-center justify-center font-bold text-gray-600 hover:bg-red-600 hover:text-white hover:border-red-600 transition-all"
                >-</button>
                <input 
                  v-model.number="sellQuantity" 
                  type="number" 
                  min="1"
                  :max="selectedAsset.quantity"
                  class="flex-1 bg-transparent border-none text-center font-bold text-2xl text-gray-900 focus:ring-0" 
                />
                <button 
                  @click="sellQuantity = Math.min(selectedAsset.quantity, sellQuantity + 1)"
                  class="w-12 h-12 rounded-xl bg-white shadow-sm border border-gray-100 flex items-center justify-center font-bold text-gray-600 hover:bg-red-600 hover:text-white hover:border-red-600 transition-all"
                >+</button>
              </div>
              <button 
                @click="sellQuantity = selectedAsset.quantity"
                class="w-full mt-3 text-[10px] font-bold text-violet-600 uppercase tracking-widest hover:text-violet-700 transition-colors"
              >Sell Maximum Units</button>
            </div>

            <div class="pt-2">
              <div class="space-y-3 mb-6 px-1">
                <div class="flex justify-between items-center">
                  <span class="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Revenue</span>
                  <span class="text-xl font-semibold text-gray-900">${{ ((getLivePrice(selectedAsset.stockId) || selectedAsset.buyPrice) * sellQuantity).toLocaleString(undefined, { minimumFractionDigits: 2 }) }}</span>
                </div>
                <div class="flex justify-between items-center">
                  <span class="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Realized PNL</span>
                  <span class="text-lg font-semibold" :class="((getLivePrice(selectedAsset.stockId) || selectedAsset.buyPrice) - selectedAsset.buyPrice) >= 0 ? 'text-green-600' : 'text-red-600'">
                    {{ ((getLivePrice(selectedAsset.stockId) || selectedAsset.buyPrice) - selectedAsset.buyPrice) >= 0 ? '+' : '' }}${{ (((getLivePrice(selectedAsset.stockId) || selectedAsset.buyPrice) - selectedAsset.buyPrice) * sellQuantity).toFixed(2) }}
                  </span>
                </div>
              </div>

              <button 
                @click="confirmSell"
                :disabled="isSelling || sellQuantity > selectedAsset.quantity || sellQuantity <= 0"
                class="w-full bg-red-600 text-white py-5 rounded-[20px] font-bold text-lg shadow-xl shadow-red-100 hover:bg-red-700 disabled:bg-gray-200 disabled:text-gray-400 disabled:shadow-none transition-all active:scale-[0.98] mb-4"
              >
                {{ isSelling ? 'Processing...' : 'Confirm Sale' }}
              </button>
              <div class="flex items-center justify-center gap-2">
                <TrendingUp class="w-3 h-3 text-green-500" />
                <p class="text-center text-[10px] font-bold text-gray-400 uppercase tracking-widest">+40 XP REWARD ON SUCCESS</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
::-webkit-scrollbar {
  width: 6px;
}
::-webkit-scrollbar-track {
  background: transparent;
}
::-webkit-scrollbar-thumb {
  background: #e2e8f0;
  border-radius: 10px;
}
::-webkit-scrollbar-thumb:hover {
  background: #cbd5e1;
}
</style>
