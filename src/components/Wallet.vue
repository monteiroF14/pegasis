<script setup>
import { ref, computed } from 'vue'
import { Pie } from 'vue-chartjs'
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'
import { Plus, Trash2 } from 'lucide-vue-next'

ChartJS.register(ArcElement, Tooltip, Legend)

// --- STATE ---
const showBuyForm = ref(false)
const showSellForm = ref(false)
const selectedSell = ref(null)

const buyForm = ref({ symbol: '', name: '', invested: 0, current: 0 })
const sellForm = ref({ price: 0 })

// Ativos atuais
const holdings = ref([
  { id: 1, symbol: 'AAPL', name: 'Apple Inc.', invested: 2500, current: 3120 },
  { id: 2, symbol: 'TSLA', name: 'Tesla Inc.', invested: 1200, current: 1540 }
])

// Histórico
const history = ref([])

// --- COMPUTEDS ---
const totalCurrent = computed(() =>
  holdings.value.reduce((sum, s) => sum + s.current, 0)
)

const chartData = computed(() => ({
  labels: holdings.value.map(s => s.symbol),
  datasets: [{
    data: holdings.value.map(s => s.current),
    backgroundColor: ['#7c3aed', '#6366f1', '#a78bfa', '#8b5cf6'],
    borderWidth: 0
  }]
}))

// --- ACTIONS ---
const addBuy = () => {
  holdings.value.push({
    id: Date.now(),
    ...buyForm.value
  })
  history.value.push({ type: 'BUY', ...buyForm.value, date: new Date() })
  buyForm.value = { symbol: '', name: '', invested: 0, current: 0 }
  showBuyForm.value = false
}

const removeHolding = (id) => {
  holdings.value = holdings.value.filter(h => h.id !== id)
}

const openSell = (stock) => {
  selectedSell.value = stock
  showSellForm.value = true
}

const confirmSell = () => {
  history.value.push({
    type: 'SELL',
    symbol: selectedSell.value.symbol,
    name: selectedSell.value.name,
    invested: selectedSell.value.invested,
    sold: sellForm.value.price,
    pnl: sellForm.value.price - selectedSell.value.invested,
    date: new Date()
  })
  holdings.value = holdings.value.filter(h => h.id !== selectedSell.value.id)
  sellForm.value.price = 0
  showSellForm.value = false
}
</script>

<template>
  <div class="bg-gray-50 min-h-screen">
    <div class="w-4/5 mx-auto pt-10 pb-20">
      <div class="flex justify-between items-center">
        <div>
          <h1 class="text-4xl font-extrabold">Wallet</h1>
          <p class="text-gray-600 mt-2">Your current holdings and trade history.</p>
        </div>
        <button
          @click="showBuyForm = true"
          class="flex items-center gap-2 bg-violet-700 hover:bg-violet-800 text-white px-5 py-3 rounded-xl"
        >
          <Plus class="w-5 h-5" /> Add Buy
        </button>
      </div>

      <!-- BUY FORM -->
      <div v-if="showBuyForm" class="bg-white rounded-2xl shadow-sm p-6 mt-8">
        <h2 class="font-bold text-lg mb-4">Register Buy</h2>
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <input v-model="buyForm.symbol" placeholder="Symbol" class="input" />
          <input v-model="buyForm.name" placeholder="Company" class="input" />
          <input v-model.number="buyForm.invested" placeholder="Invested $" type="number" class="input" />
          <input v-model.number="buyForm.current" placeholder="Current Value $" type="number" class="input" />
        </div>
        <div class="flex gap-4 mt-4">
          <button @click="addBuy" class="bg-violet-700 text-white px-5 py-2 rounded-lg">Save</button>
          <button @click="showBuyForm = false" class="text-gray-500">Cancel</button>
        </div>
      </div>

      <!-- TOP -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-10">
        <div class="bg-white rounded-2xl shadow-sm p-6">
          <h2 class="font-bold mb-4">Allocation</h2>
          <Pie :data="chartData" />
          <p class="text-center text-sm text-gray-500 mt-4">
            Total value: <span class="font-semibold">${{ totalCurrent.toFixed(2) }}</span>
          </p>
        </div>

        <!-- HOLDINGS -->
        <div class="bg-white rounded-2xl shadow-sm overflow-hidden lg:col-span-2">
          <table class="w-full">
            <thead class="bg-gray-100 text-sm text-gray-600">
              <tr>
                <th class="text-left px-6 py-4">Stock</th>
                <th class="text-right px-6 py-4">Invested</th>
                <th class="text-right px-6 py-4">Current</th>
                <th class="text-right px-6 py-4">PNL</th>
                <th class="text-center px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y">
              <tr v-for="s in holdings" :key="s.id" class="hover:bg-gray-50">
                <td class="px-6 py-4 font-medium">{{ s.name }}<span class="block text-sm text-gray-500">{{ s.symbol }}</span></td>
                <td class="px-6 py-4 text-right">${{ s.invested }}</td>
                <td class="px-6 py-4 text-right">${{ s.current }}</td>
                <td
                  class="px-6 py-4 text-right font-semibold"
                  :class="s.current - s.invested >= 0 ? 'text-green-600' : 'text-red-600'"
                >
                  ${{ (s.current - s.invested).toFixed(2) }}
                </td>
                <td class="px-6 py-4 flex justify-center gap-4">
                  <button @click="openSell(s)" class="text-violet-700">Sell</button>
                  <button @click="removeHolding(s.id)" class="text-red-600">
                    <Trash2 class="w-5 h-5" />
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- SELL FORM -->
      <div v-if="showSellForm" class="bg-white rounded-2xl shadow-sm p-6 mt-10">
        <h2 class="font-bold mb-4">Sell {{ selectedSell.symbol }}</h2>
        <input
          v-model.number="sellForm.price"
          type="number"
          placeholder="Sell value $"
          class="input mb-4"
        />
        <div class="flex gap-4">
          <button @click="confirmSell" class="bg-red-600 text-white px-5 py-2 rounded-lg">Confirm Sell</button>
          <button @click="showSellForm = false" class="text-gray-500">Cancel</button>
        </div>
      </div>

      <!-- HISTORY -->
      <div class="bg-white rounded-2xl shadow-sm mt-12 overflow-hidden">
        <h2 class="font-bold text-lg px-6 py-4">Trade History</h2>
        <table class="w-full">
          <thead class="bg-gray-100 text-sm text-gray-600">
            <tr>
              <th class="px-6 py-3 text-left">Type</th>
              <th class="px-6 py-3 text-left">Stock</th>
              <th class="px-6 py-3 text-right">Value</th>
              <th class="px-6 py-3 text-right">PNL</th>
              <th class="px-6 py-3 text-right">Date</th>
            </tr>
          </thead>
          <tbody class="divide-y">
            <tr v-for="(h, i) in history" :key="i">
              <td class="px-6 py-3 font-medium">{{ h.type }}</td>
              <td class="px-6 py-3">{{ h.symbol }}</td>
              <td class="px-6 py-3 text-right">${{ h.type === 'BUY' ? h.invested : h.sold }}</td>
              <td
                class="px-6 py-3 text-right"
                :class="h.pnl >= 0 ? 'text-green-600' : 'text-red-600'"
              >
                {{ h.pnl ? `$${h.pnl.toFixed(2)}` : '—' }}
              </td>
              <td class="px-6 py-3 text-right text-gray-500">
                {{ new Date(h.date).toLocaleDateString() }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
