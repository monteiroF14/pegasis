import { defineStore } from 'pinia'
import { computed } from 'vue'
import { useSessionStore } from './session'

export const useWishlistStore = defineStore('wishlist', () => {
  const sessionStore = useSessionStore()

  const items = computed(() => sessionStore.user?.watchlist || [])

  /**
   * Toggles a symbol in the wishlist and updates user store/DB
   * @param {string} symbol 
   */
  async function toggle(symbol) {
    if (!sessionStore.isAuthenticated) {
      console.warn('User must be logged in to update wishlist')
      return
    }
    await sessionStore.toggleWatchlist(symbol)
  }

  /**
   * Checks if a symbol is in the wishlist
   * @param {string} symbol 
   * @returns {boolean}
   */
  function isInWishlist(symbol) {
    return items.value.includes(symbol)
  }

  return {
    items,
    toggle,
    isInWishlist
  }
})