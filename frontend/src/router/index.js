import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const routes = [
  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/LoginView.vue')
  },
  {
    path: '/',
    name: 'dashboard',
    component: () => import('@/views/DashboardLayout.vue'),
    children: [
      {
        path: 'files',
        name: 'files',
        component: () => import('@/views/FilesView.vue')
      },
      {
        path: 'keychain',
        name: 'keychain',
        component: () => import('@/views/KeychainView.vue')
      },
      {
        path: 'admin',
        name: 'admin',
        component: () => import('@/views/AdminView.vue')
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()

  if (!authStore.isAuthenticated && to.name !== 'login') {
    next({ name: 'login' })
  } else if (authStore.isAuthenticated && to.name === 'login') {
    next({ path: '/files' })
  } else {
    next()
  }
})

export default router
