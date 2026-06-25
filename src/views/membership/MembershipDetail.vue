<script setup lang="ts">
    import { ref, onMounted, computed, watch } from 'vue'
    import { useRoute, useRouter } from 'vue-router'
    import PermissionTable from '@/components/Table/PermissionTable.vue'
    import axios from 'axios'

    // ===== Interfaces =====
    interface Item {
        id: number
        description: string
    }

    interface Membership {
        id: number
        status: string
        permissions_override: Record<string, boolean> | string
        created_at: string
        account: {
            id: number
            name: string
            email: string
            avatar_path: string | null
        }
        department: {
            id: number
            title: string
            path: string
        } | null
        role: {
            id: number
            title: string
            slug: string
        }
    }

    // ===== Permission Configuration =====
    const entities = [
        { name: 'account', label: 'Accounts', icon: '👤' },
        { name: 'department', label: 'Departments', icon: '🏛️' },
        { name: 'role', label: 'Roles', icon: '🔑' },
        { name: 'task', label: 'Tasks', icon: '✅' },
        { name: 'membership', label: 'Memberships', icon: '👔' }
    ]

    const actions = [
        { key: 'view', label: 'View', icon: '👁️' },
        { key: 'create', label: 'Create', icon: '➕' },
        { key: 'update', label: 'Update', icon: '✏️' },
        { key: 'delete', label: 'Delete', icon: '🗑️' }
    ]

    // ===== State =====
    const route = useRoute()
    const router = useRouter()

    const membership = ref<Membership | null>(null)

    const isLoading = ref(true)
    const isSaving = ref(false)
    const errorMessage = ref('')
    const successMessage = ref('')

    const API_URL = 'http://localhost:8000/api'
    const membershipId = computed(() => route.params.id)
    // ===== Helper Functions =====
    const parsePermissions = (permissions: Record<string, boolean> | string): Record<string, boolean> => {
        if (typeof permissions === 'object') {
            return permissions
        }
        try {
            return JSON.parse(permissions)
        } catch {
            return {}
        }
    }
    // ===== Fetch Membership Data =====
    const fetchMembershipDetail = async () => {
        try {
            const token = localStorage.getItem('access_token')
            const x_dep_id = localStorage.getItem('X-Department-Id')
            if(!x_dep_id){
                console.log(`Bee carefull X-Department-Id is not set`)
            }
            const response = await axios.get(`${API_URL}/membership/${route.params.id}`, {
                headers: { 
                    'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                        'X-Department-Id':x_dep_id
                }
            })
            
            membership.value = response.data.data
            console.log(`membership data : `,membership.value)
            
        } catch (error) {
            console.error('Failed to load membership:', error)
        } finally {
            isLoading.value = false
        }
    }
    // ===== Cancel Function =====
    const cancel = () => {
        router.push(`/memberships`)
    }

    // ===== Lifecycle =====
    onMounted(() => {
        fetchMembershipDetail()
    })
    const goToEdit = () => {
        router.push({
            path:`/memberships/${membership.value?.id}/edit`
        })
    }
    const deleteMembership= async () => {
    if (!confirm(`Are you sure you want to delete membership "${membershipId.value}"?`)) return
    
    try {
        const token = localStorage.getItem('access_token')
        const x_dep_id = localStorage.getItem('X-Department-Id')
        if(!x_dep_id){
            console.log(`Bee carefull X-Department-Id is not set`)
        }
        await axios.delete(`${API_URL}/membership/${membershipId.value}`, {
            headers: { 
                'Authorization': `Bearer ${token}` ,
                'Content-Type': 'application/json',
                'X-Department-Id':x_dep_id
            }
        })
        console.info(`membership is deleted successfully`)
        // Refresh list
        await fetchMembershipDetail()
        
    } catch (error: any) {
        console.error('Failed to delete membership:', error)
        alert(error.response?.data?.message || 'Failed to delete membership')
    }
}
</script>

<template>
    <div class="min-h-screen bg-gray-50 p-6">
        <div class="container mx-auto max-w-3xl">
            <div class="flex justify-between mb-2">
                <button 
                    @click="cancel"
                    class="mb-4 flex items-center gap-2 text-emerald-600 hover:text-emerald-700 transition-colors"
                >
                    ← Back
                </button>
                <div class="flex flex-col gap-1">
                    <button
                        @click="goToEdit"
                        class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                    >
                        ✏️ Edit Membership
                    </button>
                    <button
                        @click="deleteMembership"
                        class="px-4 py-2 bg-red-300 text-white rounded-lg hover:bg-red-500 transition-colors flex items-center gap-2"
                    >
                        🗑️ Delete Membership
                    </button>
                </div>
            </div>
            <!-- Header -->
            <div class="mb-6">
                <h1 class="text-3xl font-bold text-gray-800">Membership</h1>
                <p class="text-gray-500 mt-1">Membership information and permissions</p>
            </div>
            
            <!-- Success Message -->
            <div v-if="successMessage" class="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
                {{ successMessage }}
            </div>
            
            <!-- Error Message -->
            <div v-if="errorMessage" class="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                {{ errorMessage }}
            </div>
            
            <!-- Loading State -->
            <div v-if="isLoading" class="text-center py-12">
                <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
                <p class="mt-4 text-gray-600">Loading membership data...</p>
            </div>
            
            <!-- Membership -->
            <div v-else class="bg-white rounded-xl shadow-lg overflow-hidden">
                
                <!-- Account Section (Read-only) -->
                <div class="bg-linear-to-r from-blue-500 to-blue-600 text-white p-8">
                    <h3 class="font-bold text-xl">{{ membership?.account?.name || 'Unknown' }}</h3>
                </div>
                
                <!-- Department Section -->
                <div class="border-b border-gray-100 p-6 hover:bg-gray-50 transition-colors">
                    <label class="text-sm font-medium text-gray-500 block mb-2">Department</label>
                    <div class="flex justify-between items-center">
                        <h3 class="font-bold text-lg">{{ membership?.department?.title }}</h3>
                    </div>
                </div>
                
                <!-- Role Section -->
                <div class="border-b border-gray-100 p-6 hover:bg-gray-50 transition-colors">
                    <label class="text-sm font-medium text-gray-500 block mb-2">Role</label>
                    <div class="flex justify-between items-center">
                        <h3 class="font-bold text-lg">{{ membership?.role?.title }}</h3>
                    </div>
                </div>
                
                <!-- Status Section -->
                <div class="border-b border-gray-100 p-6">
                    <label class="text-sm font-medium text-gray-500 block mb-2">Status</label>
                    <div class="flex justify-between items-center">
                        <div>
                            <h3 class="font-bold text-lg">{{ membership?.status }}</h3>
                        </div>
                    </div>
                </div>
                
                <!-- Permissions Override Section -->
                <div class="p-6">
                    <label class="text-sm font-medium text-gray-500 block mb-3">Permission Override</label>
                    <div class="border rounded-lg overflow-hidden">
                        <PermissionTable
                            :entities="entities"
                            :actions="actions"
                            :permissions="parsePermissions(membership?.permissions_override || {})"
                            :read-only="true"
                        />
                    </div>
                    <p class="text-xs text-gray-400 mt-2">
                        Note: These permissions override the role's default permissions
                    </p>
                </div>
            </div>
        </div>
    </div>
</template>