<!-- src/views/Dashboard.vue -->
<script setup lang="ts">
  import { ref, onMounted,computed } from 'vue'
  import { useRouter } from 'vue-router'
  import Navbar from '../components/Navbar.vue'
  import logoImage from '@/assets/logo.png'
  import axios from 'axios'

  const router = useRouter()
  const user = ref(null)
  const isLoading = ref(true)
  const API_URL = 'http://localhost:8000/api'
  const avatare_path = 'http://localhost:8000/storage/'

  // Check if user is logged in
  onMounted(async () => {
    const token = localStorage.getItem('access_token')
    
    if (!token) {
      router.push('/login')
      return
    }
    const x_dep_id = localStorage.getItem('X-Department-Id')
    if (!x_dep_id) {
        console.log('Be careful: X-Department-Id is not set')
    }    
    
    try {
      // Get user info from backend
      const response = await axios.get('http://localhost:8000/api/me', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'X-Department-Id': x_dep_id
        }
      })   
      //console.log('Keys in response.data:', Object.keys(response.data))
      user.value = response.data.data.original
      localStorage.setItem('user', JSON.stringify(user.value))
      console.log(`[Dashboard] user : `,user)
    } 
    catch (error) {
      console.error('Failed to load user:', error)
      localStorage.removeItem('access_token')
      router.push('/login')
    } 
    finally {
      isLoading.value = false
    }
  })
  const userAvatarUrl = computed(() => {
    if (!user.value?.avatar_path) {
      return null
    }
    // The storage link makes files available at /storage/ path
    return `http://localhost:8000/storage/${user.value.avatar_path}`
  })

  // Navigation handler
  const handleNavigate = (path: string) => {
    router.push(path)
  }

  // Login handler (if needed)
  const handleLogin = () => {
    router.push('/login')
  }
</script>

<template>
  <div>
    <!-- Navbar appears ONLY on dashboard and protected pages 📋-->
    <Navbar 
      :links="[
        { name: 'Department', path: '/department', icon: '🏛️' },
        { name: 'role', path: '/roles', icon: '🔑' },
        { name: 'Tasks', path: '/tasks', icon: '👩‍🏫' },
        { name: 'Profile', path: `/account/${user?.id}`, icon: '👤' },
        { name: 'Membership', path: '/memberships', icon: '👔' },
        { name: 'Records', path: '/records', icon: '🎙️' }
      ]"
      :isLoggedIn="true"
      :logo="{ visible: true,src:'logo.png', alt: 'MyApp' }"
      :userName="user?.name || ''"
      :userAvatar=userAvatarUrl
      @navigate="handleNavigate"
      @login="handleLogin"
    />
    
    <div class="container mx-auto px-4 py-8">
      <div v-if="isLoading" class="text-center py-8">
        Loading...
      </div>
      
      <div v-else class="bg-white rounded-lg shadow-md p-6">
        <h1 class="text-2xl font-bold text-gray-800 mb-4">
          Welcome back, {{ user?.name }}!
        </h1>
        <p class="text-gray-600">
          You have successfully logged in.
        </p>
      </div>
    </div>
  </div>
</template>