<script setup lang="ts">
    import { ref, computed,onMounted } from 'vue'
    import { useRoute, useRouter } from 'vue-router'
    import Multiselect from 'vue-multiselect'
    import MultipleSelect from '@/components/Select/Custom/MultipleSelect.vue'
    import axios from 'axios'
    import Uploader from '@/components/Uploader.vue'
    import api from '@/services/api.js'

    interface TaskForm {
        department_id: string
        parent_id: number | null
        title: string
        description: string        
        path: number        
        status:string
        priority:string
        deadline:string

    }
    const route = useRoute()
    const router = useRouter()
    const isSaving = ref(false)
    const errorMessage = ref('')
    const successMessage = ref('')

    const API_URL = import.meta.env.VITE_API_URL

    // Form data - plain object, not nested
    const formData = ref<TaskForm>({
        department_id: '',
        parent_id: null,
        title: '',
        description: '',        
        path: 0,     
        status:'preparation',
        priority:'medium',
        deadline:''
    })

    // Get parent_id from URL query parameter
    const parentId = computed(() => {
        //const id = props.parent
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
        // Create FormData instead of a plain object
        const formDataPayload = new FormData();
        
        // Add all regular fields
        formDataPayload.append('title', formData.value.title);
        formDataPayload.append('description', formData.value.description);
        if (formData.value.department_id) formDataPayload.append('department_id', formData.value.department_id);
        if (formData.value.parent_id !== null) formDataPayload.append('parent_id', formData.value.parent_id);
        formDataPayload.append('status', formData.value.status);
        formDataPayload.append('priority', formData.value.priority);
        formDataPayload.append('deadline', formData.value.deadline);
        
        console.log('New task info:', formDataPayload);

        // The interceptor will automatically remove Content-Type header
        // so browser will set it to multipart/form-data with boundary
        const response = await api.post('/task', formDataPayload);
            if(response.data.success){
                successMessage.value = response.data.message 
                console.log(`message from create task: `,response.data.message)  
                console.log(`1)data from create task: `,response.data)           
            }            
            else{
                console.log(`!! response for create task: `,response.data)
            }
            
            // Redirect after 1.5 seconds
            setTimeout(() => {
                if(parentId.value){
                    router.push(`/task/${parentId.value}`)
                }
                else{
                    router.push('/tasks')
                }
            }, 1500)
            
        } catch (error: any) {
            console.error('Failed to save task:', error)
            console.error(error.response.data.errors)
        } finally {
            isSaving.value = false
        }
    }

    const handleCancel = () => {
        if(parentId.value){
            router.push(`/task/${parentId.value}`)
        }
        else{
            router.push('/tasks')
        }
    }
    onMounted(() => {
        //
    })
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
                    ← Back
                </button>
                
                <h1 class="text-3xl font-bold text-gray-800">Create New Task</h1>
                <p class="text-gray-500 mt-1">Add a new task</p>
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
                            Task Title <span class="text-red-500">*</span>
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
                            placeholder="Describe the task's purpose, responsibilities, and goals..."
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
                    <div>
                        <label class="block text-sm font-semibold text-gray-700 mb-2">
                            Task Date <span class="text-red-500">*</span>
                        </label>
                        <input 
                            v-model="formData.deadline"
                            type="date"
                            class="w-full p-3 text-gray-800 bg-gray-50 border border-gray-200 rounded-lg 
                                   focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            placeholder="YYYY-MM-DD HH:mm:SS"
                            required
                        >
                    </div>
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