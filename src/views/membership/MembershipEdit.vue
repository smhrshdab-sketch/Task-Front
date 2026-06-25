<script setup lang="ts">
    import { ref, onMounted, computed, watch } from 'vue'
    import { useRoute, useRouter } from 'vue-router'
    import Drawer from '@/components/Drawer.vue'
    import PermissionTable from '@/components/Table/PermissionTable.vue'
    import Switch from '@/components/Switch.vue'
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

    interface MemberPayload {
        status: string
        department_id: number | null
        role_id: number | null
        permissions_override: string
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

    const departmentList = ref<Item[]>([])
    const roleList = ref<Item[]>([])

    const isLoading = ref(true)
    const isSaving = ref(false)
    const errorMessage = ref('')
    const successMessage = ref('')

    // Drawer state
    const isDrawerOpen = ref(false)
    const drawerTitle = ref<'Department' | 'Role'>('Department')

    // Form data (initialize with defaults, will be updated after fetch)
    const formData = ref<MemberPayload>({
        status: 'active',
        department_id: null,
        role_id: null,
        permissions_override: '{}'
    })

    const API_URL = 'http://localhost:8000/api'

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

    // Transform object to array (for department/role lists)
    const transformObjectToArray = (obj: Record<string, string> | any): Item[] => {
        if (!obj) return []
        if (Array.isArray(obj)) return obj
        return Object.entries(obj).map(([id, description]) => ({
            id: parseInt(id),
            description: description as string
        }))
    }

    // ===== Fetch Membership Data =====
    const fetchMembershipDetail = async () => {
        isLoading.value = true
        
        try {
            const token = localStorage.getItem('access_token')
            const x_dep_id = localStorage.getItem('X-Department-Id')
            
            const response = await axios.get(`${API_URL}/membership/${route.params.id}`, {
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    'X-Department-Id': x_dep_id
                }
            })
            
            const data = response.data.data
            membership.value = data
            
            // Transform department and role lists
            departmentList.value = transformObjectToArray(response.data.department_list || {})
            roleList.value = transformObjectToArray(response.data.role_list || {})
            
            // Initialize form data with current membership values
            formData.value = {
                status: data.status || 'active',
                department_id: data.department?.id || null,
                role_id: data.role?.id || null,
                permissions_override: typeof data.permissions_override === 'string' 
                    ? data.permissions_override 
                    : JSON.stringify(data.permissions_override || {})
            }
            
            console.log('Department list:', departmentList.value)
            console.log('Role list:', roleList.value)
            
        } catch (error) {
            console.error('Failed to load membership:', error)
            errorMessage.value = 'Failed to load membership data'
        } finally {
            isLoading.value = false
        }
    }

    // ===== Drawer Functions =====
    const openDrawer = (type: 'Department' | 'Role') => {
        drawerTitle.value = type
        isDrawerOpen.value = true
    }

    const closeDrawer = () => {
        isDrawerOpen.value = false
    }

    // ===== Handle Selection from Drawer =====
    const handleDrawerSelect = (id: number) => {
        if (drawerTitle.value === 'Department') {
            formData.value.department_id = id
            const selected = departmentList.value.find(item => item.id === id)
            if (selected) {
                console.log(`Selected Department: ${selected.description} (ID: ${selected.id})`)
            }
        } else {
            formData.value.role_id = id
            const selected = roleList.value.find(item => item.id === id)
            if (selected) {
                console.log(`Selected Role: ${selected.description} (ID: ${selected.id})`)
            }
        }
        closeDrawer()
    }

    // ===== Status Change Handler =====
    const handleStatusChange = (newStatus: boolean) => {
        formData.value.status = newStatus ? 'active' : 'suspended'
        console.log(`Status changed to: ${formData.value.status}`)
    }

    // ===== Permissions Update Handler =====
    const handlePermissionsUpdate = (newPermissions: Record<string, boolean>) => {
        formData.value.permissions_override = JSON.stringify(newPermissions)
        console.log('Permissions updated:', newPermissions)
    }

    // ===== Update Membership =====
    const updateMembership = async () => {
        if (!membership.value) return

        isSaving.value = true
        errorMessage.value = ''
        successMessage.value = ''

        try {
            const token = localStorage.getItem('access_token')
            const x_dep_id = localStorage.getItem('X-Department-Id')
            
            const payload = {
                status: formData.value.status,
                department_id: formData.value.department_id,
                role_id: formData.value.role_id,
                permissions_override: formData.value.permissions_override
            }
            
            console.log('Updating membership with payload:', payload)
            
            await axios.put(`${API_URL}/membership/${membership.value.id}`, payload, {
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    'X-Department-Id': x_dep_id
                }
            })
            
            successMessage.value = 'Membership updated successfully!'
            
            setTimeout(() => {
                router.push(`/membership/${membership.value?.id}`)
            }, 1500)
            
        } catch (error: any) {
            console.error('Failed to update membership:', error)
            errorMessage.value = error.response?.data?.message || 'Failed to update membership'
        } finally {
            isSaving.value = false
        }
    }

    // ===== Computed Values =====
    const currentDepartmentName = computed(() => {
        if (formData.value.department_id) {
            const found = departmentList.value.find(item => item.id === formData.value.department_id)
            if (found) return found.description
        }
        return membership.value?.department?.title || 'Not assigned'
    })

    const currentRoleName = computed(() => {
        if (formData.value.role_id) {
            const found = roleList.value.find(item => item.id === formData.value.role_id)
            if (found) return found.description
        }
        return membership.value?.role?.title || 'Not assigned'
    })

    const currentStatus = computed(() => {
        return formData.value.status === 'active'
    })

    // ===== Cancel Function =====
    const cancel = () => {
        router.push(`/membership/${membership.value?.id}`)
    }

    // ===== Lifecycle =====
    onMounted(() => {
        fetchMembershipDetail()
    })
