<script setup>
import { ref, onMounted, computed } from 'vue'
import { Search, TrendingUp, TrendingDown, Star } from 'lucide-vue-next'
import { upsertMarket } from '../api/db.js'

const API_KEY = import.meta.env.VITE_FINNHUB_API_KEY

const stocks = ref([])
const search = ref('')
const loading = ref(true)

// Lista curada das stocks mais relevantes (mega caps, S&P 500 leaders, tech, finance, energy)
const RELEVANT_SYMBOLS = [
  'AAPL','MSFT','GOOGL','AMZN','NVDA','META','TSLA','BRK.B','JPM','V','MA','UNH','XOM','LLY','JNJ','WMT','PG','AVGO','HD','COST','PEP','KO','MRK','ABBV','BAC','ORCL','CVX','ADBE','CRM','NFLX','AMD','INTC','QCOM','TXN','IBM','CSCO','INTU','AMAT','GE','CAT','BA','MMM','UPS','FDX','RTX','LMT','NKE','DIS','MCD','SBUX','PFE','TMO','ABT','DHR','MDT','GS','MS','BLK','AXP','C','SCHW','SPGI','ICE','CME','BKNG','UBER','LYFT','PYPL','SQ','SHOP','SNOW','PLTR','NOW','ZM','DOCU','PANW','CRWD','ZS','OKTA','NET','DDOG','MDB','TWLO','ETSY','EBAY','BABA','TSM','ASML','SAP','SONY','NTDOY','TM','HMC','BP','SHEL','TOT','RIO','BHP','VALE','NVO','AZN','GSK','SAN','BBVA','ING','UBS','DB','BNP.PA','AIR.PA','MC.PA','OR.PA','ADS.DE','BMW.DE','MBG.DE','VOW3.DE'
]

// Fetch only relevant stocks
const fetchStocks = async () => {
  try {
    const enriched = await Promise.all(
      RELEVANT_SYMBOLS.slice(0, 200).map(async (symbol) => {
        try {
          const [quoteRes, profileRes] = await Promise.all([
            fetch(`https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${API_KEY}`),
            fetch(`https://finnhub.io/api/v1/stock/profile2?symbol=${symbol}&token=${API_KEY}`)
          ])

          if (!quoteRes.ok || !profileRes.ok) {
            throw new Error(`API error: ${quoteRes.status} / ${profileRes.status}`)
          }

          const quote = await quoteRes.json()
          const profile = await profileRes.json()

          // Finnhub sometimes returns empty/null fields even on 200 OK
          if (!quote || quote.c === undefined || quote.c === null) {
            throw new Error(`Invalid data for ${symbol}`)
          }

          const stockData = {
            id: symbol,
            symbol,
            description: profile.name || symbol,
            price: quote.c,
            change: quote.dp,
            logo: profile.logo || `https://logo.clearbit.com/${profile.weburl?.replace('https://','').replace('http://','')}`,
            ...quote,
            ...profile
          }
          
          upsertMarket(stockData).catch(err => console.error('DB Save Error', symbol, err))

          return stockData
        } catch {
          return { symbol, description: symbol, price: null, change: null, logo: null }
        }
      })
    )

    stocks.value = enriched.filter(s => s.price)
  } catch (e) {
    console.error('Market fetch error', e)
  } finally {
    loading.value = false
  }
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
        <input
          v-model="search"
          type="text"
          placeholder="Search by company or ticker"
          class="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-violet-500"
        />
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
                  <img
                    v-if="stock.logo"
                    :src="stock.logo"
                    class="w-10 h-10 rounded-full bg-white object-contain"
                  />
                  <div v-else class="w-10 h-10 rounded-full bg-gray-200" />

                  <div>
                    <p class="font-semibold">{{ stock.description }}</p>
                    <p class="text-sm text-gray-500">{{ stock.symbol }}</p>
                  </div>
                </div>
              </td>

              <td class="px-6 py-4 text-right font-medium">
                {{ stock.price ? `$${stock.price.toFixed(2)}` : '—' }}
              </td>

              <td
                class="px-6 py-4 text-right font-medium"
                :class="stock.change >= 0 ? 'text-green-600' : 'text-red-600'"
              >
                <span v-if="stock.change !== null">
                  {{ stock.change >= 0 ? '+' : '' }}{{ stock.change.toFixed(2) }}%
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
