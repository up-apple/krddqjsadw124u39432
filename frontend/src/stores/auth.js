import { defineStore } from 'pinia'
import axios from 'axios'
import router from '@/router'

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
        // Assuming the user object is also returned in the response
        // this.user = response.data.user; 
      } catch (error) {
        console.error('Login failed:', error)
        // Handle login failure (e.g., show an error message)
      }
    },
    logout() {
      this.token = null
      this.user = null
      router.push('/login')
    }
  }
})