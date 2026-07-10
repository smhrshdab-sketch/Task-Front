<!-- src/components/Navbar.vue -->
<script setup lang="ts">
  import { ref } from 'vue'
  import { useRouter } from 'vue-router'
  import axios from 'axios'  
  interface Props {
    links?: Array<{ name: string; path: string; icon?: string }>
    isLoggedIn?: boolean
    logo?: { visible: boolean; src?: string; alt?: string; link?: string }
    userName?: string
    userAvatar?: string
  }

  const props = withDefaults(defineProps<Props>(), {
    links: () => [],
    isLoggedIn: false,
    logo: () => ({ visible: true, src: '', alt: 'Logo', link: '/' }),
    userName: '',
    userAvatar: ''
  })
  const API_URL = import.meta.env.VITE_API_URL
  const emit = defineEmits<{
    (e: 'login'): void
    (e: 'navigate', path: string): void
  }>()

  const router = useRouter()
  const isLoggingOut = ref(false)

  const handleLogout = async () => {
    if (isLoggingOut.value) return
    
    isLoggingOut.value = true
    
    try {
      const token = localStorage.getItem('access_token')
      
      if (token) {
        await axios.post(`${API_URL}/api/logout`, {}, {
          headers: { 'Authorization': `Bearer ${token}` }
        }).catch(() => {})
      }
    } finally {
      localStorage.clear()
      isLoggingOut.value = false
      router.push('/login')
    }
  }
</script>

<template>
  <nav class="w-full bg-linear-to-r from-green-200 to-emerald-200 shadow-lg">
    <div class="container mx-auto px-4">
      <div class="flex justify-between items-center py-3">
        <!-- Logo -->
        <div v-if="logo.visible" class="flex items-center gap-1">
          <img class="w-16 h-16 rounded-full object-cover shadow-2xl" :src="logo.src"  :alt="logo.alt">
          <a :href="logo.link" class="text-2xl font-bold text-emerald-800">
            {{ logo.alt }}
          </a>
        </div>

        <!-- Navigation Links -->
        <ul class="md:flex space-x-6">
          <li v-for="(link, index) in links" :key="index">
            <a 
              href="#"
              @click.prevent="emit('navigate', link.path)"
              class="text-gray-700 hover:text-emerald-700 transition-colors"
            >
              <span v-if="link.icon" class="mr-1">{{ link.icon }}</span>
              {{ link.name }}
            </a>
          </li>
        </ul>

        <!-- Auth Section -->
        <div class="flex items-center space-x-4">
          <div v-if="isLoggedIn" class="flex items-center space-x-3">
            <div class="relative flex flex-row">
              <p class="p-3 text-2xl">{{ userName.toUpperCase()}}</p>
                <img 
                  v-if="userAvatar" 
                  :src="userAvatar" 
                  alt="Avatar"
                  class="w-16 h-16 rounded-full object-cover border-2 border-white"
                  @error="(e) => {
                    console.error('Avatar failed to load:', userAvatar);
                    (e.target as HTMLImageElement).style.display = 'none'
                  }"
                />                
              </div>
            <button 
              @click="handleLogout"
              :disabled="isLoggingOut"
              class="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 
                     transition-colors disabled:opacity-50"
            >
              {{ isLoggingOut ? 'Logging out...' : 'Logout' }}
            </button>
          </div>
          <div v-else>
            <button 
              @click="emit('login')"
              class="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
            >
              Login
            </button>
          </div>
        </div>
      </div>
    </div>
  </nav>
</template>