<!-- src/views/Register.vue -->
<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const name = ref('')
const email = ref('')
const password = ref('')
const passwordConfirmation = ref('')
const isLoading = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

const router = useRouter()
const API_URL = import.meta.env.VITE_API_URL

const handleRegister = async () => {
  errorMessage.value = ''
  successMessage.value = ''
  
  // Validation
  if (password.value !== passwordConfirmation.value) {
    errorMessage.value = 'Passwords do not match'
    return
  }
  
  if (password.value.length < 6) {
    errorMessage.value = 'Password must be at least 6 characters'
    return
  }
  
  isLoading.value = true

  try {
    const response = await fetch(`${API_URL}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        name: name.value,
        email: email.value,
        password: password.value
      })
    })

    const data = await response.json()

    if (response.ok) {
      // Auto-login after registration
      localStorage.setItem('access_token', data.access_token)
      localStorage.setItem('token_type', data.token_type)//X-Department-Id
      localStorage.setItem('X-Department-Id', "1")
      
      if (data.user) {
        localStorage.setItem('user', JSON.stringify(data.user))
      }
      
      successMessage.value = 'Account created successfully! Redirecting...'
      
      // Redirect to dashboard after 1 second
      setTimeout(() => {
        router.push('/dashboard')
      }, 1000)
    } else {
      errorMessage.value = data.message || 'Registration failed'
      if (data.errors) {
        errorMessage.value = Object.values(data.errors).flat().join(', ')
      }
    }
  } catch (error) {
    errorMessage.value = 'Cannot connect to server'
    console.error(error)
  } finally {
    isLoading.value = false
  }
}

const goToLogin = () => {
  router.push('/login')
}
</script>

<template>
  <div class="min-h-screen w-full flex justify-center items-center bg-gradient-to-br from-green-50 to-emerald-100 p-4">
    <div class="w-full max-w-md bg-white rounded-2xl shadow-xl p-6 md:p-8">
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-gray-800">Create Account</h1>
        <p class="text-gray-500 mt-2">Join us today</p>
      </div>
      
      <!-- Success Message -->
      <div v-if="successMessage" class="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-lg">
        {{ successMessage }}
      </div>
      
      <!-- Error Message -->
      <div v-if="errorMessage" class="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
        {{ errorMessage }}
      </div>
      
      <form @submit.prevent="handleRegister" class="flex flex-col gap-6">
        <!-- Name -->
        <div class="flex flex-col gap-2">
          <label class="text-sm font-semibold text-gray-700">Full Name</label>
          <input 
            v-model="name"
            type="text" 
            class="w-full p-3 text-gray-800 bg-gray-50 border border-gray-200 rounded-lg 
                   focus:outline-none focus:ring-2 focus:ring-emerald-500"
            placeholder="John Doe"
            required
          >
        </div>

        <!-- Email -->
        <div class="flex flex-col gap-2">
          <label class="text-sm font-semibold text-gray-700">Email Address</label>
          <input 
            v-model="email"
            type="email" 
            class="w-full p-3 text-gray-800 bg-gray-50 border border-gray-200 rounded-lg 
                   focus:outline-none focus:ring-2 focus:ring-emerald-500"
            placeholder="someone@example.com"
            required
          >
        </div>

        <!-- Password -->
        <div class="flex flex-col gap-2">
          <label class="text-sm font-semibold text-gray-700">Password</label>
          <input 
            v-model="password"
            type="password" 
            class="w-full p-3 text-gray-800 bg-gray-50 border border-gray-200 rounded-lg 
                   focus:outline-none focus:ring-2 focus:ring-emerald-500"
            placeholder="At least 6 characters"
            required
          >
        </div>

        <!-- Confirm Password -->
        <div class="flex flex-col gap-2">
          <label class="text-sm font-semibold text-gray-700">Confirm Password</label>
          <input 
            v-model="passwordConfirmation"
            type="password" 
            class="w-full p-3 text-gray-800 bg-gray-50 border border-gray-200 rounded-lg 
                   focus:outline-none focus:ring-2 focus:ring-emerald-500"
            placeholder="Confirm your password"
            required
          >
        </div>

        <button 
          type="submit"
          :disabled="isLoading"
          class="mt-4 p-3 text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 
                 transition-all duration-200 disabled:opacity-50 font-semibold text-lg"
        >
          {{ isLoading ? 'Creating Account...' : 'Create Account' }}
        </button>
      </form>

      <!-- Already have an account? -->
      <div class="mt-6 pt-6 border-t border-gray-200 text-center">
        <p class="text-gray-600">
          Already have an account?
          <button 
            @click="goToLogin"
            class="text-emerald-600 hover:text-emerald-700 font-semibold ml-1"
          >
            Sign In
          </button>
        </p>
      </div>
    </div>
  </div>
</template>