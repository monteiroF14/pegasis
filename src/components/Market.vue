<script setup>
import { ref, onMounted, computed } from 'vue'
import { Search, TrendingUp, TrendingDown, Star } from 'lucide-vue-next'
import { getMarketData } from '../api/db.js'
import { syncMarketData } from '../api/finnhub.js'

const stocks = ref([])
const search = ref('')
const loading = ref(true)

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
      <h1 class="text-4xl font-extrabold">Market</h1>
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
            </tr>
          </thead>
          <tbody class="divide-y">
            <tr v-if="loading">
              <td colspan="4" class="px-6 py-6 text-center text-gray-500">Loading live market data...</td>
            </tr>

            <tr v-for="stock in filteredStocks" :key="stock.symbol" class="hover:bg-gray-50">
              <td class="px-6 py-4">
                <div class="flex items-center gap-4">
                  <img v-if="stock.logo" :src="stock.logo" class="w-10 h-10 rounded-full bg-white object-contain" />
                  <div v-else class="w-10 h-10 rounded-full bg-gray-200" />

                  <div>
                    <p class="font-semibold">{{ stock.description }}</p>
                    <p class="text-sm text-gray-500">{{ stock.symbol }}</p>
                  </div>
                </div>
              </td>

                            <td class="px-6 py-4 text-right font-medium">

                              {{ (stock.price !== null && stock.price !== undefined) ? `${Number(stock.price).toFixed(2)}` : '—' }}

                            </td>

              

                            <td

                              class="px-6 py-4 text-right font-medium"

                              :class="(stock.change !== null && stock.change !== undefined && stock.change >= 0) ? 'text-green-600' : 'text-red-600'"

                            >

                              <span v-if="stock.change !== null && stock.change !== undefined && Number.isFinite(stock.change)">

                                {{ stock.change >= 0 ? '+' : '' }}{{ Number(stock.change).toFixed(2) }}%

                              </span>

                              <span v-else>—</span>

                            </td>

              <td class="px-6 py-4 text-center">
                <button class="text-gray-400 hover:text-violet-700">
                  <Star class="w-5 h-5" />
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
