<script setup lang="ts">
    import { ref, computed,onMounted } from 'vue'
    import { useRoute, useRouter } from 'vue-router'
    import Accordion from '@/components/Accordion.vue'
    import axios from 'axios'
    import api from '@/services/api.js';
import Attachment from '@/Components/Shared/modals/AttachmentsModal/Attachment.vue';
    //=======================
    interface TaskDetail {
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
        attachment:{
            original_name:string
            mime_type:string
            size:number
        }
    }
    const route = useRoute()
    const router = useRouter()
    const errorMessage = ref('')
    const successMessage = ref('')
    const taskInfo = ref<TaskDetail>()
    const partnames = ['description','engaged','departments','attachments','links']        
    const flag = ref('')
    //=========================
    const taskId = computed(() => route.params.id)
    const fetchTask = async () => {
        //isLoading.value = true
        errorMessage.value = ''
        
        try {
            const response = await api.get(`task/${taskId.value}`);

            taskInfo.value = response.data.data || []
            console.info(`taskInfo loaded: ${taskInfo.value.length}`, taskInfo.value)
            
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
    const menuClicked = (item:string) => {
        console.log(`${item} is clicked`)
        flag.value = item
    }
    onMounted(() => {
        fetchTask()
        fetchEngages()
    })
</script>
<template>
    <div class="bg-[#994] w-full flex justify-center p-3">
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
                        <p>{{ taskInfo?.description }}</p>
                    </div>
                    <div v-else-if="flag == 'engaged'">
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
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6 hover:text-red-500 hover:cursor-pointer">
                                            <path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                                        </svg>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
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
                    </div>
                    <div v-else-if="flag == 'links'">
                        <p>Links is clicked</p>
                    </div>
                </div>                
            </div>
        </div>    
    </div>
</template>