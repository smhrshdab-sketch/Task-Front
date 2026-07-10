<!-- src/views/department/DepartmentListView.vue -->
<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'
import DepartmentBlock from '@/components/Department/DepartmentBlock.vue'

interface Department {
    id: number
    title: string
    description: string
    parent_id: number | null
    has_children?: boolean
}

const route = useRoute()
const router = useRouter()
const departments = ref<Department[]>([])
const currentParent = ref<Department | null>(null)
const isLoading = ref(false)
const errorMessage = ref('')
const breadcrumbs = ref<Department[]>([])

const API_URL = import.meta.env.VITE_API_URL

// Get parent_id from URL query parameter
const parentId = computed(() => {
    const id = route.query.parent_id
    return id ? parseInt(id as string) : null
})

// Fetch departments based on parent_id
const fetchDepartments = async () => {
    isLoading.value = true
    errorMessage.value = ''
    
    try {
        const token = localStorage.getItem('access_token')
        const response = await axios.get(`${API_URL}/department`, {
            headers: { 'Authorization': `Bearer ${token}` },
            params: { parent_id: parentId.value }
        })
        
        departments.value = response.data.data
        currentParent.value = response.data.parent
        
        // Build breadcrumbs if we have a parent
        if (currentParent.value) {
            await loadBreadcrumbs(currentParent.value.id)
        } else {
            breadcrumbs.value = []
        }
        
        console.log('Departments loaded:', departments.value)
        
    } catch (error) {
        console.error('Failed to load departments:', error)
        errorMessage.value = 'Failed to load departments'
    } finally {
        isLoading.value = false
    }
}

// Load breadcrumb trail
const loadBreadcrumbs = async (departmentId: number) => {
    try {
        const token = localStorage.getItem('access_token')
        const response = await axios.get(`${API_URL}/department/${departmentId}/ancestors`, {
            headers: { 'Authorization': `Bearer ${token}` }
        })
        breadcrumbs.value = response.data.data
    } catch (error) {
        console.error('Failed to load breadcrumbs:', error)
    }
}

// Navigate to a department (drill down)
const goToDepartment = (department: Department) => {
    router.push({
        path: '/department/list',
        query: { parent_id: department.id }
    })
}

// Navigate up (breadcrumb click)
const goToBreadcrumb = (department: Department | null) => {
    if (department === null) {
        router.push({ path: '/department/list' })
    } else {
        router.push({
            path: '/department/list',
            query: { parent_id: department.id }
        })
    }
}

// Go back to parent
const goToParent = () => {
    if (currentParent.value?.parent_id) {
        router.push({
            path: '/department/list',
            query: { parent_id: currentParent.value.parent_id }
        })
    } else {
        router.push({ path: '/department/list' })
    }
}

// Navigate to create new department (as child of current)
const goToCreateChild = () => {
    router.push({
        path: '/department/create',
        query: { parent_id: parentId.value || '' }
    })
}

// Navigate to edit current department
const goToEditCurrent = () => {
    if (currentParent.value) {
        router.push(`/department/${currentParent.value.id}/edit`)
    }
}

onMounted(() => {
    fetchDepartments()
})

// Watch for parent_id changes in URL
import { watch } from 'vue'
watch(() => route.query.parent_id, () => {
    fetchDepartments()
})
</script>

<template>
    <div class="min-h-screen bg-gray-50 p-6">
        <div class="container mx-auto">
            
            <!-- Header with Breadcrumbs -->
            <div class="mb-6">
                <div class="flex justify-between items-start">
                    <div>
                        <!-- Breadcrumb Navigation -->
                        <nav class="flex items-center gap-2 text-sm mb-4">
                            <button 
                                @click="goToBreadcrumb(null)"
                                class="text-emerald-600 hover:text-emerald-700 font-medium"
                            >
                                Home
                            </button>
                            
                            <template v-for="(crumb, index) in breadcrumbs" :key="crumb.id">
                                <span class="text-gray-400">›</span>
                                <button 
                                    @click="goToBreadcrumb(crumb)"
                                    class="hover:text-emerald-600 transition-colors"
                                    :class="index === breadcrumbs.length - 1 ? 'text-gray-800 font-semibold' : 'text-gray-500'"
                                >
                                    {{ crumb.title }}
                                </button>
                            </template>
                            
                            <span v-if="currentParent" class="text-gray-400">›</span>
                            <span v-if="currentParent" class="text-gray-800 font-semibold">
                                {{ currentParent.title }}
                            </span>
                        </nav>
                        
                        <h1 class="text-2xl font-bold text-gray-800">
                            {{ currentParent ? currentParent.title : 'Departments' }}
                        </h1>
                        <p class="text-gray-500 mt-1">
                            {{ departments.length }} department(s) in this level
                        </p>
                    </div>
                    
                    <div class="flex gap-2">
                        <!-- Edit current department (if viewing a sub-department) -->
                        <button 
                            v-if="currentParent"
                            @click="goToEditCurrent"
                            class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                            Edit {{ currentParent.title }}
                        </button>
                        
                        <!-- Add sub-department button -->
                        <button 
                            @click="goToCreateChild"
                            class="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
                        >
                            + Add Sub-Department
                        </button>
                    </div>
                </div>
            </div>
            
            <!-- Back button (when not at root) -->
            <button 
                v-if="currentParent"
                @click="goToParent"
                class="mb-4 flex items-center gap-2 text-emerald-600 hover:text-emerald-700"
            >
                ← Back to Parent
            </button>
            
            <!-- Loading State -->
            <div v-if="isLoading" class="text-center py-12">
                <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
                <p class="mt-4 text-gray-600">Loading departments...</p>
            </div>
            
            <!-- Error State -->
            <div v-else-if="errorMessage" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
                {{ errorMessage }}
            </div>
            
            <!-- Empty State -->
            <div v-else-if="departments.length === 0" class="text-center py-12 bg-white rounded-xl shadow-sm">
                <p class="text-gray-500">No departments found at this level</p>
                <button 
                    @click="goToCreateChild"
                    class="mt-4 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
                >
                    Create First Department
                </button>
            </div>
            
            <!-- Departments Grid -->
            <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <DepartmentBlock 
                    v-for="department in departments" 
                    :key="department.id"
                    :department="department"
                    @click="goToDepartment(department)"
                />
            </div>
            
            <!-- Info about children (help text) -->
            <div v-if="departments.length > 0" class="mt-8 text-center text-sm text-gray-400">
                <p>💡 Click on any department to view its sub-departments</p>
            </div>
        </div>
    </div>
</template>