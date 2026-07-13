<!-- src/views/role/RoleList.vue -->
<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import RoleHero from '@/components/Role/RoleHero.vue'
import RoleBlock from '@/components/Role/RoleBlock.vue'

interface Role {
    id: number
    title: string
    slug: string
    parent_id: number | null
    permissions: any
    created_at: string
    updated_at: string
}

const router = useRouter()
const roles = ref<Role[]>([])
const isLoading = ref(true)
const errorMessage = ref('')
const searchQuery = ref('')

const API_URL = import.meta.env.VITE_API_URL

const filteredRoles = computed(() => {
    if (!searchQuery.value) return roles.value
    const search = searchQuery.value.toLowerCase()
    return roles.value.filter(role => 
        role.title.toLowerCase().includes(search) ||
        role.slug.toLowerCase().includes(search)
    )
})

const fetchRoles = async () => {
    isLoading.value = true
    errorMessage.value = ''
    
    try {
        const token = localStorage.getItem('access_token')
        if (!token) {
            router.push('/login')
            return
        }
        const x_dep_id = localStorage.getItem('X-Department-Id')
        const response = await axios.get(`${API_URL}/role`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'X-Department-Id':x_dep_id
             }
        })
        
        roles.value = response.data.data || response.data
        
    } catch (error: any) {
        console.error('Failed to load roles:', error)
        errorMessage.value = error.response?.data?.message || 'Failed to load roles'
    } finally {
        isLoading.value = false
    }
}

const goToRoleDetail = (id: number) => {
    router.push(`/roles/${id}`)
}

const goToCreateRole = () => {
    router.push('/roles/create')
}

const deleteRole = async (id: number, title: string) => {
    if (!confirm(`Are you sure you want to delete role "${title}"?`)) return
    
    try {
        const token = localStorage.getItem('access_token')
        await axios.delete(`${API_URL}/roles/${id}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        })
        
        // Refresh list
        await fetchRoles()
        
    } catch (error: any) {
        console.error('Failed to delete role:', error)
        alert(error.response?.data?.message || 'Failed to delete role')
    }
}
const handleCancel = () => {
        router.push('/')
    }
onMounted(() => {
    fetchRoles()
})
</script>

<template>
    <div class="min-h-screen bg-gray-50">
        <!-- Header -->
        <RoleHero 
                    title="Roles"
                    description="Manage user roles and permissions"
                    color="rgb(58 73 149)"
                />
                <button 
                    @click="handleCancel"
                    class="mb-4 flex items-center gap-2 text-emerald-600 hover:text-emerald-700"
                >
                    ← Back to Dashboard
                </button>
        <div class="container mx-auto px-4">
            
            
            <!-- Search -->
            <div class="flex justify-between items-center gap-4 my-6">
                <div class="flex-1 relative">
                    <input 
                        v-model="searchQuery"
                        type="text" 
                        class="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        placeholder="Search departments by name or description..."
                    >
                    <span class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">🔍</span>
                </div>
                
                <button 
                    @click="goToCreateRole"
                    class="px-4 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors flex items-center gap-2"
                >
                    <span>➕ Create New Role</span>
                </button>
            </div>
            
            <!-- Loading -->
            <div v-if="isLoading" class="text-center py-12">
                <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
                <p class="mt-4 text-gray-600">Loading roles...</p>
            </div>
            
            <!-- Error -->
            <div v-else-if="errorMessage" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
                {{ errorMessage }}
            </div>
            
            <!-- Roles Grid -->
            <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <RoleBlock v-for="role in filteredRoles"
                    :key="role.id"
                    :id="role.id"
                    :title="role.title"
                    :slug="role.slug"
                    @click="goToRoleDetail(role.id)"
                >
                </RoleBlock>                
            </div>
            
            <!-- Empty State -->
            <div v-if="!isLoading && filteredRoles.length === 0" class="text-center py-12">
                <p class="text-gray-500">No roles found</p>
                <button
                    v-if="searchQuery"
                    @click="searchQuery = ''"
                    class="mt-2 text-emerald-600 hover:text-emerald-700"
                >
                    Clear search
                </button>
            </div>
        </div>
    </div>
</template>