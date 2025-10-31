import { defineStore } from 'pinia'
import axios from 'axios'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: null,
    user: null
  }),
  getters: {
    isAuthenticated: (state) => !!state.token
  },
  actions: {
    async login(username, password) {
      try {
        const response = await axios.post('/api/auth/login', { username, password })
        this.token = response.data.token
        this.user = { id: response.data.userId } // Storing userId in user object
        return true
      } catch (error) {
        console.error('Login failed:', error)
        this.token = null
        this.user = null
        return false
      }
    },
    logout() {
      this.token = null
      this.user = null
    }
  }
})
