<script setup>
import { ref, onMounted, computed } from 'vue'
import { Search, TrendingUp, TrendingDown, Star, ShoppingBag, Plus, X, LayoutGrid, List, ArrowUpDown } from 'lucide-vue-next'
import { getMarketData } from '../api/db.js'
import { syncMarketData } from '../api/finnhub.js'
import { useWishlistStore } from '../stores/wishlist.js'
import { useSessionStore } from '../stores/session.js'

const stocks = ref([])
const search = ref('')
const loading = ref(true)
const wishlist = useWishlistStore()
const session = useSessionStore()

const viewMode = ref('grid') // 'grid' | 'list'
const sortBy = ref('symbol') // 'symbol' | 'price' | 'change'
const sortOrder = ref('asc')

const selectedStock = ref(null)
const buyAmount = ref(100) // Default currency amount
const isBuying = ref(false)

const openBuyModal = (stock) => {
  selectedStock.value = stock
  buyAmount.value = 100
}

const confirmBuy = async () => {
  if (!selectedStock.value || buyAmount.value <= 0) return
  isBuying.value = true
  try {
    await session.buyStock(selectedStock.value, buyAmount.value)
    selectedStock.value = null
  } catch (e) {
    alert(e.message)
  } finally {
    isBuying.value = false
  }
}

const toggleSort = (param) => {
  if (sortBy.value === param) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortBy.value = param
    sortOrder.value = 'asc'
  }
}

const fetchStocks = async () => {
  try {
    const cachedData = await getMarketData()
    if (cachedData && cachedData.length > 0) {
      stocks.value = cachedData
    }
  } catch (e) {
    console.error('Market fetch error', e)
  } finally {
    loading.value = false
  }
  syncMarketData().catch(err => console.error('Background sync failed', err))
}

onMounted(fetchStocks)

const filteredStocks = computed(() => {
  let result = stocks.value.filter(s =>
    s.description?.toLowerCase().includes(search.value.toLowerCase()) ||
    s.symbol?.toLowerCase().includes(search.value.toLowerCase())
  )

  return result.sort((a, b) => {
    let modifier = sortOrder.value === 'asc' ? 1 : -1
    if (sortBy.value === 'price') {
      return (a.price - b.price) * modifier
    }
    if (sortBy.value === 'change') {
      return (a.change - b.change) * modifier
    }
    return a.symbol.localeCompare(b.symbol) * modifier
  })
})
</script>

