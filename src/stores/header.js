import { defineStore } from 'pinia'

export const useHeaderStore = defineStore('header', {
  state: () => ({
    activeItem: '',
  }),
  actions: {
    setActiveItem(item) {
      this.activeItem = item
    },
  },
})