</script>

<template>
    <div class="min-h-screen bg-gray-50 p-6">
        <div class="container mx-auto max-w-3xl">
            <!-- Back Button -->
            <button 
                @click="cancel"
                class="mb-4 flex items-center gap-2 text-emerald-600 hover:text-emerald-700 transition-colors"
            >
                ← Back to Membership
            </button>
            
            <!-- Header -->
            <div class="mb-6">
                <h1 class="text-3xl font-bold text-gray-800">Edit Membership</h1>
                <p class="text-gray-500 mt-1">Update membership information and permissions</p>
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
            
            <!-- Membership Edit Form -->
            <form v-else @submit.prevent="updateMembership">
                <div class="bg-white rounded-xl shadow-lg overflow-hidden">
                    
                    <!-- Account Section (Read-only) -->
                    <div class="bg-linear-to-r from-blue-500 to-blue-600 text-white p-8">
                        <h3 class="font-bold text-xl">{{ membership?.account?.name || 'Unknown' }}</h3>
                    </div>
                    
                    <!-- Department Section -->
                    <div class="border-b border-gray-100 p-6 hover:bg-gray-50 transition-colors">
                        <label class="text-sm font-medium text-gray-500 block mb-2">Department</label>
                        <div class="flex justify-between items-center">
                            <h3 class="font-bold text-lg text-gray-800">{{ currentDepartmentName }}</h3>
                            <button 
                                type="button"
                                class="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors"
                                @click="openDrawer('Department')"
                            >
                                Change Department
                            </button>
                        </div>
                    </div>
                    
                    <!-- Role Section -->
                    <div class="border-b border-gray-100 p-6 hover:bg-gray-50 transition-colors">
                        <label class="text-sm font-medium text-gray-500 block mb-2">Role</label>
                        <div class="flex justify-between items-center">
                            <h3 class="font-bold text-lg text-gray-800">{{ currentRoleName }}</h3>
                            <button 
                                type="button"
                                class="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors"
                                @click="openDrawer('Role')"
                            >
                                Change Role
                            </button>
                        </div>
                    </div>
                    
                    <!-- Status Section -->
                    <div class="border-b border-gray-100 p-6">
                        <label class="text-sm font-medium text-gray-500 block mb-2">Status</label>
                        <div class="flex justify-between items-center">
                            <div>
                                <span :class="[
                                    'px-3 py-1 rounded-full text-sm font-medium',
                                    currentStatus ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                ]">
                                    {{ currentStatus ? 'Active' : 'Suspended' }}
                                </span>
                            </div>
                            <Switch 
                                :state="currentStatus"
                                @state="handleStatusChange"
                            />
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
                                @update:permissions="handlePermissionsUpdate"
                            />
                        </div>
                        <p class="text-xs text-gray-400 mt-2">
                            Note: These permissions override the role's default permissions
                        </p>
                    </div>
                    
                    <!-- Action Buttons -->
                    <div class="flex gap-3 p-6 border-t border-gray-100 bg-gray-50">
                        <button 
                            type="button"
                            @click="cancel"
                            class="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit"
                            :disabled="isSaving"
                            class="flex-1 px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50"
                        >
                            {{ isSaving ? 'Saving...' : 'Apply Changes' }}
                        </button>
                    </div>
                </div>
            </form>
            
            <!-- Drawer Component -->
            <Drawer 
                :is-open="isDrawerOpen"
                :title="drawerTitle === 'Department' ? 'Select Department' : 'Select Role'"
                :items="drawerTitle === 'Department' ? departmentList : roleList"
                @closed="closeDrawer"
                @selected="handleDrawerSelect"
            />
        </div>
    </div>
</template>