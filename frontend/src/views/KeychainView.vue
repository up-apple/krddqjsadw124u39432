<script setup>
import { ref } from 'vue'
import axios from 'axios'
import { useAuthStore } from '@/stores/auth'

const site = ref('')
const username = ref('')
const password = ref('')
const authStore = useAuthStore()

const handleAddItem = async () => {
  try {
    const keychainData = {
      site: site.value,
      username: username.value,
      password: password.value
    }
    await axios.post('/api/keychain', { keychainData }, {
      headers: {
        Authorization: `Bearer ${authStore.token}`
      }
    })
    // Clear form after successful submission
    site.value = ''
    username.value = ''
    password.value = ''
    alert('Item saved successfully!')
  } catch (error) {
    console.error('Error saving keychain item:', error)
    alert('Failed to save item.')
  }
}
</script>

<template>
  <div>
    <h1>Llavero</h1>
    <form @submit.prevent="handleAddItem" class="keychain-form">
      <div class="input-group">
        <label for="site">Sitio</label>
        <input type="text" id="site" v-model="site" required />
      </div>
      <div class="input-group">
        <label for="username">Usuario</label>
        <input type="text" id="username" v-model="username" required />
      </div>
      <div class="input-group">
        <label for="password">Contraseña</label>
        <input type="password" id="password" v-model="password" required />
      </div>
      <button type="submit">Guardar</button>
    </form>
  </div>
</template>

<style scoped>
.keychain-form {
  max-width: 400px;
  margin: 0 auto;
}

.input-group {
  margin-bottom: 1rem;
}

label {
  display: block;
  margin-bottom: 0.5rem;
}

input {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #444;
  border-radius: 4px;
  background-color: #333;
  color: #fff;
}

button {
  width: 100%;
  padding: 0.75rem;
  border: none;
  border-radius: 4px;
  background-color: #007bff;
  color: #fff;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.3s;
}

button:hover {
  background-color: #0056b3;
}
</style>