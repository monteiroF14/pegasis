<script setup>
import { useToastStore } from '@/stores/toast'
import { CheckCircle, XCircle, Info, X } from 'lucide-vue-next'

const toast = useToastStore()
</script>

<template>
  <Transition
    enter-active-class="transform transition duration-300 ease-out"
    enter-from-class="translate-y-10 opacity-0"
    enter-to-class="translate-y-0 opacity-100"
    leave-active-class="transition duration-200 ease-in"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0"
  >
    <div v-if="toast.visible" 
         class="fixed bottom-10 right-10 z-[9999] max-w-sm w-full bg-white rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-gray-100 p-5 flex items-center gap-4 overflow-hidden"
    >
      <!-- Progress Bar Animation -->
      <div class="absolute bottom-0 left-0 h-1 bg-violet-100 w-full">
        <div class="h-full bg-violet-600 w-full origin-left animate-[progress_3s_linear_forwards]" />
      </div>

      <div class="flex-shrink-0">
        <CheckCircle v-if="toast.type === 'success'" class="w-8 h-8 text-green-500" />
        <XCircle v-else-if="toast.type === 'error'" class="w-8 h-8 text-red-500" />
        <span v-else class="w-8 h-8 text-blue-500">
          <Info class="w-full h-full" />
        </span>
      </div>

      <div class="flex-1">
        <p class="text-sm font-semibold text-gray-900 leading-snug">
          {{ toast.message }}
        </p>
      </div>

      <button @click="toast.visible = false" class="text-gray-400 hover:text-gray-600 transition-colors p-1 hover:bg-gray-50 rounded-lg">
        <X class="w-5 h-5" />
      </button>
    </div>
  </Transition>
</template>

<style scoped>
@keyframes progress {
  from { transform: scaleX(1); }
  to { transform: scaleX(0); }
}
</style>
