<!-- src/views/role/RoleDetail.vue - READ ONLY VERSION -->
<script setup lang="ts">
    import { ref, onMounted } from 'vue'
    import { useRoute, useRouter } from 'vue-router'
    import axios from 'axios'
    import Switcher from '@/components/Switch.vue'

    interface Role {
        id: number
        title: string
        slug: string
        description: string
        permissions: Record<string, boolean> | string
        created_at: string
        updated_at: string
    }

    const route = useRoute()
    const router = useRouter()
    const role = ref<Role | null>(null)
    const isLoading = ref(true)
    const errorMessage = ref('')
    const viewStatus = ref<boolean>(true)

    const API_URL = import.meta.env.VITE_API_URL

    // Define all entities
    const entities = [
        { name: 'account', label: 'Accounts', icon: '👤' },
        { name: 'department', label: 'Departments', icon: '🏢' },
        { name: 'role', label: 'Roles', icon: '🔑' },
        { name: 'task', label: 'Tasks', icon: '✅' },
        { name: 'membership', label: 'Memberships', icon: '📊' }
    ]

    const actions = [
        { key: 'view', label: 'View', icon: '👁️' },
        { key: 'create', label: 'Create', icon: '➕' },
        { key: 'update', label: 'Update', icon: '✏️' },
        { key: 'delete', label: 'Delete', icon: '🗑️' }
    ]

    // Parse permissions
    const parsePermissions = (permissionsStr: string | Record<string, boolean>): Record<string, boolean> => {
        if (typeof permissionsStr === 'object') {
            return permissionsStr
        }
        try {
            return JSON.parse(permissionsStr)
        } catch {
            return {}
        }
    }

    // Get permission (READ ONLY - no toggle function)
    const hasPermission = (entity: string, action: string): boolean => {
        if (!role.value?.permissions) return false
        
        const permissions = parsePermissions(role.value.permissions)
        const key = `${entity}_${action}`
        
        // Check wildcard
        if (permissions['*'] === true) return true
        if (permissions['*'] === false) return false
        
        return permissions[key] === true
    }

    // Fetch role details
    const fetchRoleDetail = async () => {
        isLoading.value = true
        errorMessage.value = ''
        
        try {
            const token = localStorage.getItem('access_token')
            if (!token) {
                router.push('/login')
                return
            }
            const x_dep_id = localStorage.getItem('X-Department-Id')
            const roleId = route.params.id
            console.log(`roleId is : `,roleId)
            if(!x_dep_id){
                console.log(`Bee carefull X-Department-Id is not set`)
            }
            const response = await axios.get(`${API_URL}/role/${roleId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'X-Department-Id':x_dep_id
                }
            })
            
            role.value = response.data.data || response.data
            
        } catch (error: any) {
            console.error('Failed to load role:', error)
            errorMessage.value = error.response?.data?.message || 'Failed to load role'
        } finally {
            isLoading.value = false
        }
    }

    // Navigation
    const goBack = () => {
        router.push('/roles')
    }

    const goToEdit = () => {
        router.push({
            path:`/roles/${role.value?.id}/edit`
        })
    }

    onMounted(() => {
        fetchRoleDetail()
    })
</script>

<template>
    <div class="min-h-screen bg-gray-50 py-8">
        <div class="container mx-auto px-4 max-w-7xl">
            
            <!-- Header -->
            <div class="mb-6">
                <button 
                    @click="goBack"
                    class="mb-4 flex items-center gap-2 text-emerald-600 hover:text-emerald-700 transition-colors"
                >
                    ← Back to Roles
                </button>
                
                <div class="flex justify-between items-start">
                    <div>
                        <h1 class="text-3xl font-bold text-gray-800">
                            Role: {{ role?.slug }}
                        </h1>
                        <p class="text-gray-500 mt-1">
                            Slug: {{ role?.title }} | ID: {{ role?.id }}
                        </p>
                        <p class="text-gray-400 text-sm mt-1">
                            Created: {{ new Date(role?.created_at || '').toLocaleDateString() }}
                        </p>
                    </div>
                    
                    <!-- Edit Button - This is the ONLY way to modify -->
                    <button
                        @click="goToEdit"
                        class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                    >
                        ✏️ Edit Permissions
                    </button>
                </div>
            </div>
            
            <!-- Messages -->
            <div v-if="errorMessage" class="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                {{ errorMessage }}
            </div>
            
            <!-- Loading State -->
            <div v-if="isLoading" class="text-center py-12">
                <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
                <p class="mt-4 text-gray-600">Loading role details...</p>
            </div>
            
            <!-- READ-ONLY Permissions Table -->
            <div v-else-if="role" class="bg-white rounded-xl shadow-lg overflow-hidden">
                <div class="p-6 border-b border-gray-200 bg-linear-to-r from-gray-50 to-white">
                    <h2 class="text-xl font-semibold text-gray-800">Permissions</h2>
                    <p class="text-gray-500 text-sm mt-1">
                        View only - Click "Edit Permissions" to make changes
                    </p>
                </div>
                
                <!-- Table - READ ONLY (no toggles) -->
                <div class="overflow-x-auto">
                    <table class="w-full">
                        <thead class="bg-gray-100">
                            <tr>
                                <th class="px-4 py-3 text-left text-sm font-semibold text-gray-700 sticky left-0 bg-gray-100">
                                    Entity
                                </th>
                                <th v-for="action in actions" :key="action.key" 
                                    class="px-4 py-3 text-center text-sm font-semibold text-gray-700">
                                    <div class="flex flex-col items-center gap-1">
                                        <span>{{ action.icon }}</span>
                                        <span>{{ action.label }}</span>
                                    </div>
                                </th>
                            </tr>
                        </thead>
                        
                        <tbody class="divide-y divide-gray-200">
                            <tr v-for="entity in entities" :key="entity.name" 
                                class="hover:bg-gray-50 transition-colors">
                                
                                <!-- Entity Name -->
                                <td class="px-4 py-3 sticky left-0 bg-white font-medium text-gray-800">
                                    <div class="flex items-center gap-2">
                                        <span class="text-xl">{{ entity.icon }}</span>
                                        <span>{{ entity.label }}</span>
                                    </div>
                                </td>
                                
                                <!-- READ-ONLY Permission Indicators (no buttons) -->
                                <td v-for="action in actions" :key="action.key" 
                                    class="px-4 py-3 text-center">
                                    <div class="flex justify-center">
                                        <div
                                            :class="[
                                                'w-6 h-6 rounded-full',
                                                hasPermission(entity.name, action.key) 
                                                    ? 'bg-green-500' 
                                                    : 'bg-red-500'
                                            ]"
                                            :title="hasPermission(entity.name, action.key) ? 'Granted' : 'Denied'"
                                        >
                                            <div class="w-full h-full flex items-center justify-center text-white text-xs">
                                                {{ hasPermission(entity.name, action.key) ? '✓' : '✗' }}
                                            </div>
                                        </div>
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                
                <!-- Footer with info -->
                <div class="p-6 border-t border-gray-200 bg-gray-50">
                    <div class="flex items-center justify-center gap-6 text-sm">
                        <div class="flex items-center gap-2">
                            <div class="w-4 h-4 rounded-full bg-green-500"></div>
                            <span class="text-gray-600">Granted</span>
                        </div>
                        <div class="flex items-center gap-2">
                            <div class="w-4 h-4 rounded-full bg-red-500"></div>
                            <span class="text-gray-600">Denied</span>
                        </div>
                        <div class="text-gray-400">
                            * Click "Edit Permissions" to make changes
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.sticky {
    position: sticky;
    z-index: 10;
}
</style>