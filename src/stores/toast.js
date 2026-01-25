import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useToastStore = defineStore('toast', () => {
  const message = ref('')
  const type = ref('success') // 'success' | 'error' | 'info'
  const visible = ref(false)
  const timeout = ref(null)

  function show(msg, toastType = 'success') {
    if (timeout.value) clearTimeout(timeout.value)
    
    message.value = msg
    type.value = toastType
    visible.value = true

    timeout.value = setTimeout(() => {
      visible.value = false
    }, 3000)
  }

  return { message, type, visible, show }
})
