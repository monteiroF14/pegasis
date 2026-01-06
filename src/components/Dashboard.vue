<script setup>
import { ref, computed } from 'vue'
import { Line, Bar } from 'vue-chartjs'
import {
  Chart as ChartJS,
  LineElement,
  BarElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend
} from 'chart.js'

ChartJS.register(
  LineElement,
  BarElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend
)

// ---- TIME RANGES ----
const ranges = ['1D', '1W', '1M', '3M', '6M', '1Y', '5Y', 'ALL']
const selectedRange = ref('1M')

// ---- MOCK PERFORMANCE DATA (depois vem da store/backend) ----
const performanceData = {
  '1D': [0, 120, 80, 200],
  '1W': [0, 300, 250, 400, 380, 520, 610],
  '1M': [0, 200, 150, 400, 600, 750, 900, 1200],
  '3M': [0, 500, 300, 800, 1200, 1600, 2000],
  '6M': [0, 800, 1200, 1800, 2400, 3000],
  '1Y': [0, 1200, 2000, 2800, 3500, 4200],
  '5Y': [0, 2000, 4000, 7000, 11000],
  'ALL': [0, 500, 1500, 3000, 6000, 12000]
}

const labelsMap = {
  '1D': ['Open', '10h', '13h', 'Close'],
  '1W': ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
  '1M': ['W1', 'W2', 'W3', 'W4'],
  '3M': ['M1', 'M2', 'M3'],
  '6M': ['M1', 'M2', 'M3', 'M4', 'M5', 'M6'],
  '1Y': ['Q1', 'Q2', 'Q3', 'Q4'],
  '5Y': ['Y1', 'Y2', 'Y3', 'Y4', 'Y5'],
  'ALL': ['Start', 'Y2', 'Y3', 'Y4', 'Now']
}

// ---- COMPUTEDS ----
const pnl = computed(() => {
  const data = performanceData[selectedRange.value]
  return data[data.length - 1]
})

const performancePct = computed(() => {
  const data = performanceData[selectedRange.value]
  return ((data[data.length - 1] - data[0]) / (data[0] || 1)) * 100
})

const lineChartData = computed(() => ({
  labels: labelsMap[selectedRange.value],
  datasets: [
    {
      label: 'Portfolio Value ($)',
      data: performanceData[selectedRange.value],
      borderColor: '#7c3aed',
      backgroundColor: 'rgba(124, 58, 237, 0.15)',
      fill: true,
      tension: 0.4
    }
  ]
}))

const barChartData = computed(() => ({
  labels: labelsMap[selectedRange.value],
  datasets: [
    {
      label: 'PNL ($)',
      data: performanceData[selectedRange.value].map((v, i, arr) => i === 0 ? 0 : v - arr[i - 1]),
      backgroundColor: '#a78bfa'
    }
  ]
}))
</script>

<template>
  <div class="bg-gray-50 min-h-screen">
    <div class="w-4/5 mx-auto pt-10 pb-20">
      <h1 class="text-4xl font-extrabold">Dashboard</h1>
      <p class="text-gray-600 mt-2">Portfolio performance overview.</p>

      <!-- RANGE SELECTOR -->
      <div class="flex flex-wrap gap-3 mt-8">
        <button
          v-for="r in ranges"
          :key="r"
          @click="selectedRange = r"
          class="px-4 py-2 rounded-lg text-sm font-medium"
          :class="selectedRange === r ? 'bg-violet-700 text-white' : 'bg-white text-gray-600 hover:bg-gray-100'"
        >
          {{ r }}
        </button>
      </div>

      <!-- KPIs -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">
        <div class="bg-white rounded-2xl p-6 shadow-sm">
          <p class="text-gray-500 text-sm">Total PNL</p>
          <p class="text-3xl font-bold mt-2 text-green-600">${{ pnl.toFixed(2) }}</p>
        </div>

        <div class="bg-white rounded-2xl p-6 shadow-sm">
          <p class="text-gray-500 text-sm">Performance</p>
          <p
            class="text-3xl font-bold mt-2"
            :class="performancePct >= 0 ? 'text-green-600' : 'text-red-600'"
          >
            {{ performancePct.toFixed(2) }}%
          </p>
        </div>

        <div class="bg-white rounded-2xl p-6 shadow-sm">
          <p class="text-gray-500 text-sm">Selected Period</p>
          <p class="text-3xl font-bold mt-2">{{ selectedRange }}</p>
        </div>
      </div>

      <!-- CHARTS -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-12">
        <div class="bg-white rounded-2xl p-6 shadow-sm">
          <h2 class="font-bold mb-4">Portfolio Value</h2>
          <Line :data="lineChartData" />
        </div>

        <div class="bg-white rounded-2xl p-6 shadow-sm">
          <h2 class="font-bold mb-4">PNL Breakdown</h2>
          <Bar :data="barChartData" />
        </div>
      </div>
    </div>
  </div>
</template>