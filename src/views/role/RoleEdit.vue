<!-- src/views/role/RoleEdit.vue -->
<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'

interface Role {
    id?: number
    title: string
    slug: string
    description: string
    permissions: Record<string, boolean> | string
}

const route = useRoute()
const router = useRouter()
const isLoading = ref(true)
const isSaving = ref(false)
const errorMessage = ref('')
const successMessage = ref('')
const roleId = computed(() => route.params.id)

const formData = ref<Role>({
    title: '',
    slug: '',
    description: '',
    permissions: {}
})

// Define your permission entities and actions
const entities = [
    { name: 'department', label: 'Departments', icon: '🏢' },
    { name: 'membership', label: 'Memberships', icon: '👥' },
    { name: 'role', label: 'Roles', icon: '🔑' },
    { name: 'account', label: 'Accounts', icon: '👤' },
    { name: 'task', label: 'Tasks', icon: '👩‍🏫' }
]

const actions = [
    { key: 'view', label: 'View' },
    { key: 'create', label: 'Create' },
    { key: 'update', label: 'Update' },
    { key: 'delete', label: 'Delete' }
]

const API_URL = import.meta.env.VITE_API_URL

// Fetch role data from API (reliable)
const fetchRole = async () => {
    isLoading.value = true
    try {
        const token = localStorage.getItem('access_token')
        const x_dep_id = localStorage.getItem('X-Department-Id')
        if(!x_dep_id){
            console.log(`Bee carefull X-Department-Id is not set`)
        }
        const response = await axios.get(`${API_URL}/role/${roleId.value}`, {
            headers: {
                    'Authorization': `Bearer ${token}`,
                    'X-Department-Id':x_dep_id
                }
        })
        const role = response.data.data
        formData.value = {
            title: role.title,
            slug: role.slug,
            description: role.description || '',
            permissions: parsePermissions(role.permissions)
        }
    } catch (error) {
        console.error('Failed to load role:', error)
        errorMessage.value = 'Failed to load role data'
    } finally {
        isLoading.value = false
    }
}

// Parse permissions (handle string or object)
const parsePermissions = (permissions: any): Record<string, boolean> => {
    // If it's null or undefined
    if (!permissions) {
        console.log(`(RoleEdit): There is not any permission`)
        return {}
    }
    
    // If it's already a plain object and not an array
    console.log(`(RoleEdit): Permission type: `,typeof permissions)
    console.log(`(RoleEdit): Permission type is array: `,Array.isArray(permissions))
    if (typeof permissions === 'object' && !Array.isArray(permissions)) {        
        return permissions
    }
    
    // If it's an array (convert to object)
    if (Array.isArray(permissions)) {        
        const obj: Record<string, boolean> = {}
        permissions.forEach((item, index) => {
            if (typeof item === 'object') {
                Object.assign(obj, item)
            } else if (typeof item === 'string') {
                try {
                    Object.assign(obj, JSON.parse(item))
                } catch (e) {}
            }
        })
        return obj
    }
    
    // If it's a JSON string
    if (typeof permissions === 'string') {
        try {
            const parsed = JSON.parse(permissions)
            return parsePermissions(parsed) // Recursive call to handle array/object
        } catch {
            return {}
        }
    }
    
    return {}
}

// Check if a specific permission is true
const hasPermission = (entity: string, action: string): boolean => {
    const perms = formData.value.permissions as Record<string, boolean>
    const key = `${entity}_${action}`
    // Wildcard check
    if (perms['*'] === true) return true
    if (perms[`${entity}_*`] === true) return true
    return perms[key] === true
}

// Toggle a single permission
const togglePermission = (entity: string, action: string) => {
    // Get current permissions as a clean object
    const current = parsePermissions(formData.value.permissions)
    const key = `${entity}_${action}`
    
    // Create new object
    const newPermissions = { ...current }
    newPermissions[key] = !newPermissions[key]
    
    // Remove any numeric keys (array artifacts)
    Object.keys(newPermissions).forEach(key => {
        if (!isNaN(Number(key))) {
            delete newPermissions[key]
        }
    })
    
    formData.value.permissions = newPermissions
}

