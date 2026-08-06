<script setup lang="ts">
    import { ref, computed,onMounted,watch, toRaw } from 'vue'
    import { useRoute, useRouter } from 'vue-router'
    import Accordion from '@/components/Accordion.vue'
    import axios from 'axios'
    import api from '@/services/api.js';
    import Uploader from '@/components/Uploader.vue';
import { v4 as uuid } from 'uuid';
    //=======================
    interface TaskDetail {
        id:number
        department_id: string
        parent_id: number | null
        title: string
        description: string        
        path: number        
        status:string
        priority:string
        deadline:string
        //------------------
        contributors:{
            id: number
            status: string
            permissions_override: Record<string, boolean> | string
            created_at: string
            contributed_by:number
            contributor:number
            description:string
            task:number
            updated_at:string
            account: {
                id: number
                name: string
                email: string
                avatar_path: string | null
            }
            role: {
                id: number
                title: string
                slug: string
                description: string
                created_at: string
                updated_at: string
            }            
        }
        department:{
            id: number
            title: string
            description: string
            status: string
            created_at: string
            updated_at: string
        }
        attachments:{
            attachable_id:number,
            attachable_type:string,
            created_at:string,
            deleted_at:string,
            description:string,
            disk:string,
            file_name:string,
            file_path:string,
            id:number,
            is_public:boolean,
            mime_type:string,
            original_name:string,
            size:number,
            updated_at:string,
            uploaded_by:number
        }
    }
    interface member{
        id: number
        title: string
    }
    interface Attachment {
        id:number
        name: string
        size: number
        type: string
        content: File | null     
        isPersisted: boolean 
        url: string | null
    }
    interface TaskForm {
        department_id: string
        parent_id: number | null
        title: string
        description: string        
        path: number        
        status:string
        priority:string
        deadline:string
        memberships_engaged: Array<number>
        departments_engaged: Array<number>
        attachments: Array<File>

    }
    const route = useRoute()
    const router = useRouter()
    const errorMessage = ref('')
    const successMessage = ref('')
    const taskInfo = ref<TaskDetail>()
    const attachmentList = ref<Attachment[]>([])
    const pendingFiles = ref<File[]>([])
    const deletedFiles = ref<number[]>([])
    const colleague = ref<member[]>([])
    const originalEngaged = ref<number[]>([])
    const finalEngage = ref<number[]>([])
    const engageDeleteSelect = ref<number[]>([])    
    const engageAddSelect = ref<number[]>([])
    const partnames = ['description','engaged','departments','attachments','links']        
    const flag = ref('')
    const isSaving = ref(false)
    //=========================
    const formData = ref<TaskForm>({
        department_id: '',
        parent_id: null,
        title: '',
        description: '',        
        path: 0,     
        status:'preparation',
        priority:'medium',
        deadline:'',
        memberships_engaged: [],
        departments_engaged: [],
        attachments:[]
    })
    const taskId = computed(() => route.params.id)
    const clearDeleteEngagedSelectedEnability = computed(() => {
        //console.log(`[computed]clearDeleteEngagedSelectedEnability: `,engageDeleteSelect.value.length > 0)
        return engageDeleteSelect.value.length > 0
    })
    const deleteEngagedSelectedEnability = computed(() => {
       //console.log(`[computed]deleteEngagedSelectedEnability: `,engageDeleteSelect.value.length > 0)
        return engageDeleteSelect.value.length > 0
    })
    //---------------
    const clearAddEngagedSelectedEnability = computed(() => {
        //console.log(`[computed]clearAddEngagedSelectedEnability: `,engageAddSelect.value.length > 0)
        return engageAddSelect.value.length > 0
    })
    const addEngagedSelectedEnability = computed(() => {
       //console.log(`[computed]addEngagedSelectedEnability: `,engageAddSelect.value.length > 0)
        return engageAddSelect.value.length > 0
    })    
    const lastEngaged = () => {
        console.log(`originalEngaged: `,originalEngaged.value)
        console.log(`finalEngage.value(first): `,finalEngage.value)
        finalEngage.value = [...originalEngaged.value]
        console.log(`finalEngage.value(middle): `,finalEngage.value)
        if(engageAddSelect.value.length > 0){
            console.log(`engageAddSelect: `,engageAddSelect.value)            
            engageAddSelect.value.forEach(element => {
                finalEngage.value.push(element)
            })
            console.log(`finalEngage.value(last): `,finalEngage.value)
        }        
        else{
            console.log(`empty engageAddSelect: `,engageAddSelect.value)
        }
        if(engageDeleteSelect.value.length > 0){
            console.log(`engageDeleteSelect: `,engageDeleteSelect.value)
            console.log(`finalEngage.value(before): `,finalEngage.value)
            finalEngage.value = finalEngage.value.filter(item => !engageDeleteSelect.value.includes(item))
            console.log(`finalEngage.value(after): `,finalEngage.value)
        }
        else{
            console.log(`empty engageDeleteSelect: `,engageDeleteSelect.value)
        }
        console.log(`result90: `,finalEngage.value)
        return finalEngage
    }
    const restColleagues = computed(() => {
        const removeSet = new Set(finalEngage.value)        
        return colleague.value.filter(item => !removeSet.has(item.id))
    })
    //================
    //watch(engageDeleteSelect,(newVal) => {})
    const isValidForm = computed(() => {
        return formData.value.title.trim().length >= 3 && 
            formData.value.description.trim().length >= 10
    })
    const fetchTask = async () => {
        //isLoading.value = true
        errorMessage.value = ''
        
        try {
            const response = await api.get(`task/${taskId.value}`);

            taskInfo.value = response.data.data || []
            console.info(`taskInfo loaded: ${taskInfo.value.length}`, taskInfo.value)
            if(taskInfo.value?.attachments){
                taskInfo.value?.attachments.forEach(element => {
                    attachmentList.value.push({
                        id: element.id,
                        name: element.original_name,
                        size: element.size,
                        type: element.mime_type,
                        content: null,
                        isPersisted:true,
                        url:`${import.meta.env.VITE_URL}app/public/${element.file_path}`
                    })
                });
            }
            if(taskInfo.value?.contributors){
                originalEngaged.value = taskInfo.value.contributors.map(c => c.contributor)
                console.info(`4)originalEngaged: `, originalEngaged.value)

            }
            formData.value.description = taskInfo.value?.description
            formData.value.title = taskInfo.value?.title
            formData.value.priority = taskInfo.value?.priority
            formData.value.path = taskInfo.value?.path
            formData.value.parent_id = taskInfo.value?.parent_id
            formData.value.department_id = taskInfo.value?.department_id
            formData.value.deadline = taskInfo.value?.deadline            
            console.log(`taskInfo.value?.contributors.id: ${taskInfo.value?.contributors.contributor} and originalEngaged.value:`,originalEngaged.value)
            
        } catch (error: any) {
            console.error('Failed to load taskInfo:', error)
            errorMessage.value = error.response?.data?.message || 'Failed to load taskInfo'
            taskInfo.value = []
        } finally {
            //isLoading.value = false
        }
    }
    const fetchEngages = async () =>{
        errorMessage.value = ''
        
        try {
            const response = await api.get(`task/${taskId.value}/memberships`);

            taskInfo.value = response.data.data || []
            console.info(`taskInfo loaded: ${taskInfo.value.length}`, taskInfo.value)
            
        } catch (error: any) {
            console.error('Failed to load taskInfo:', error)
            errorMessage.value = error.response?.data?.message || 'Failed to load taskInfo'
            taskInfo.value = []
        } finally {
            //
        }
    }
    const fetchColleagues = async () => {
        //isLoading.value = true
        errorMessage.value = ''
        
        try {
            const response = await api.get(`department/memberships`);

            colleague.value = response.data.data || []
            console.info(`Colleague loaded: ${colleague.value.length}`, colleague.value)
            
        } catch (error: any) {
            console.error('Failed to load colleague:', error)
            errorMessage.value = error.response?.data?.message || 'Failed to load colleague'
            colleague.value = []
        } finally {
            //isLoading.value = false
        }
    }
    const handleFilesUploaded = (files: File[]) => {
        console.log("Files received from uploader, waiting for submit...");
        pendingFiles.value = files; 
        console.log(`(emit)UploadedFiles[pendingFiles.value]: `,pendingFiles.value)
    }
    const handleFileToDelete = (ids:number[]) => {
        console.log("Deleted Ids received from uploader, waiting for submit...");
        deletedFiles.value = ids; 
        console.log(`(emit)DeletedFiles[deletedFiles.value]: `,deletedFiles.value)
    }
    const updateTask= async () => {
        if(!taskInfo.value) return

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
        const response = await api.put(`/task/${taskId.value}`, formDataPayload);
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
    const menuClicked = (item:string) => {
        console.log(`${item} is clicked`)
        flag.value = item
    }
    const back = () => {
        router.push(`/task/${taskId.value}/detail`)
    }
    const deleteEngageSelectorToggle = (id:number) => {
        console.log(`deleteEngageSelectorToggle reached`)
        const isExist = engageDeleteSelect.value.find(item => item == id)
        if(isExist){
            console.log(`There is previous value so delete the value`)
            engageDeleteSelect.value = engageDeleteSelect.value.filter(item => item !== id)
            console.log(`Now engageDeleteSelect.value is: `,engageDeleteSelect.value)
        }
        else{
            console.log(`There is no previous value so insert the value!`)
            engageDeleteSelect.value.push(id);
            console.log(`Now engageDeleteSelect.value is: `,engageDeleteSelect.value)
        }
    }
    //----------------
    const addEngageSelectorToggle = (id:number) => {
        console.log(`addEngageSelectorToggle reached`)
        const isExist_temp = engageAddSelect.value.find(item => item == id)
        const isExist_orig = originalEngaged.value.find(item => item == id)
        if(isExist_temp || isExist_orig){
            console.log(`There is previous value. So delete the value (${id})`)
            engageAddSelect.value = engageAddSelect.value.filter(item => item !== id)
            console.log(`Now engageAddSelect.value is: `,engageAddSelect.value)
        }
        else{
            console.log(`There is no previous value. So insert the value (${id})!`)
            engageAddSelect.value.push(id);
            console.log(`Now engageAddSelect.value is: `,engageAddSelect.value)
        }
    }
    const deleteEngagedCheck = (id:number) => {
        const isExist = engageDeleteSelect.value.find(item => item == id)
        if(isExist){
            return true
        }
        else{
            return false
        }
    }
    const deleteEngagedSelectedClear = () => {
        engageDeleteSelect.value = []
    }
    const addEngagedSelectedClear = () => {
        engageAddSelect.value = []
    }
    const addEngagedCheck = (id:number) => {
        const isExist = engageAddSelect.value.find(item => item == id)
        if(isExist){
            return true
        }
        else{
            return false
        }
    }
    const addEngaged = async () => {
        lastEngaged()
        try {
            // Create FormData instead of a plain object task/{task}/engage
            const payload = {
                memberships_engaged: toRaw(finalEngage.value)
            }
            console.log(`payload: `,payload.memberships_engaged)
            const response = await api.put(`/task/${taskId.value}`, payload)           
            if(response.data.success){
                successMessage.value = response.data.message 
                console.log(`message from create task: `,response.data.message)  
                console.log(`1)data from create task: `,response.data)
                fetchColleagues() 
            }            
            else{
                console.log(`!! response for create task: `,response.data)
            }
            
            // Redirect after 1.5 seconds
            // setTimeout(() => {
            //     if(parentId.value){
            //         router.push(`/task/${parentId.value}`)
            //     }
            //     else{
            //         router.push('/tasks')
            //     }
            // }, 1500)
        }catch (error: any) {
            console.error('Failed to save task:', error)
            console.error(error.response.data.errors)
        }        
        console.log(`final engaged is: `,finalEngage.value)
        addEngagedSelectedClear()
    }
    const removeEngaged = async () => {
        lastEngaged()
        console.log(`final engaged is: `,finalEngage.value)
        deleteEngagedSelectedClear()
    }
    onMounted(() => {
        fetchTask()
        fetchEngages()
        fetchColleagues()
    })
</script>
<template>
    <div class="bg-[#994] w-full flex flex-col gap-1 justify-center p-3">
        <div class="w-full p-2 justify-center">
            <div class="w-full flex flex-col gap-1">
                <div class="p-2">
                    <span class="text-2xl font-bold">{{ taskInfo?.title }}</span>
                </div>
                <ul class="m-2 min-w-64 py-1 px-3 flex justity-around rounded bg-gray-200">
                    <li 
                        :class="['p-2 text-xl rounded cursor-pointer hover:bg-gray-300 hover:font-semibold',flag == link ? 'bg-gray-400' : '']"
                        v-for="link in partnames" :key="link"
                        @click="menuClicked(link)"
                    >            
                    {{ link }}
                    </li>
                </ul>
                <div class="p-2 bg-green-100">
                    <div v-if="flag == 'description'">
                        <div class="container mx-auto px-4 max-w-3xl">
            <!-- Header -->
            <div class="mb-6">
                
                <h1 class="text-3xl font-bold text-gray-800">Update the Task</h1>
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
                <form @submit.prevent="" class="p-6 space-y-6">
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
                    <!-- Actions -->
                    <div class="flex gap-3 pt-4 border-t border-gray-200">
                        <button 
                            type="submit"
                            :disabled="isSaving"
                            class="flex-1 px-6 py-3 bg-emerald-600 text-white rounded-lg 
                                   hover:bg-emerald-700 t cursor-pointerransition-all duration-200 
                                   disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
                        >
                            <span v-if="!isSaving || !isValidForm">Create Department</span>
                            <span v-else class="flex items-center justify-center gap-2">
                                <span class="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                                Creating...
                            </span>
                        </button>
                        
                        <button 
                            type="button"
                            @click=""
                            class="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg 
                                   hover:bg-gray-300 transition-all duration-200 font-semibold"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
        <!-- ============ -->
                    </div>
                    <div v-else-if="flag == 'engaged'">
                        <div class="rounded border-2 p-2">
                            <table class="w-full border-collapse">
                                <thead class="bg-gray-100">
                                    <tr>
                                        <th class="px-4 py-3 text-center text-sm font-semibold text-gray-700">
                                            <div class="flex items-center justify-center">
                                                <span>
                                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
                                                        <path stroke-linecap="round" stroke-linejoin="round" d="M5.25 8.25h15m-16.5 7.5h15m-1.8-13.5-3.9 19.5m-2.1-19.5-3.9 19.5" />
                                                    </svg>
                                                </span>
                                            </div>
                                        </th>
                                        <!-- #2 -->
                                        <th class="px-4 py-3 text-center text-sm font-semibold text-gray-700">
                                            <div class="flex flex-col items-center gap-1">
                                                <span class="text-base">Role</span>
                                                <span>
                                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
                                                        <path stroke-linecap="round" stroke-linejoin="round" d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342M6.75 15a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm0 0v-3.675A55.378 55.378 0 0 1 12 8.443m-7.007 11.55A5.981 5.981 0 0 0 6.75 15.75v-1.5" />
                                                    </svg>
                                                </span>
                                            </div>
                                        </th>
                                        <!-- #3 -->
                                        <th class="px-4 py-3 text-center text-sm font-semibold text-gray-700">
                                            <div class="flex flex-col items-center gap-1">
                                                <span class="text-base">Identity</span>
                                                <span>
                                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
                                                        <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                                                    </svg>
                                                </span>
                                            </div>
                                        </th>
                                        <th class="px-4 py-3 text-center text-sm font-semibold text-gray-700">
                                            <div class="flex flex-col items-center gap-1">
                                                <span class="text-base">Action</span>
                                                <span>
                                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
                                                        <path stroke-linecap="round" stroke-linejoin="round" d="M11.42 15.17 17.25 21A2.652 2.652 0 0 0 21 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 1 1-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 0 0 4.486-6.336l-3.276 3.277a3.004 3.004 0 0 1-2.25-2.25l3.276-3.276a4.5 4.5 0 0 0-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437 1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008Z" />
                                                    </svg>
                                                </span>
                                            </div>
                                        </th>
                                    </tr>
                                </thead>
                                <tbody class="divide-y divide-gray-200">
                                    <tr
                                        class="hover:bg-gray-50 transition-colors"
                                        v-for="(engaged,index) in taskInfo?.contributors" :key="index"
                                    >
                                        <td class="px-4 py-3 text-center">{{ index + 1 }}</td>
                                        <td class="px-4 py-3 text-center">{{ engaged.membership.role.slug }}</td>
                                        <td class="px-4 py-3 text-center">{{engaged.membership.account.name }}</td>
                                        <td class="px-4 py-3 flex justify-center">
                                            <input type="checkBox" class="" :checked="deleteEngagedCheck(engaged.contributor)" @change="deleteEngageSelectorToggle(engaged.contributor)">
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                            <div class="flex gap-3 p-6 bg-[#e3e3e3] ">
                                <button 
                                    type="button"
                                    :disabled="isSaving || !clearDeleteEngagedSelectedEnability"
                                    @click="deleteEngagedSelectedClear"
                                    class="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors disabled:opacity-50"
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit"
                                    :disabled="isSaving || !deleteEngagedSelectedEnability"
                                    @click="removeEngaged"
                                    class="flex-1 px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 cursor-pointer"
                                >
                                    {{ isSaving ? 'Deleting...' : 'Delete Selected' }}
                                </button>
                            </div>
                        </div>
                        <div class="rounded border-2 border-dashed mt-2 p-2">
                            <table class="w-full border-collapse">
                                <thead class="bg-gray-100">
                                    <tr>
                                        <th class="px-4 py-3 text-center text-sm font-semibold text-gray-700">
                                            <div class="flex items-center justify-center">
                                                <span>
                                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
                                                        <path stroke-linecap="round" stroke-linejoin="round" d="M5.25 8.25h15m-16.5 7.5h15m-1.8-13.5-3.9 19.5m-2.1-19.5-3.9 19.5" />
                                                    </svg>
                                                </span>
                                            </div>
                                        </th>
                                        <!-- #2 -->
                                        <th class="px-4 py-3 text-center text-sm font-semibold text-gray-700">
                                            <div class="flex flex-col items-center gap-1">
                                                <span class="text-base">Role</span>
                                                <span>
                                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
                                                        <path stroke-linecap="round" stroke-linejoin="round" d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342M6.75 15a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm0 0v-3.675A55.378 55.378 0 0 1 12 8.443m-7.007 11.55A5.981 5.981 0 0 0 6.75 15.75v-1.5" />
                                                    </svg>
                                                </span>
                                            </div>
                                        </th>
                                        <!-- #3 -->
                                        <th class="px-4 py-3 text-center text-sm font-semibold text-gray-700">
                                            <div class="flex flex-col items-center gap-1">
                                                <span class="text-base">Identity</span>
                                                <span>
                                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
                                                        <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                                                    </svg>
                                                </span>
                                            </div>
                                        </th>
                                        <th class="px-4 py-3 text-center text-sm font-semibold text-gray-700">
                                            <div class="flex flex-col items-center gap-1">
                                                <span class="text-base">Action</span>
                                                <span>
                                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
                                                        <path stroke-linecap="round" stroke-linejoin="round" d="M11.42 15.17 17.25 21A2.652 2.652 0 0 0 21 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 1 1-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 0 0 4.486-6.336l-3.276 3.277a3.004 3.004 0 0 1-2.25-2.25l3.276-3.276a4.5 4.5 0 0 0-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437 1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008Z" />
                                                    </svg>
                                                </span>
                                            </div>
                                        </th>
                                    </tr>
                                </thead>
                                <tbody class="divide-y divide-gray-200">
                                    <tr
                                        class="hover:bg-gray-50 transition-colors"
                                        v-for="(engaged,index) in restColleagues" :key="index"
                                    >
                                        <td class="px-4 py-3 text-center">{{ index + 1 }}</td>
                                        <td class="px-4 py-3 text-center">id: {{engaged.id }}</td>
                                        <td class="px-4 py-3 text-center">{{engaged.title }}</td>
                                        <td class="px-4 py-3 text-center">
                                            <input type="checkBox" class="" :checked="addEngagedCheck(engaged.id)" @change="addEngageSelectorToggle(engaged.id)">
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                            <div class="flex gap-3 p-6 bg-[#e3e3e3] ">
                                <button 
                                    type="button"
                                    :disabled="isSaving || !clearAddEngagedSelectedEnability"
                                    @click="addEngagedSelectedClear"
                                    class="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors disabled:opacity-50"
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit"
                                    :disabled="isSaving || !addEngagedSelectedEnability"
                                    @click="addEngaged"
                                    class="flex-1 px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 cursor-pointer"
                                >
                                    {{ isSaving ? 'Adding...' : 'Add Selected' }}
                                </button>
                            </div>
                        </div>
                    </div>
                    <div v-else-if="flag == 'departments'">
                        <table class="w-full border-collapse">
                            <thead class="bg-gray-100">
                                <tr>
                                    <th class="px-4 py-3 text-center text-sm font-semibold text-gray-700">
                                        <div class="flex items-center justify-center">
                                            <span>
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
                                                    <path stroke-linecap="round" stroke-linejoin="round" d="M5.25 8.25h15m-16.5 7.5h15m-1.8-13.5-3.9 19.5m-2.1-19.5-3.9 19.5" />
                                                </svg>
                                            </span>
                                        </div>
                                    </th>
                                    <!-- #2 -->
                                    <th class="px-4 py-3 text-center text-sm font-semibold text-gray-700">
                                        <div class="flex flex-col items-center gap-1">
                                            <span class="text-base">Department</span>
                                            <span>
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
                                                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0 0 12 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75Z" />
                                                </svg>
                                            </span>
                                        </div>
                                    </th>
                                    <th class="px-4 py-3 text-center text-sm font-semibold text-gray-700">
                                        <div class="flex flex-col items-center gap-1">
                                            <span class="text-base">Action</span>
                                            <span>
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
                                                    <path stroke-linecap="round" stroke-linejoin="round" d="M11.42 15.17 17.25 21A2.652 2.652 0 0 0 21 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 1 1-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 0 0 4.486-6.336l-3.276 3.277a3.004 3.004 0 0 1-2.25-2.25l3.276-3.276a4.5 4.5 0 0 0-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437 1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008Z" />
                                                </svg>
                                            </span>
                                        </div>
                                    </th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-gray-200">
                                <tr
                                     class="hover:bg-gray-50 transition-colors"
                                     v-for="(dep,index) in taskInfo?.departments" :key="index"
                                >
                                    <td class="px-4 py-3 text-center">{{ index + 1 }}</td>
                                    <td class="px-4 py-3 text-center">{{ dep['department'].title}}</td>
                                    <td class="px-4 py-3 flex justify-center">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6 hover:text-red-500 hover:cursor-pointer">
                                            <path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                                        </svg>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <div v-else-if="flag == 'attachments'">
                        <p>Attachments is clicked</p>
                        <Uploader
                            class="m-3"
                            :prviousFiles="attachmentList"
                            @files="handleFilesUploaded"
                            @deletePersisted="handleFileToDelete"
                        >
                            <!--  -->
                        </Uploader>
                        <button class="flex justify-center item-center bg-[#8ee676] hover:bg-[#4b793f]">
                            <span class="text-white text-xl hover:text-bold">submit</span>
                        </button>
                    </div>
                    <div v-else-if="flag == 'links'">
                        <p>Links is clicked</p>
                    </div>
                </div>                
            </div>
        </div>            
    </div>
</template>