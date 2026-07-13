<!-- src/views/department/departmentList.vue -->
<script setup lang="ts">
    import { ref, onMounted, computed } from 'vue'
    import { useRouter } from 'vue-router'
    import axios from 'axios'
    import DepartmenteHero from '@/components/Department/DepartmentHero.vue'
    import DepartmenteBlock from '@/components/Department/DepartmentBlock.vue'

    interface Department {
        id: number
        title: string
        description: string
        status: string | 'active'
        created_at: string
        updated_at: string        
    }

    const router = useRouter()
    const departments = ref<Department[]>([])
    const isLoading = ref(true)
    const errorMessage = ref('')
    const searchQuery = ref('')

    const API_URL = import.meta.env.VITE_API_URL

    const filteredDepartments = computed(() => {
        if (!searchQuery.value) return departments.value
        const search = searchQuery.value.toLowerCase()
        return departments.value.filter(department => 
            department.title.toLowerCase().includes(search) ||
            department.description.toLowerCase().includes(search)
        )
    })

    const fetchDepartments = async () => {
        isLoading.value = true
        errorMessage.value = ''
        
        try {
            const token = localStorage.getItem('access_token')
            if (!token) {
                router.push('/login')
                return
            }
            const x_dep_id = localStorage.getItem('X-Department-Id')
            const response = await axios.get(`${API_URL}/departments`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'X-Department-Id':x_dep_id
                }
            })
            
            departments.value = response.data.data || response.data
            
        } catch (error: any) {
            console.error('Failed to load departments:', error)
            errorMessage.value = error.response?.data?.message || 'Failed to load departments'
        } finally {
            isLoading.value = false
        }
    }

    const goToDepartmentDetail = (id: number) => {
        router.push(`/department/${id}`)
    }

    const goToCreateDepartment = () => {
        router.push('/department/create')
    }

    const handleDepartmentDeleted = () => {
        // Refresh the list without reloading the page
        console.log(`DEPARTMENTLIST: A department is delteted. Id: `)
        fetchDepartments()
    }
    const handleCancel = () => {
        router.push('/')
    }
    onMounted(() => {
        fetchDepartments()
    })
</script>

<template>
    <div class="min-h-screen bg-gray-50">
        <!-- Header -->
        <DepartmenteHero 
                    title="departments"
                    description="Manage user departments and permissions"
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
                    @click="goToCreateDepartment"
                    class="px-4 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors flex items-center gap-2"
                >
                    <span>➕ Create New department</span>
                </button>
            </div>
            
            <!-- Loading -->
            <div v-if="isLoading" class="text-center py-12">
                <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
                <p class="mt-4 text-gray-600">Loading departments...</p>
            </div>
            
            <!-- Error -->
            <div v-else-if="errorMessage" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
                {{ errorMessage }}
            </div>
            
            <!-- departments Grid -->
            <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <DepartmenteBlock v-for="department in filteredDepartments"
                    :key="department.id"
                    :id="department.id"
                    :title="department.title"
                    :description="department.description"
                    :status="department.status"
                    @click="goToDepartmentDetail(department.id)"
                    @delete="handleDepartmentDeleted"
                >
                </DepartmenteBlock>                
            </div>
            
            <!-- Empty State -->
            <div v-if="!isLoading && filteredDepartments.length === 0" class="text-center py-12">
                <p class="text-gray-500">No departments found</p>
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