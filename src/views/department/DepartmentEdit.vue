<script setup lang="ts">
import { ref, onMounted,computed} from 'vue'
    import { useRoute, useRouter } from 'vue-router'
    import axios from 'axios'

    interface DepartmentForm {
        title: string
        description: string
        organization_id:string | '1'
        status: string
    }

    const route = useRoute()
    const router = useRouter()
    const isSaving = ref(false)
    //const parentId = ref<number | null>(null)
    const isLoading = ref(false)
    const errorMessage = ref('')
    const successMessage = ref('')

    const API_URL = import.meta.env.VITE_API_URL

    // Form data
    const formData = ref<DepartmentForm>({
        title: '',
        description: '',
        organization_id:'1',
        status: '',
    })
     const statusOptions = [
        { value: 'active', label: 'Active', color: 'green' },        
        { value: 'suspended', label: 'Suspended', color: 'yellow' },
        { value: 'active', label: 'Active', color: 'gray' }
    ]
    
    const parentId = computed(() => {
        const id = parseInt(route.query.parent_id as string)
        return isNaN(id) ? null : id 
    })
    // Fetch department data for editing
    const fetchDepartmentData = async () => {
        isLoading.value = true
        errorMessage.value = ''
        
        try {
            const token = localStorage.getItem('access_token')
            if (!token) {
                router.push('/login')
                return
            }
            const x_dep_id = localStorage.getItem('X-Department-Id')
            if (!x_dep_id) {
                console.log('Be careful: X-Department-Id is not set')
            }

            const response = await axios.get(`${API_URL}/department/${parentId.value}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    'X-Department-Id': x_dep_id
                }
            })

            const department = response.data.data || response.data
            console.log(`(DepartmentEdit) department: `,department)
            formData.value = {
                title: department.title || '',
                description: department.description || '',
                status: department.status || 'active',
                organization_id:'1',
            }
            
        } catch (error: any) {
            console.error('Failed to load department:', error)
            errorMessage.value = error.response?.data?.message || 'Failed to load department data'
        } finally {
            isLoading.value = false
        }
    }
     // Validate form
    const isValidForm = computed(() => {
        return formData.value.title.trim().length >= 3 && 
            formData.value.description.trim().length >= 10
    })

    const handleSubmit = async () => {
        if (!isValidForm.value) {
            errorMessage.value = 'Please fill all required fields correctly'
            return
        }
        
        errorMessage.value = ''
        successMessage.value = ''
        isSaving.value = true
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
            console.log(`(departmentEdit)formDatam: `,formData.value)
            let response = await axios.put(
                `${API_URL}/department/${parentId.value}`, 
                    formData.value,
                    {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json',
                            'X-Department-Id':x_dep_id
                        }
                    }
                )
            successMessage.value = 'Department updated successfully!'
            console.log(`(DepartmentEdit-handleSubmit) response: `,response)
            setTimeout(() => {
                router.push('/department')
            },1500)
        }catch (error: any) {
            console.error('Failed to save department:', error)
            
            if (error.response?.data?.errors) {
                // Handle validation errors
                const errors = error.response.data.errors
                errorMessage.value = Object.values(errors).flat().join(', ')
            } else if (error.response?.data?.message) {
                errorMessage.value = error.response.data.message
            } else {
                errorMessage.value = 'Failed to save department. Please try again.'
            }
        } finally {
            isSaving.value = false
        }
    }
    // Cancel and go back
    const handleCancel = () => {
        router.push('/department')
    }

</script>
<template>
    <div class="min-h-screen bg-gray-50 py-8">
        <div class="container mx-auto px-4 max-w-3xl">
            <!-- Header -->
            <div class="mb-6">
                <button 
                    @click="handleCancel"
                    class="mb-4 flex items-center gap-2 text-emerald-600 hover:text-emerald-700 transition-colors"
                >
                    ← Back to Departments
                </button>
                
                <h1 class="text-3xl font-bold text-gray-800">
                    Edit Department
                </h1>
                <p class="text-gray-500 mt-1">
                    Update department information
                </p>
            </div>
            <!-- Loading State -->
            <div v-if="isLoading" class="bg-white rounded-xl shadow-lg p-12 text-center">
                <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
                <p class="mt-4 text-gray-600">Loading department data...</p>
            </div>
            <div v-else class="bg-white rounded-xl shadow-lg overflow-hidden">
                <!-- Success Message -->
                <div v-if="successMessage" class="m-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
                    {{ successMessage }}
                </div>
                
                <!-- Error Message -->
                <div v-if="errorMessage" class="m-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                    {{ errorMessage }}
                </div>
                <form @submit.prevent="handleSubmit" class="p-6 space-y-6">
                    <div>
                        <label for="title" class="block text-sm font-semibold text-gray-700 mb-2">
                            Department Title <span class="text-red-500">*</span>
                        </label>
                        <input 
                            id="title"
                            v-model="formData.title"
                            type="text"
                            class="w-full p-3 text-gray-800 bg-gray-50 border border-gray-200 rounded-lg 
                                   focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent
                                   transition-all duration-200"
                            placeholder="e.g., Engineering, Marketing, Sales"
                            :class="{ 'border-red-500': formData.title && formData.title.length < 3 }"
                            required
                        >
                        <p v-if="formData.title && formData.title.length < 3" class="text-red-500 text-sm mt-1">
                            Title must be at least 3 characters
                        </p>
                    </div>
                    
                    <!-- Description Field -->
                    <div>
                        <label for="description" class="block text-sm font-semibold text-gray-700 mb-2">
                            Description <span class="text-red-500">*</span>
                        </label>
                        <textarea 
                            id="description"
                            v-model="formData.description"
                            rows="5"
                            class="w-full p-3 text-gray-800 bg-gray-50 border border-gray-200 rounded-lg 
                                   focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent
                                   transition-all duration-200 resize-none"
                            placeholder="Describe the department's purpose, responsibilities, and goals..."
                            :class="{ 'border-red-500': formData.description && formData.description.length < 10 }"
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
                    
                    <label for="status" class="block text-sm font-semibold text-gray-700 mb-2">
                        Status
                    </label>
                    <select 
                        id="status"
                        v-model="formData.status"
                        class="w-full p-3 text-gray-800 bg-gray-50 border border-gray-200 rounded-lg 
                                focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent
                                transition-all duration-200 cursor-pointer"
                    >
                        <option v-for="option in statusOptions" :key="option.value" :value="option.value">
                            {{ option.label }}
                        </option>
                    </select>
                    <p class="text-gray-400 text-sm mt-1">
                        Status determines if this department is visible and active
                    </p>
                    
                    <!-- Form Preview (Optional) -->
                    <div class="border-t border-gray-200 pt-6">
                        <h3 class="text-sm font-semibold text-gray-700 mb-3">Preview</h3>
                        <div class="bg-linear-to-r from-emerald-50 to-green-50 rounded-lg p-4">
                            <h4 class="font-bold text-gray-800">{{ formData.title || 'Department Title' }}</h4>
                            <p class="text-gray-600 text-sm mt-2">{{ formData.description || 'Department description will appear here...' }}</p>
                            <span class="inline-block mt-2 px-2 py-1 text-xs rounded-full" 
                                  :class="{
                                      'bg-green-100 text-green-700': formData.status === 'active',
                                      'bg-red-100 text-red-700': formData.status === 'suspended'
                                  }">
                                {{ formData.status }}
                            </span>
                        </div>
                    </div>
                    
                    <!-- Form Actions -->
                    <div class="flex gap-3 pt-4 border-t border-gray-200">
                        <button 
                            type="submit"
                            :disabled="isSaving || !isValidForm"
                            class="flex-1 px-6 py-3 bg-emerald-600 text-white rounded-lg 
                                   hover:bg-emerald-700 transition-all duration-200 
                                   disabled:opacity-50 disabled:cursor-not-allowed
                                   font-semibold"
                        >
                            <span v-if="!isSaving">Update Department</span>
                            <span v-else class="flex items-center justify-center gap-2">
                                <span class="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                                Updating...
                            </span>
                        </button>
                        
                        <button 
                            type="button"
                            @click="handleCancel"
                            class="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg 
                                   hover:bg-gray-300 transition-all duration-200 font-semibold"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </div>
</template>