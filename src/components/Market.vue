<script setup>
import { ref, onMounted, computed } from 'vue'
import { Search, TrendingUp, TrendingDown, Star, ShoppingBag, Plus, X } from 'lucide-vue-next'
import { getMarketData } from '../api/db.js'
import { syncMarketData } from '../api/finnhub.js'
import { useWishlistStore } from '../stores/wishlist.js'
import { useSessionStore } from '../stores/session.js'

const stocks = ref([])
const search = ref('')
const loading = ref(true)
const wishlist = useWishlistStore()
const session = useSessionStore()

const selectedStock = ref(null)
const buyQuantity = ref(1)
const isBuying = ref(false)

const openBuyModal = (stock) => {
  selectedStock.value = stock
  buyQuantity.value = 1
}

const confirmBuy = async () => {
  if (!selectedStock.value || buyQuantity.value <= 0) return
  isBuying.value = true
  try {
    await session.buyStock(selectedStock.value, buyQuantity.value)
    selectedStock.value = null
  } catch (e) {
    alert(e.message)
  } finally {
    isBuying.value = false
  }
}

const fetchStocks = async () => {
  try {
    // 1. Fetch data from our DB (Source of Truth)
    const cachedData = await getMarketData()
    console.log("cached: ", cachedData)
    if (cachedData && cachedData.length > 0) {
      stocks.value = cachedData
    }
  } catch (e) {
    console.error('Market fetch error', e)
  } finally {
    loading.value = false
  }

  console.log("loading", loading)

  // 2. Trigger background sync (Fire & Forget)
  // This will update the DB. Next time the user loads or if we implement polling, they get fresh data.
  syncMarketData().catch(err => console.error('Background sync failed', err))
}

onMounted(fetchStocks)

const filteredStocks = computed(() =>
  stocks.value.filter(s =>
    s.description?.toLowerCase().includes(search.value.toLowerCase()) ||
    s.symbol?.toLowerCase().includes(search.value.toLowerCase())
  )
)
</script>

