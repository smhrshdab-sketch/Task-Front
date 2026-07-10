<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

// Interface for account data
interface Account {
    id?: number
    email: string
    name: string
    password?: string  // Optional - only send if changed
    bio: string
    address: string
    phone: string
    avatar_path: string | null
}

// State
const account = ref<Account>({
    email: '',
    name: '',
    bio: '',
    address: '',
    phone: '',
    avatar_path: null
})

const isLoading = ref(false)
const errorMessage = ref('')
const successMessage = ref('')
const selectedAvatar = ref<File | null>(null)
const avatarPreview = ref<string>('')

const router = useRouter()
const API_URL = import.meta.env.VITE_API_URL

// Get user ID from localStorage or user object
const getUserId = () => {
    const userStr = localStorage.getItem('user')
    console.log(`[getUserId] user : `,userStr)
    if (userStr) {
        const user = JSON.parse(userStr)
        return user.id
    }
    return null
}

// Load current user data
const loadUserData = async () => {
    isLoading.value = true
    
    try {
        const token = localStorage.getItem('access_token')
        if (!token) {
            router.push('/login')
            return
        }

        const response = await axios.get(`${API_URL}/me`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })

        // Adjust this path based on your API response structure
        //const userData = response.data.data?.original || response.data.data || response.data.user
        const userData = response.data.data?.original
        console.log(`[account] userData and userData.user : `,userData,userData.user)
        if (userData) {
            account.value = {
                email: userData.email || '',
                name: userData.name || '',
                bio: userData.bio || '',
                address: userData.address || '',
                phone: userData.phone || '',
                avatar_path: userData.avatar_path || null
            }
            
            // Set avatar preview if exists
            if (userData.avatar_path) {
                avatarPreview.value = `${API_URL}/storage/${userData.avatar_path}`
            }
            //localStorage.setItem('user', JSON.stringify(userData))
        }
    } catch (error) {
        console.error('Failed to load user data:', error)
        errorMessage.value = 'Failed to load account data'
    } finally {
        isLoading.value = false
    }
}

// Handle file selection for avatar
const onFileSelected = (event: Event) => {
    const input = event.target as HTMLInputElement
    if (input.files && input.files[0]) {
        selectedAvatar.value = input.files[0]
        
        // Create preview
        const reader = new FileReader()
        reader.onload = (e) => {
            avatarPreview.value = e.target?.result as string
        }
        reader.readAsDataURL(input.files[0])
    }
}

// Handle form submission
const handleSubmit = async () => {
    errorMessage.value = ''
    successMessage.value = ''
    isLoading.value = true

    try {
        const token = localStorage.getItem('access_token')
        const department = localStorage.getItem('X-Department-Id')
        
        if (!token) {
            router.push('/login')
            return
        }

        const userId = getUserId()
        if (!userId) {
            errorMessage.value = 'User ID not found'
            return
        }

        // Create FormData
        const formData = new FormData()
        
        // Append data - make sure values are not undefined
        formData.append('name', account.value.name || '')
        formData.append('email', account.value.email || '')
        formData.append('bio', account.value.bio || '')
        formData.append('address', account.value.address || '')
        formData.append('phone', account.value.phone || '')
        
        // Only add password if user entered a new one (not empty string)
        if (account.value.password && account.value.password.trim().length > 0) {
            formData.append('password', account.value.password)
        }
        
        // Add avatar if selected
        if (selectedAvatar.value) {
            formData.append('avatar', selectedAvatar.value)
        }
        
        // ✅ DEBUG: See what's actually in FormData
        console.log('=== FormData Contents ===')
        for (let pair of formData.entries()) {
            console.log(pair[0], ':', pair[1])
        }
        
        // Also check if password is being sent
        console.log('Password being sent:', account.value.password ? 'Yes (length: ' + account.value.password.length + ')' : 'No')
        
        // Send request
        const response = await axios.post(`${API_URL}/account/${userId}`, formData, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'multipart/form-data',
                'X-Department-Id': department
            },
            params: {
                '_method': 'PUT'
            }
        })

        console.log('Response:', response.data)
        
        if (response.data.success || response.status === 200) {
            successMessage.value = 'Account updated successfully!'
            
            // Update stored user data
            const updatedUser = {
                id: userId,
                name: account.value.name,
                email: account.value.email,
                bio: account.value.bio,
                address: account.value.address,
                phone: account.value.phone
            }
            localStorage.setItem('user', JSON.stringify(updatedUser))
            
            // Clear password field after successful update
            account.value.password = ''
            selectedAvatar.value = null
            
            // Auto hide success message after 3 seconds
            setTimeout(() => {
                successMessage.value = ''
            }, 3000)
        }
        
    } catch (error: any) {
        console.error('Update error:', error)
        
        // Log the actual error response
        if (error.response) {
            console.error('Error response data:', error.response.data)
            console.error('Error status:', error.response.status)
            errorMessage.value = error.response.data?.message || 'Failed to update account'
        } else if (error.request) {
            console.error('No response received:', error.request)
            errorMessage.value = 'No response from server'
        } else {
            errorMessage.value = error.message || 'Failed to update account'
        }
        
    } finally {
        isLoading.value = false
    }
}

