import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { findUser, createUser } from '@/api/db'
import { fetchGithubUser, logout as githubLogout } from '@/login'

/** @typedef {import("@/types").User} User */

export const useSessionStore = defineStore('session', () => {
  /** @type {import('vue').Ref<User | null>} */
  const user = ref(null)
  const loading = ref(false)
  const error = ref(null)

  const isAuthenticated = computed(() => !!user.value)

  /**
   * Initializes the session by fetching the user data from DB using the GitHub token
   * @param {string} token 
   */
  async function login(token) {
    loading.value = true
    error.value = null
    try {
      const githubProfile = await fetchGithubUser(token)
      const userId = String(githubProfile.id)

      let dbUser = await findUser(userId)
      console.log("user in db: ", dbUser)

      if (!dbUser) {
        dbUser = await createUser({
          id: userId,
          name: githubProfile.name || githubProfile.login,
          avatarUrl: githubProfile.avatar_url
        })
        console.log("created user in db: ", dbUser)
      }

      user.value = dbUser
      return dbUser
    } catch (e) {
      error.value = e.message
      throw e
    } finally {
      loading.value = false
    }
  }

  function logout() {
    user.value = null
    githubLogout()
  }

  /**
   * Attempt to restore session from local storage token
   */
  async function init() {
    const token = localStorage.getItem('accessToken')
    if (token) {
      try {
        await login(token)
      } catch (e) {
        console.error("Failed to restore session:", e)
        logout()
      }
    }
  }

  /**
   * Refresh user data from database
   */
  async function refreshUser() {
    if (!user.value) return
    try {
      const updatedUser = await findUser(user.value.id)
      if (updatedUser) {
        user.value = updatedUser
      }
    } catch (e) {
      console.error('Failed to refresh user:', e)
    }
  }

  return {
    user,
    loading,
    error,
    isAuthenticated,
    login,
    logout,
    refreshUser,
    init
  }
})
