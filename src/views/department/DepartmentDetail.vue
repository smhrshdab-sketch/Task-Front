<script setup lang="ts">
    import { ref, onMounted,computed } from 'vue'
    import { useRoute, useRouter } from 'vue-router'
    import { useDelete } from '@/composables/useDelete'
    import DepartmenteBlock from '@/components/Department/DepartmentBlock.vue'
    import axios from 'axios'

    interface Department {
        id: number
        title: string
        description: string
        status: string
        created_at: string
        updated_at: string
    }

    const route = useRoute()
    const router = useRouter()
    const department = ref<Department | null>(null)
    const departments = ref<Department[]>([])
    const currentPage = ref(1)
    const totalPages = ref(1)
    const totalItems = ref(0)
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

    const departmentId = computed(() => route.params.id)

    const { deleteItem, isDeleting } = useDelete({
        resource: 'department',
        confirmMessage: 'Delete this department? All sub-departments will also be deleted.',
        redirectAfterDelete: '/department'
    })

    const fetchDepartmentDetail = async () => {
        isLoading.value = true
        errorMessage.value = ''
        
        try {
            const token = localStorage.getItem('access_token')
            if (!token) {
                router.push('/login')
                return
            }
            const x_dep_id = localStorage.getItem('X-Department-Id')
            if(!x_dep_id){
                console.log(`Bee carefull X-Department-Id is not set`)
            }
            const response = await axios.get(`${API_URL}/department/${departmentId.value}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'X-Department-Id':x_dep_id
                }
            })
            const result = response.data
            if (result) {
                department.value = result.department
                departments.value = result.sub_departments
                currentPage.value = result.pagination?.current_page || 1
                totalPages.value = result.pagination?.last_page || 1
                totalItems.value = result.pagination?.total || 0

                console.log('✅ Success! Loaded', departments.value.length, 'memberships')
                console.log('current department:', department.value)
            } else {
                console.error('Unexpected response format:', response.data)
                console.error('result:', result)
                departments.value = []
            }
            
        } catch (error: any) {
            console.error('Failed to load department:', error)
            errorMessage.value = error.response?.data?.message || 'Department not found'
        } finally {
            isLoading.value = false
        }
    }

    const goBack = () => {
        router.push('/department')
    }

    // const goToUpdate = () => {
    //     router.push(`/department/${departmentId.value}/edit`)// need to change and question
    // }
    const goToUpdate = () => {
        router.push({
            path: `/department/${departmentId.value}/edit`,
            query: { parent_id: departmentId.value }
        })
    }

    const createSubDepartment = () => {
        router.push({
            path: '/department/create',
            query: { parent_id: departmentId.value }
        })
    }
    const handleDelete = async () => {
        //console.log(`You are in DepartmentDetail and id(delete) is: `,departmentId.value)
        await deleteItem(Number(departmentId.value))
    }
    const goToDepartmentDetail = (id: number) => {
        router.push(`/department/${id}`)
    }

    const handleDepartmentDeleted = () => {
        // Refresh the list without reloading the page
        console.log(`DEPARTMENTLIST: A department is delteted. Id: `)
        //fetchDepartments()
    }
    onMounted(() => {
        fetchDepartmentDetail()
    })
</script>

<template>
    <div class="min-h-screen bg-gray-50 py-8">
        <div class="container mx-auto px-4 max-w-8xl">
            <!-- Back Button -->
            <button 
                @click="goBack"
                class="mb-6 flex items-center gap-2 text-emerald-600 hover:text-emerald-700 transition-colors"
            >
                ← Back to Departments
            </button>
            
            <!-- Loading State -->
            <div v-if="isLoading" class="text-center py-12">
                <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
                <p class="mt-4 text-gray-600">Loading department details...</p>
            </div>
            
            <!-- Error State -->
            <div v-else-if="errorMessage" class="text-center py-12">
                <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
                    {{ errorMessage }}
                </div>
            </div>
            
            <!-- Department Detail -->
            <div v-else-if="department" class="bg-white rounded-xl shadow-lg overflow-hidden">
                <div class="bg-linear-to-r from-emerald-500 to-green-500 p-6">
                    <h1 class="text-3xl font-bold text-white">{{ department.title }}</h1>
                    <p class="text-white opacity-90 mt-2">ID: {{ department.id }}</p>
                </div>
                
                <div class="p-6 space-y-4">
                    <div>
                        <h3 class="text-lg font-semibold text-gray-700 mb-2">Description</h3>
                        <p class="text-gray-600 leading-relaxed">{{ department.description }}</p>
                    </div>
                    
                    <div class="grid grid-cols-2 gap-4 pt-4">
                        <div>
                            <h4 class="text-sm font-semibold text-gray-500">Status</h4>
                            <p class="text-gray-800">
                                <span :class="department.status === 'active' ? 'text-green-600' : 'text-red-600'">
                                    {{ department.status || 'Active' }}
                                </span>
                            </p>
                        </div>
                        <div>
                            <h4 class="text-sm font-semibold text-gray-500">Created</h4>
                            <p class="text-gray-800">{{ new Date(department.created_at).toLocaleDateString() }}</p>
                        </div>
                    </div>
                    <div class="flex flex-row gap-2 px-3 py-2 justify-around border-b-2 border-gray-400">
                        <div class="flex gap-3 pt-6">
                            <button 
                                @click="goToUpdate"
                                class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                Update Department
                            </button>
                        </div>
                        <div class="flex gap-3 pt-6">
                            <button 
                                @click="handleDelete"
                                class="px-4 py-2 bg-red-400 text-white rounded-lg hover:bg-red-600 transition-colors"
                            >
                                Delete Department
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <!-- -->
        <div v-if="departments" class="container mx-auto px-4">
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
                    @click="createSubDepartment"
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
                <p class="text-gray-500">No subdepartments found</p>
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