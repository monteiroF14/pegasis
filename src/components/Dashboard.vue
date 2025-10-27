<template>
  <div class="container mx-auto px-4 py-8">
  <div class="mx-auto p-4">
    <div class="grid grid-cols-1 gap-4">
      <div class="bg-white p-4 rounded-lg shadow">
        <div class="chart-container" style="position: relative; height:40vh; width:80vw">
          <bar-chart :chart-data="chartData" :chart-options="chartOptions"></bar-chart>
        </div>
      </div>
    </div>
  </div>
  </div>
</template>

<script>
import BarChart from './ui/chart/BarChart.vue'

export default {
  name: 'Dashboard',
  components: {
    BarChart
  },
  data() {
    return {
      chartData: {
        labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
        datasets: [
          {
            label: 'Sales',
            backgroundColor: '#4F46E5',
            data: [65, 59, 80, 81, 56, 55, 40]
          }
        ]
      },
      chartOptions: {
        responsive: true,
        maintainAspectRatio: true
      }
    }
  }
}
</script>