<template>
  <div class="bg-gray-50 min-h-screen">
    <div class="w-4/5 mx-auto pt-10 pb-6">
      <h1 class="text-4xl font-extrabold flex items-center gap-3">
        <ShoppingBag class="w-10 h-10 text-violet-600" />
        Market
      </h1>
      <p class="text-gray-600 mt-2">Live prices and company data.</p>

      <div class="mt-8 relative">
        <Search class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input v-model="search" type="text" placeholder="Search by company or ticker"
          class="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-violet-500" />
      </div>
    </div>

    <div class="w-4/5 mx-auto pb-20">
      <div class="bg-white rounded-2xl shadow-sm overflow-hidden">
        <table class="w-full">
          <thead class="bg-gray-100 text-sm text-gray-600">
            <tr>
              <th class="text-left px-6 py-4">Company</th>
              <th class="text-right px-6 py-4">Price</th>
              <th class="text-right px-6 py-4">24h</th>
              <th class="text-center px-6 py-4">Watch</th>
              <th class="text-center px-6 py-4">Trade</th>
            </tr>
          </thead>
          <tbody class="divide-y">
            <tr v-if="loading">
              <td colspan="5" class="px-6 py-6 text-center text-gray-500">Loading live market data...</td>
            </tr>

            <tr v-for="stock in filteredStocks" :key="stock.symbol" class="hover:bg-gray-50 transition-colors">
              <td class="px-6 py-4">
                <div class="flex items-center gap-4">
                  <img v-if="stock.logo" :src="stock.logo"
                    class="w-10 h-10 rounded-full bg-white object-contain shadow-sm border border-gray-50" />
                  <div v-else
                    class="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 font-bold text-xs">
                    {{ stock.symbol.substring(0, 2) }}</div>

                  <div>
                    <p class="font-bold text-gray-900">{{ stock.description }}</p>
                    <p class="text-xs text-gray-400 font-bold tracking-widest uppercase">{{ stock.symbol }}</p>
                  </div>
                </div>
              </td>

              <td class="px-6 py-4 text-right font-medium text-gray-900">
                ${{ (stock.price !== null && stock.price !== undefined) ? Number(stock.price).toFixed(2) : '—' }}
              </td>

              <td class="px-6 py-4 text-right font-bold"
                :class="(stock.change !== null && stock.change !== undefined && stock.change >= 0) ? 'text-green-600' : 'text-red-600'">
                <div class="flex items-center justify-end gap-1">
                  <TrendingUp v-if="stock.change >= 0" class="w-3 h-3" />
                  <TrendingDown v-else class="w-3 h-3" />
                  <span v-if="stock.change !== null && stock.change !== undefined && Number.isFinite(stock.change)">
                    {{ stock.change >= 0 ? '+' : '' }}{{ Number(stock.change).toFixed(2) }}%
                  </span>
                  <span v-else>—</span>
                </div>
              </td>

              <td class="px-6 py-4 text-center">
                <button 
                  @click="wishlist.toggle(stock.symbol)"
                  class="p-2 rounded-xl transition-all duration-200 hover:bg-yellow-50"
                  :class="wishlist.isInWishlist(stock.symbol) ? 'text-yellow-400' : 'text-gray-300 hover:text-yellow-400'"
                >
                  <Star 
                    class="w-5 h-5" 
                    :fill="wishlist.isInWishlist(stock.symbol) ? 'currentColor' : 'transparent'" 
                  />
                </button>
              </td>

              <td class="px-6 py-4 text-center">
                <button 
                  @click="openBuyModal(stock)"
                  class="bg-violet-50 text-violet-600 px-4 py-2 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-violet-600 hover:text-white transition-all active:scale-95 border border-violet-100"
                >
                  Buy
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- BUY MODAL -->
    <div v-if="selectedStock" class="fixed inset-0 bg-gray-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div class="bg-white rounded-[32px] w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in duration-200">
        <div class="p-8">
          <div class="flex justify-between items-start mb-8">
            <div class="flex items-center gap-4">
              <img v-if="selectedStock.logo" :src="selectedStock.logo" class="w-14 h-14 rounded-2xl object-contain bg-gray-50 p-2 border border-gray-100" />
              <div>
                <h3 class="text-2xl font-black text-gray-900 leading-tight">{{ selectedStock.description }}</h3>
                <p class="text-xs text-violet-500 font-black uppercase tracking-[0.2em]">{{ selectedStock.symbol }}</p>
              </div>
            </div>
            <button @click="selectedStock = null" class="bg-gray-50 p-2 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
              <X class="w-5 h-5" />
            </button>
          </div>

          <div class="space-y-8">
            <div class="grid grid-cols-2 gap-4">
              <div class="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Price</p>
                <p class="text-xl font-bold text-gray-900">${{ selectedStock.price.toFixed(2) }}</p>
              </div>
              <div class="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Balance</p>
                <p class="text-xl font-bold text-gray-900 truncate">${{ session.user?.balance?.toLocaleString() }}</p>
              </div>
            </div>

            <div>
              <label class="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 px-1">Quantity to purchase</label>
              <div class="flex items-center gap-3 bg-gray-50 p-2 rounded-2xl border border-gray-100">
                <button 
                  @click="buyQuantity = Math.max(1, buyQuantity - 1)"
                  class="w-12 h-12 rounded-xl bg-white shadow-sm border border-gray-100 flex items-center justify-center font-black text-gray-600 hover:bg-violet-600 hover:text-white hover:border-violet-600 transition-all"
                >-</button>
                <input 
                  v-model.number="buyQuantity" 
                  type="number" 
                  min="1"
                  class="w-full bg-transparent border-none text-center font-black text-2xl text-gray-900 focus:ring-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" 
                />
                <button 
                  @click="buyQuantity++"
                  class="w-12 h-12 rounded-xl bg-white shadow-sm border border-gray-100 flex items-center justify-center font-black text-gray-600 hover:bg-violet-600 hover:text-white hover:border-violet-600 transition-all"
                >+</button>
              </div>
            </div>

            <div class="pt-2">
              <div class="flex justify-between items-center mb-6 px-1">
                <span class="text-sm font-bold text-gray-400 uppercase tracking-widest">Total Cost</span>
                <span class="text-3xl font-black text-violet-600">${{ (selectedStock.price *
                  buyQuantity).toLocaleString(undefined, { minimumFractionDigits: 2 }) }}</span>
              </div>

              <button @click="confirmBuy"
                :disabled="isBuying || (selectedStock.price * buyQuantity > session.user?.balance)"
                class="w-full bg-violet-600 text-white py-5 rounded-[20px] font-black text-lg shadow-xl shadow-violet-100 hover:bg-violet-700 disabled:bg-gray-200 disabled:text-gray-400 disabled:shadow-none transition-all active:scale-[0.98] mb-4">
                {{ isBuying ? 'Processing...' : (selectedStock.price * buyQuantity > session.user?.balance ?
                  'Insufficient Balance' : 'Confirm Purchase') }}
              </button>
              <div class="flex items-center justify-center gap-2">
                <TrendingUp class="w-3 h-3 text-green-500" />
                <p class="text-center text-[10px] font-black text-gray-400 uppercase tracking-widest">+50 XP REWARD ON
                  SUCCESS</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
