<script setup lang="ts">
  import { ref } from 'vue'
  import { useRouter } from 'vue-router'

  const email = ref('')
  const password = ref('')
  const isLoading = ref(false)
  const errorMessage = ref('')
  const router = useRouter()

  // task_api API URL
  const API_URL = 'http://localhost:8000/api'

  const handleSubmit = async () => {
    errorMessage.value = ''
    isLoading.value = true

    try {
      const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          email: email.value,
          password: password.value
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Login failed')
      }

      // Store JWT token
      console.log(`[Login-ifff] data: `,data)
      localStorage.setItem('access_token', data.access_token)
      localStorage.setItem('token_type', data.token_type)
      localStorage.setItem('expires_in', data.expires_in.toString())
      localStorage.setItem('X-Department-Id', data.department.toString())
      
      // Store user info
      if (data.user) {
        console.log(`[Login-if] data and user data : `,data,data.user)
        localStorage.setItem('user', JSON.stringify(data.user))
      }
        console.log(`[Login] data and user data : `,data,data.user)
      
      // Set default authorization header for future requests
      // We'll create an axios instance for this
      
      // Redirect to dashboard
      router.push('/dashboard')
      
    } catch (error: any) {
      errorMessage.value = error.message || 'Invalid email or password'
      console.error('Login error:', error)
    } finally {
      isLoading.value = false
    }
  }
  // Navigate to register page
  const goToRegister = () => {
    router.push('/register')
  }
</script>

<template>
  <div class="min-h-screen w-full flex justify-center items-center bg-linear-to-br from-blue-50 to-blue-100 p-4">
    <div class="w-full max-w-md bg-white rounded-2xl shadow-xl p-6 md:p-8">
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-gray-800">Welcome Back</h1>
        <p class="text-gray-500 mt-2">Please sign in to your account</p>
      </div>
      
      <!-- Error Message -->
      <div v-if="errorMessage" class="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
        {{ errorMessage }}
      </div>
      
      <form @submit.prevent="handleSubmit" class="flex flex-col gap-6">
        <!-- Email Field -->
        <div class="flex flex-col gap-2">
          <label for="email" class="text-sm font-semibold text-gray-700 hidden sm:block">
            Email Address
          </label>
          
          <div class="relative">
            <div class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 sm:hidden">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
              </svg>
            </div>
            <input 
              id="email"
              v-model="email"
              type="email" 
              class="w-full p-3 pl-10 sm:pl-3 text-gray-800 bg-gray-50 border border-gray-200 rounded-lg 
                     focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent
                     transition-all duration-200"
              placeholder="someone@example.com"
              required
            >
          </div>
        </div>

        <!-- Password Field -->
        <div class="flex flex-col gap-2">
          <div class="flex justify-between items-center hidden sm:flex">
            <label for="password" class="text-sm font-semibold text-gray-700">
              Password
            </label>
            <a href="#" class="text-sm text-emerald-600 hover:text-emerald-700 transition-colors">
              Forgot password?
            </a>
          </div>
          
          <div class="relative">
            <div class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 sm:hidden">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
              </svg>
            </div>
            <input 
              id="password"
              v-model="password"
              type="password" 
              class="w-full p-3 pl-10 sm:pl-3 text-gray-800 bg-gray-50 border border-gray-200 rounded-lg 
                     focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent
                     transition-all duration-200"
              placeholder="Enter your password"
              required
            >
          </div>
          
          <a href="#" class="text-sm text-emerald-600 hover:text-emerald-700 text-right sm:hidden mt-1">
            Forgot password?
          </a>
        </div>

        <button 
          type="submit"
          :disabled="isLoading"
          class="mt-4 p-3 text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 
                 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2
                 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed
                 font-semibold text-lg"
        >
          <span v-if="!isLoading">Sign In</span>
          <span v-else class="flex items-center justify-center gap-2">
            <svg class="animate-spin h-5 w-5" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Signing in...
          </span>
        </button>

        <p class="text-center text-gray-600 text-sm">
          Don't have an account?
          <button 
            @click="goToRegister"
            class="text-emerald-600 hover:text-emerald-700 font-semibold ml-1"
          >
            Create Account
          </button>
        </p>
      </form>
    </div>
  </div>
</template>