// Check if all actions for an entity are true
const areAllPermissionsTrue = (entity: string): boolean => {
    return actions.every(action => hasPermission(entity, action.key))
}

// Toggle all permissions for an entity
const toggleAllPermissions = (entity: string) => {
    const allTrue = areAllPermissionsTrue(entity)
    const perms = { ...(formData.value.permissions as Record<string, boolean>) }
    actions.forEach(action => {
        const key = `${entity}_${action.key}`
        perms[key] = !allTrue
    })
    formData.value.permissions = perms
}

// Save changes
const updateRole = async () => {
    // Validation
    if (formData.value.title.length < 3) {
        errorMessage.value = 'Title must be at least 3 characters'
        return
    }
    if (formData.value.slug.length < 3) {
        errorMessage.value = 'Slug must be at least 3 characters'
        return
    }
    if (formData.value.description.length < 10) {
        errorMessage.value = 'Description must be at least 10 characters'
        return
    }

    isSaving.value = true
    errorMessage.value = ''
    successMessage.value = ''

    try {
        const token = localStorage.getItem('access_token')
        const x_dep_id = localStorage.getItem('X-Department-Id')
        if(!x_dep_id){
            console.log(`Bee carefull X-Department-Id is not set`)
        }
        const payload = {
            title: formData.value.title,
            slug: formData.value.slug,
            description: formData.value.description,
            permissions: JSON.stringify(formData.value.permissions)
        }
        console.log(`updae payload: `,payload)
        await axios.put(`${API_URL}/role/${roleId.value}`, payload, {
            headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    'X-Department-Id':x_dep_id
                }
        })

        successMessage.value = 'Role updated successfully!'
        setTimeout(() => {
            router.push(`/roles/${roleId.value}`)
        }, 1500)

    } catch (error: any) {
        console.error('Update failed:', error)
        if (error.response?.data?.errors) {
            errorMessage.value = Object.values(error.response.data.errors).flat().join(', ')
        } else if (error.response?.data?.message) {
            errorMessage.value = error.response.data.message
        } else {
            errorMessage.value = 'Failed to update role'
        }
    } finally {
        isSaving.value = false
    }
}

const cancel = () => {
    router.push(`/roles`)
}

onMounted(() => {
    fetchRole()
})
</script>

