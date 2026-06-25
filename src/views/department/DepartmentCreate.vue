<!-- src/views/department/DepartmentCreate.vue -->
<script setup lang="ts">
    import { ref, computed } from 'vue'
    import { useRoute, useRouter } from 'vue-router'
    import axios from 'axios'

    interface DepartmentForm {
        title: string
        description: string
        organization_id: string
        path: number
        parent_id: number | null
    }

    const route = useRoute()
    const router = useRouter()
    const isLoading = ref(false)
    const isSaving = ref(false)
    const errorMessage = ref('')
    const successMessage = ref('')

    const API_URL = 'http://localhost:8000/api'

    // Form data - plain object, not nested
    const formData = ref<DepartmentForm>({
        title: '',
        description: '',
        organization_id: '1',
        path: 0,
        parent_id: null
    })

    // Get parent_id from URL query parameter
    const parentId = computed(() => {
        const id = parseInt(route.query.parent_id as string)
        return isNaN(id) ? null : id  // ← Returns null if no parent_id in URL
    })

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
            if (!x_dep_id) {
                console.log('Be careful: X-Department-Id is not set')
            }
            
            // ✅ FIXED: Use formData.value, not formData
            const payload = {
                title: formData.value.title,
                description: formData.value.description,
                organization_id: formData.value.organization_id,
                path: formData.value.path,
                parent_id: parentId.value
            }
            
            console.log('New department info:', payload)
            
            const response = await axios.post(`${API_URL}/department`, payload, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    'X-Department-Id': x_dep_id
                }
            })
            
            successMessage.value = 'Department created successfully!'
            
            // Redirect after 1.5 seconds
            setTimeout(() => {
                if(parentId.value){
                    router.push(`/department/${parentId.value}`)
                }
                else{
                    router.push('/department')
                }
            }, 1500)
            
        } catch (error: any) {
            console.error('Failed to save department:', error)
            
            if (error.response?.data?.errors) {
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

    const handleCancel = () => {
        if(parentId.value){
            router.push(`/department/${parentId.value}`)
        }
        else{
            router.push('/department')
        }
    }
</script>

<template>
    <div class="min-h-screen bg-gray-50 py-8">
        <div class="container mx-auto px-4 max-w-3xl">
            <!-- Header -->
            <div class="mb-6">
                <button 
                    @click="handleCancel"
                    class="mb-4 flex items-center gap-2 text-emerald-600 hover:text-emerald-700"
                >
                    ← Back to Departments
                </button>
                
                <h1 class="text-3xl font-bold text-gray-800">Create New Department</h1>
                <p class="text-gray-500 mt-1">Add a new department to your organization</p>
            </div>
            
            <!-- Success Message -->
            <div v-if="successMessage" class="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
                {{ successMessage }}
            </div>
            
            <!-- Error Message -->
            <div v-if="errorMessage" class="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                {{ errorMessage }}
            </div>
            
            <!-- Form -->
            <div class="bg-white rounded-xl shadow-lg overflow-hidden">
                <form @submit.prevent="handleSubmit" class="p-6 space-y-6">
                    <!-- Title Field -->
                    <div>
                        <label class="block text-sm font-semibold text-gray-700 mb-2">
                            Department Title <span class="text-red-500">*</span>
                        </label>
                        <input 
                            v-model="formData.title"
                            type="text"
                            class="w-full p-3 text-gray-800 bg-gray-50 border border-gray-200 rounded-lg 
                                   focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            placeholder="e.g., Engineering, Marketing, Sales"
                            required
                        >
                        <p v-if="formData.title && formData.title.length < 3" class="text-red-500 text-sm mt-1">
                            Title must be at least 3 characters
                        </p>
                    </div>
                    
                    <!-- Description Field -->
                    <div>
                        <label class="block text-sm font-semibold text-gray-700 mb-2">
                            Description <span class="text-red-500">*</span>
                        </label>
                        <textarea 
                            v-model="formData.description"
                            rows="5"
                            class="w-full p-3 text-gray-800 bg-gray-50 border border-gray-200 rounded-lg 
                                   focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                            placeholder="Describe the department's purpose, responsibilities, and goals..."
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
                    
                    <!-- Parent Department (if coming from a parent) -->
                    <div v-if="parentId > 0" class="bg-gray-50 p-3 rounded-lg">
                        <p class="text-sm text-gray-600">
                            This will be created as a <strong>sub-department</strong>
                        </p>
                    </div>
                    
                    <!-- Actions -->
                    <div class="flex gap-3 pt-4 border-t border-gray-200">
                        <button 
                            type="submit"
                            :disabled="isSaving || !isValidForm"
                            class="flex-1 px-6 py-3 bg-emerald-600 text-white rounded-lg 
                                   hover:bg-emerald-700 transition-all duration-200 
                                   disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
                        >
                            <span v-if="!isSaving">Create Department</span>
                            <span v-else class="flex items-center justify-center gap-2">
                                <span class="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                                Creating...
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