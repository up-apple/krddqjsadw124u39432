<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { useAuthStore } from '@/stores/auth'

const files = ref([])
const error = ref(null)
const authStore = useAuthStore()

const fetchFiles = async () => {
  try {
    const response = await axios.get('/api/files', {
      headers: {
        Authorization: `Bearer ${authStore.token}`
      }
    })
    files.value = response.data.files
  } catch (err) {
    error.value = 'Error fetching files: ' + (err.response?.data?.message || err.message)
  }
}

onMounted(fetchFiles)
</script>

<template>
  <div>
    <h1>Mis Archivos</h1>
    <div v-if="error" class="error">{{ error }}</div>
    <ul v-else-if="files.length">
      <li v-for="file in files" :key="file">{{ file }}</li>
    </ul>
    <p v-else>No files found.</p>
  </div>
</template>

<style scoped>
.error {
  color: red;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  background-color: #2a2a2a;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  margin-bottom: 0.5rem;
}
</style>