// Load user data when component mounts
onMounted(() => {
    loadUserData()
})
</script>

<template>
    <div class="min-h-screen w-full flex justify-center items-center bg-linear-to-br from-green-50 to-green-300 p-4">
        <div class="w-full max-w-2xl bg-white rounded-2xl shadow-2xl p-6 md:p-8">
            <h1 class="text-3xl font-bold text-gray-800 mb-6 text-center">Update Account</h1>
            
            <!-- Messages -->
            <div v-if="errorMessage" class="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                {{ errorMessage }}
            </div>
            
            <div v-if="successMessage" class="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-lg">
                {{ successMessage }}
            </div>
            
            <!-- Loading State -->
            <div v-if="isLoading" class="text-center py-8">
                <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
                <p class="mt-2 text-gray-600">Loading...</p>
            </div>
            
            <!-- Form -->
            <form v-else @submit.prevent="handleSubmit" class="space-y-4">
                <!-- Avatar Upload -->
                <div class="flex flex-col items-center space-y-3 p-4 bg-gray-50 rounded-lg">
                    <div class="relative">
                        <img 
                            :src="avatarPreview || '/default-avatar.png'" 
                            alt="Avatar"
                            class="w-24 h-24 rounded-full object-cover border-4 border-green-300"
                        >
                        <label class="absolute bottom-0 right-0 bg-green-500 rounded-full p-1 cursor-pointer hover:bg-green-600">
                            <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path>
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path>
                            </svg>
                            <input 
                                type="file" 
                                accept="image/*"
                                @change="onFileSelected"
                                class="hidden"
                            >
                        </label>
                    </div>
                    <p class="text-sm text-gray-500">Click the camera icon to change avatar</p>
                </div>
                
                <!-- Name -->
                <div class="flex flex-col gap-2">
                    <label for="name" class="text-sm font-semibold text-gray-700">Name *</label>
                    <input 
                        id="name"
                        v-model="account.name"
                        type="text"
                        class="w-full p-3 text-gray-800 bg-gray-50 border border-gray-200 rounded-lg 
                               focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="Enter your name"
                        required
                    >
                </div>
                
                <!-- Email -->
                <div class="flex flex-col gap-2">
                    <label for="email" class="text-sm font-semibold text-gray-700">Email *</label>
                    <input 
                        id="email"
                        v-model="account.email"
                        type="email"
                        class="w-full p-3 text-gray-800 bg-gray-50 border border-gray-200 rounded-lg 
                               focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="your@email.com"
                        required
                    >
                </div>
                
                <!-- Password (Optional) -->
                <div class="flex flex-col gap-2">
                    <label for="password" class="text-sm font-semibold text-gray-700">
                        New Password <span class="text-gray-400 text-xs">(leave blank to keep current)</span>
                    </label>
                    <input 
                        id="password"
                        v-model="account.password"
                        type="password"
                        class="w-full p-3 text-gray-800 bg-gray-50 border border-gray-200 rounded-lg 
                               focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="Enter new password"
                    >
                </div>
                
                <!-- Bio -->
                <div class="flex flex-col gap-2">
                    <label for="bio" class="text-sm font-semibold text-gray-700">Biography</label>
                    <textarea 
                        id="bio"
                        v-model="account.bio"
                        rows="3"
                        class="w-full p-3 text-gray-800 bg-gray-50 border border-gray-200 rounded-lg 
                               focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="Tell us about yourself"
                    ></textarea>
                </div>
                
                <!-- Address -->
                <div class="flex flex-col gap-2">
                    <label for="address" class="text-sm font-semibold text-gray-700">Address</label>
                    <input 
                        id="address"
                        v-model="account.address"
                        type="text"
                        class="w-full p-3 text-gray-800 bg-gray-50 border border-gray-200 rounded-lg 
                               focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="Your address"
                    >
                </div>
                
                <!-- Phone -->
                <div class="flex flex-col gap-2">
                    <label for="phone" class="text-sm font-semibold text-gray-700">Phone</label>
                    <input 
                        id="phone"
                        v-model="account.phone"
                        type="tel"
                        class="w-full p-3 text-gray-800 bg-gray-50 border border-gray-200 rounded-lg 
                               focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="Your phone number"
                    >
                </div>
                
                <!-- Submit Button -->
                <div class="flex gap-3 pt-4">
                    <button 
                        type="submit"
                        :disabled="isLoading"
                        class="flex-1 p-3 bg-green-600 text-white rounded-lg hover:bg-green-700 
                               transition-all duration-200 disabled:opacity-50 font-semibold"
                    >
                        {{ isLoading ? 'Updating...' : 'Update Account' }}
                    </button>
                    
                    <button 
                        type="button"
                        @click="router.push('/dashboard')"
                        class="px-6 p-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 
                               transition-all duration-200"
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    </div>
</template>