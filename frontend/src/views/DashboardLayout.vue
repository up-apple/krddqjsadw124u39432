<script setup>
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'

const authStore = useAuthStore()
const router = useRouter()

const handleLogout = () => {
  authStore.logout()
  router.push('/login')
}
</script>

<template>
  <div class="dashboard-layout">
    <aside class="sidebar">
      <nav>
        <RouterLink to="/files">Archivos</RouterLink>
        <RouterLink to="/keychain">Llavero</RouterLink>
        <RouterLink to="/admin">Admin</RouterLink>
      </nav>
      <button @click="handleLogout">Cerrar Sesión</button>
    </aside>
    <main class="main-content">
      <RouterView />
    </main>
  </div>
</template>

<style scoped>
.dashboard-layout {
  display: flex;
  height: 100vh;
  background-color: #1a1a1a;
  color: #fff;
}

.sidebar {
  width: 250px;
  background-color: #2a2a2a;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

nav {
  display: flex;
  flex-direction: column;
}

nav a {
  color: #fff;
  text-decoration: none;
  padding: 0.75rem 1rem;
  border-radius: 4px;
  margin-bottom: 0.5rem;
  transition: background-color 0.3s;
}

nav a:hover,
nav a.router-link-exact-active {
  background-color: #3a3a3a;
}

.main-content {
  flex-grow: 1;
  padding: 2rem;
  overflow-y: auto;
}

button {
  width: 100%;
  padding: 0.75rem;
  border: none;
  border-radius: 4px;
  background-color: #dc3545;
  color: #fff;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.3s;
}

button:hover {
  background-color: #c82333;
}
</style>