<template>
  <div class="bg-gray-50 min-h-screen">
    <div class="w-4/5 mx-auto pt-10 pb-6">
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 class="text-4xl font-bold flex items-center gap-3">
            <ShoppingBag class="w-10 h-10 text-violet-600" />
            Market
          </h1>
          <p class="text-gray-600 mt-2">Live prices and company data.</p>
        </div>

        <div class="flex items-center gap-2 bg-white p-1.5 rounded-2xl border border-gray-100 shadow-sm">
          <button @click="viewMode = 'grid'" class="p-2 rounded-xl transition-all"
            :class="viewMode === 'grid' ? 'bg-violet-600 text-white shadow-md shadow-violet-200' : 'text-gray-400 hover:bg-gray-50'">
            <LayoutGrid class="w-5 h-5" />
          </button>
          <button @click="viewMode = 'list'" class="p-2 rounded-xl transition-all"
            :class="viewMode === 'list' ? 'bg-violet-600 text-white shadow-md shadow-violet-200' : 'text-gray-400 hover:bg-gray-50'">
            <List class="w-5 h-5" />
          </button>
        </div>
      </div>

      <div class="mt-8 flex flex-col md:flex-row gap-4">
        <div class="relative flex-1">
          <Search class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input v-model="search" type="text" placeholder="Search by company or ticker"
            class="w-full pl-12 pr-4 py-3 rounded-2xl border border-gray-200 bg-white focus:ring-2 focus:ring-violet-500 transition-all" />
        </div>

        <div class="flex gap-2">
          <button @click="toggleSort('symbol')"
            class="px-4 py-2 bg-white border border-gray-200 rounded-2xl text-sm font-semibold flex items-center gap-2 hover:bg-gray-50 transition-colors"
            :class="sortBy === 'symbol' ? 'text-violet-600 border-violet-200' : 'text-gray-600'">
            Name
            <ArrowUpDown class="w-3 h-3" />
          </button>
          <button @click="toggleSort('price')"
            class="px-4 py-2 bg-white border border-gray-200 rounded-2xl text-sm font-semibold flex items-center gap-2 hover:bg-gray-50 transition-colors"
            :class="sortBy === 'price' ? 'text-violet-600 border-violet-200' : 'text-gray-600'">
            Price
            <ArrowUpDown class="w-3 h-3" />
          </button>
          <button @click="toggleSort('change')"
            class="px-4 py-2 bg-white border border-gray-200 rounded-2xl text-sm font-semibold flex items-center gap-2 hover:bg-gray-50 transition-colors"
            :class="sortBy === 'change' ? 'text-violet-600 border-violet-200' : 'text-gray-600'">
            24h
            <ArrowUpDown class="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>

    <div class="w-4/5 mx-auto pb-20">
      <div v-if="loading" class="py-20 text-center text-gray-400">
        <div class="animate-spin w-10 h-10 border-4 border-violet-500 border-t-transparent rounded-full mx-auto mb-4">
        </div>
        Syncing market data...
      </div>

      <template v-else>
        <!-- GRID VIEW -->
        <div v-if="viewMode === 'grid'" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <div v-for="stock in filteredStocks" :key="stock.symbol"
            class="bg-white rounded-[32px] p-6 shadow-sm border border-gray-100 hover:shadow-xl hover:shadow-violet-50 hover:-translate-y-1 transition-all duration-300 group">
            <div class="flex justify-between items-start mb-6">
              <div class="flex items-center gap-3">
                <img v-if="stock.logo" :src="stock.logo"
                  class="w-12 h-12 rounded-2xl bg-white object-contain shadow-sm border border-gray-50 p-1" />
                <div v-else
                  class="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center text-gray-400 font-semibold text-xs">
                  {{ stock.symbol.substring(0, 2) }}</div>
                <div>
                  <p class="text-xs text-gray-400 font-bold uppercase tracking-widest">{{ stock.symbol }}</p>
                  <p class="font-bold text-gray-900 leading-tight truncate max-w-[120px]">{{ stock.description }}</p>
                </div>
              </div>
              <button @click="wishlist.toggle(stock.symbol)"
                class="p-2 rounded-xl transition-all duration-200 hover:bg-yellow-50"
                :class="wishlist.isInWishlist(stock.symbol) ? 'text-yellow-400' : 'text-gray-200 hover:text-yellow-400'">
                <Star class="w-5 h-5" :fill="wishlist.isInWishlist(stock.symbol) ? 'currentColor' : 'transparent'" />
              </button>
            </div>

            <div class="mb-6">
              <p class="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Current Price</p>
              <div class="flex items-baseline gap-2">
                <span class="text-2xl font-bold text-gray-900">${{ Number(stock.price).toFixed(2) }}</span>
                <span class="text-xs font-semibold" :class="stock.change >= 0 ? 'text-green-600' : 'text-red-600'">
                  {{ stock.change >= 0 ? '+' : '' }}{{ Number(stock.change).toFixed(2) }}%
                </span>
              </div>
            </div>

            <button @click="openBuyModal(stock)"
              class="w-full bg-violet-50 text-violet-600 py-3 rounded-2xl font-bold text-sm uppercase tracking-widest hover:bg-violet-600 hover:text-white transition-all active:scale-95 border border-violet-100">
              Trade Asset
            </button>
          </div>
        </div>

        <!-- LIST VIEW -->
        <div v-if="viewMode === 'list'" class="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <table class="w-full">
            <thead class="bg-gray-50 border-b border-gray-100">
              <tr>
                <th class="text-left px-8 py-4 text-[10px] font-semibold text-gray-400 uppercase tracking-widest">
                  Company</th>
                <th class="text-right px-8 py-4 text-[10px] font-semibold text-gray-400 uppercase tracking-widest">Price
                </th>
                <th class="text-right px-8 py-4 text-[10px] font-semibold text-gray-400 uppercase tracking-widest">24h
                  Change</th>
                <th class="text-center px-8 py-4 text-[10px] font-semibold text-gray-400 uppercase tracking-widest">
                  Watch</th>
                <th class="text-center px-8 py-4 text-[10px] font-semibold text-gray-400 uppercase tracking-widest">
                  Trade</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-50">
              <tr v-for="stock in filteredStocks" :key="stock.symbol" class="hover:bg-gray-50 transition-colors">
                <td class="px-8 py-5">
                  <div class="flex items-center gap-4">
                    <img v-if="stock.logo" :src="stock.logo"
                      class="w-10 h-10 rounded-2xl bg-white object-contain shadow-sm border border-gray-50 p-1" />
                    <div v-else
                      class="w-10 h-10 rounded-2xl bg-gray-100 flex items-center justify-center text-gray-400 font-semibold text-xs">
                      {{ stock.symbol.substring(0, 2) }}</div>
                    <div>
                      <p class="font-semibold text-gray-900 leading-tight">{{ stock.description }}</p>
                      <p class="text-[10px] text-gray-400 font-bold tracking-widest uppercase">{{ stock.symbol }}</p>
                    </div>
                  </div>
                </td>
                <td class="px-8 py-5 text-right font-medium text-gray-900">${{ Number(stock.price).toFixed(2) }}</td>
                <td class="px-8 py-5 text-right font-semibold"
                  :class="stock.change >= 0 ? 'text-green-600' : 'text-red-600'">
                  <div class="flex items-center justify-end gap-1">
                    <TrendingUp v-if="stock.change >= 0" class="w-3 h-3" />
                    <TrendingDown v-else class="w-3 h-3" />
                    {{ stock.change >= 0 ? '+' : '' }}{{ Number(stock.change).toFixed(2) }}%
                  </div>
                </td>
                <td class="px-8 py-5 text-center">
                  <button @click="wishlist.toggle(stock.symbol)"
                    class="text-gray-300 hover:text-yellow-400 transition-colors"
                    :class="{ 'text-yellow-400': wishlist.isInWishlist(stock.symbol) }">
                    <Star class="w-5 h-5 mx-auto"
                      :fill="wishlist.isInWishlist(stock.symbol) ? 'currentColor' : 'transparent'" />
                  </button>
                </td>
                <td class="px-8 py-5 text-center">
                  <button @click="openBuyModal(stock)"
                    class="bg-violet-50 text-violet-600 px-4 py-2 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-violet-600 hover:text-white transition-all active:scale-95 border border-violet-100">
                    Buy
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </template>
    </div>

    <!-- BUY MODAL -->
    <div v-if="selectedStock"
      class="fixed inset-0 bg-gray-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div class="bg-white rounded-[32px] w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in duration-200">
        <div class="p-8">
          <div class="flex justify-between items-start mb-8">
            <div class="flex items-center gap-4">
              <img v-if="selectedStock.logo" :src="selectedStock.logo"
                class="w-14 h-14 rounded-2xl object-contain bg-gray-50 p-2 border border-gray-100" />
              <div>
                <h3 class="text-2xl font-bold text-gray-900 leading-tight">{{ selectedStock.description }}</h3>
                <p class="text-xs text-violet-500 font-semibold uppercase tracking-[0.2em]">{{ selectedStock.symbol }}
                </p>
              </div>
            </div>
            <button @click="selectedStock = null"
              class="bg-gray-50 p-2 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
              <X class="w-5 h-5" />
            </button>
          </div>

          <div class="space-y-8">
            <div class="grid grid-cols-2 gap-4">
              <div class="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                <p class="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Price</p>
                <p class="text-xl font-semibold text-gray-900">${{ selectedStock.price.toFixed(2) }}</p>
              </div>
              <div class="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                <p class="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Balance</p>
                <p class="text-xl font-semibold text-gray-900 truncate">${{ session.user?.balance?.toLocaleString() }}
                </p>
              </div>
            </div>

            <div>
              <label class="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 px-1">Amount to
                invest
                ($)</label>
              <div class="flex items-center gap-3 bg-gray-50 p-2 rounded-2xl border border-gray-100">
                <button @click="buyAmount = Math.max(10, buyAmount - 50)"
                  class="w-12 h-12 rounded-xl bg-white shadow-sm border border-gray-100 flex items-center justify-center font-bold text-gray-600 hover:bg-violet-600 hover:text-white hover:border-violet-600 transition-all">-$50</button>
                <input v-model.number="buyAmount" type="number" min="1"
                  class="w-full bg-transparent border-none text-center font-bold text-2xl text-gray-900 focus:ring-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
                <button @click="buyAmount += 50"
                  class="w-12 h-12 rounded-xl bg-white shadow-sm border border-gray-100 flex items-center justify-center font-bold text-gray-600 hover:bg-violet-600 hover:text-white hover:border-violet-600 transition-all">+$50</button>
              </div>
              <p class="text-center text-[10px] font-bold text-violet-500 uppercase tracking-widest mt-3">
                You will receive ≈ {{ (buyAmount / selectedStock.price).toFixed(4) }} shares
              </p>
            </div>

            <div class="pt-2">
              <div class="flex justify-between items-center mb-6 px-1">
                <span class="text-sm font-semibold text-gray-400 uppercase tracking-widest">Total Cost</span>
                <span class="text-3xl font-bold text-violet-600">${{ Number(buyAmount).toLocaleString(undefined, {
                  minimumFractionDigits: 2 }) }}</span>
              </div>

              <button @click="confirmBuy" :disabled="isBuying || (buyAmount > session.user?.balance)"
                class="w-full bg-violet-600 text-white py-5 rounded-[20px] font-bold text-lg shadow-xl shadow-violet-100 hover:bg-violet-700 disabled:bg-gray-200 disabled:text-gray-400 disabled:shadow-none transition-all active:scale-[0.98] mb-4">
                {{ isBuying ? 'Processing...' : (buyAmount > session.user?.balance ?
                  'Insufficient Balance' : 'Confirm Purchase') }}
              </button>

            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