<template>
    <div class="min-h-screen bg-gray-50 py-8">
        <div class="container mx-auto px-4 max-w-5xl">
            <!-- Header -->
            <div class="mb-6">
                <button 
                    @click="cancel"
                    class="mb-4 flex items-center gap-2 text-emerald-600 hover:text-emerald-700"
                >
                    ← Back to Role Details
                </button>
                <h1 class="text-3xl font-bold text-gray-800">Edit Role</h1>
                <p class="text-gray-500 mt-1">Update role information and permissions</p>
            </div>

            <!-- Loading -->
            <div v-if="isLoading" class="text-center py-12">
                <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
                <p class="mt-4 text-gray-600">Loading role data...</p>
            </div>

            <div v-else>
                <!-- Messages -->
                <div v-if="successMessage" class="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
                    {{ successMessage }}
                </div>
                <div v-if="errorMessage" class="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                    {{ errorMessage }}
                </div>

                <!-- Form -->
                <form @submit.prevent="updateRole" class="bg-white rounded-xl shadow-lg overflow-hidden">
                    <div class="p-6 space-y-6">
                        <!-- Title -->
                        <div>
                            <label class="block text-sm font-semibold text-gray-700 mb-2">
                                Role Title <span class="text-red-500">*</span>
                            </label>
                            <input 
                                v-model="formData.title"
                                type="text"
                                class="w-full p-3 text-gray-800 bg-gray-50 border border-gray-200 rounded-lg 
                                    focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                placeholder="e.g., Manager, Supervisor"
                                required
                            >
                            <p v-if="formData.title && formData.title.length < 3" class="text-red-500 text-sm mt-1">
                                Title must be at least 3 characters
                            </p>
                        </div>

                        <!-- Slug -->
                        <div>
                            <label class="block text-sm font-semibold text-gray-700 mb-2">
                                Slug <span class="text-red-500">*</span>
                            </label>
                            <input 
                                v-model="formData.slug"
                                type="text"
                                class="w-full p-3 text-gray-800 bg-gray-50 border border-gray-200 rounded-lg 
                                    focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                placeholder="e.g., manager, supervisor"
                                required
                            >
                            <p v-if="formData.slug && formData.slug.length < 3" class="text-red-500 text-sm mt-1">
                                Slug must be at least 3 characters
                            </p>
                        </div>

                        <!-- Description -->
                        <div>
                            <label class="block text-sm font-semibold text-gray-700 mb-2">
                                Description <span class="text-red-500">*</span>
                            </label>
                            <textarea 
                                v-model="formData.description"
                                rows="4"
                                class="w-full p-3 text-gray-800 bg-gray-50 border border-gray-200 rounded-lg 
                                    focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                                placeholder="Describe the role's responsibilities"
                                required
                            ></textarea>
                            <div class="flex justify-between mt-1">
                                <p v-if="formData.description && formData.description.length < 10" class="text-red-500 text-sm">
                                    Description must be at least 10 characters
                                </p>
                                <p class="text-gray-400 text-sm ml-auto">
                                    {{ formData.description.length }}/500 characters
                                </p>
                            </div>
                        </div>

                        <!-- Permissions Table -->
                        <div>
                            <h3 class="text-lg font-semibold text-gray-800 mb-3">Permissions</h3>
                            <div class="overflow-x-auto">
                                <table class="w-full border-collapse">
                                    <thead class="bg-gray-100">
                                        <tr>
                                            <th class="px-4 py-3 text-left text-sm font-semibold text-gray-700">Entity</th>
                                            <th v-for="action in actions" :key="action.key" class="px-4 py-3 text-center text-sm font-semibold text-gray-700">
                                                {{ action.label }}
                                            </th>
                                            <th class="px-4 py-3 text-center text-sm font-semibold text-gray-700">All</th>
                                        </tr>
                                    </thead>
                                    <tbody class="divide-y divide-gray-200">
                                        <tr v-for="entity in entities" :key="entity.name" class="hover:bg-gray-50">
                                            <td class="px-4 py-3 font-medium text-gray-800">
                                                <div class="flex items-center gap-2">
                                                    <span>{{ entity.icon }}</span>
                                                    <span>{{ entity.label }}</span>
                                                </div>
                                            </td>
                                            
                                            <!-- ✅ FIX: Add type="button" to prevent form submission -->
                                            <td v-for="action in actions" :key="action.key" class="px-4 py-3 text-center">
                                                <button 
                                                    type="button"
                                                    @click="togglePermission(entity.name, action.key)" 
                                                    class="w-full flex justify-center"
                                                >
                                                    <div :class="[
                                                        'w-6 h-6 rounded-full transition-all duration-200 cursor-pointer hover:scale-110',
                                                        hasPermission(entity.name, action.key) ? 'bg-green-500' : 'bg-red-500'
                                                    ]">
                                                        <div class="w-full h-full flex items-center justify-center text-white text-xs">
                                                            {{ hasPermission(entity.name, action.key) ? '✓' : '✗' }}
                                                        </div>
                                                    </div>
                                                </button>
                                            </td>
                                            
                                            <td class="px-4 py-3 text-center">
                                                <button 
                                                    type="button"
                                                    @click="toggleAllPermissions(entity.name)"
                                                    :class="[
                                                        'px-2 py-1 text-xs rounded transition-colors',
                                                        areAllPermissionsTrue(entity.name) ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                                                    ]"
                                                >
                                                    {{ areAllPermissionsTrue(entity.name) ? 'All ✓' : 'Select All' }}
                                                </button>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <!-- Action Buttons -->
                        <div class="flex gap-3 pt-4 border-t">
                            <button 
                                type="button"
                                @click="cancel"
                                class="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                            >
                                Cancel
                            </button>
                            <button 
                                type="submit"
                                :disabled="isSaving"
                                class="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50"
                            >
                                {{ isSaving ? 'Saving...' : 'Apply Changes' }}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    </div>
</template>