<script setup lang="ts">
    import { ref, onMounted, computed } from 'vue'
    import { useRouter } from 'vue-router'
    import axios from 'axios'
    import RecordHero from '@/components/Hero.vue'
    import Switcher from '@/components/Switch.vue'
    import LogTable from '@/components/Table/LogTable.vue'
    import Pagination from '@/components/Pagination.vue'
    //==============
    interface Log {
        id: number
        subject_type: string
        subject_id:number
        causer_id:number
        description: string
        event: string 
        batch_id :string
        ip_address:string
        user_agent:string
        url:string
        method:string
        metadata:string
        created_at: string
        updated_at: string
    }
    //==============
    const router = useRouter()
    const currentPage = ref(1)
    const totalPages = ref()
    const perPages = ref()
    const totalItems = ref(0)
    const paginatePage = ref<number>(1)
    const logs = ref<Log[]>([])
    const logPage = ref<number>(1)
    const title = ref('')
    const headers = ref<String[]>([])
    const isLoading = ref(true)
    const errorMessage = ref('')
    const searchQuery = ref('')

    const API_URL = 'http://localhost:8000/api'

    //=========================

    const filteredLogs = computed(() => {
        if (!searchQuery.value) return logs.value
        const search = searchQuery.value.toLowerCase()
        return logs.value.filter(log => 
            log.subject_type.toLowerCase().includes(search) ||
            log.event.toLowerCase().includes(search) ||
            log.description.toLowerCase().includes(search)
        )
    })
    const fetchLogs = async (page = 1) => {
        isLoading.value = true
        errorMessage.value = ''
        
        try {
            const token = localStorage.getItem('access_token')
            if (!token) {
                router.push('/login')
                return
            }
            const payload = {
                limit : 10,
                search : '',
                page : page
            }
            const x_dep_id = localStorage.getItem('X-Department-Id')
            const response = await axios.get(`${API_URL}/audit`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    'X-Department-Id': x_dep_id || '10'
                },
                params: {
                    page: paginatePage.value,
                    limit: 10,
                    search: ''
                }               
            })
            
            //logs.value = response.data.data || response.data
            const result = response.data
            if (result) {
                title.value = result.title
                headers.value = result.headers
                logs.value = result.data
                currentPage.value = result.current_page || 1
                totalPages.value = result.last_page || 1
                totalItems.value = result.total || 0
                perPages.value = result.perPages || 10
                console.log('current result:', result)
                console.log('✅ Success! Loaded', logs.value.length, 'memberships')
                console.log('current log:', logs.value)
            } else {
                console.error('Unexpected response format:', response.data)
                console.error('result:', result)
                logs.value = []
            }
            
        } catch (error: any) {
            console.error('Failed to load logs:', error)
            errorMessage.value = error.response?.data?.message || 'Failed to load logs'
        } finally {
            isLoading.value = false
        }
    }    
    const handleCancel = () => {
        router.push('/')
    }
    const handleViewDetail = (log:Log) => {
        // Navigate to detail page or open modal
        console.log('Viewing log:', log)
        // router.push(`/audit-logs/${log.id}`)
    }
    const paginateInfo = (page:number) => {
        console.info(`paginate emit number: `,page)
        paginatePage.value = page
        fetchLogs(paginatePage.value)
    }
    onMounted(() => {
        fetchLogs(1)
    })
</script>
<template>
    <div class="min-h-screen bg-gray-50">
        <!-- Header -->
        <RecordHero 
                    title="Logs"
                    description="See all events in the application"
                    color="rgb(98 83 109)"
        />
        <button 
            @click="handleCancel"
            class="mb-4 flex items-center gap-2 text-emerald-600 hover:text-emerald-700"
        >
            ← Back to Dashboard
        </button>
        <div class="container mx-auto px-4">
            <div class="flex justify-between items-center gap-4 my-6">
                <div class="flex-1 relative">
                    <input 
                        v-model="searchQuery"
                        type="text" 
                        class="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        placeholder="Search logs by table name or description..."
                    >
                    <span class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">🔍</span>
                </div>
            </div>
            <!-- Loading -->
            <div v-if="isLoading" class="text-center py-12">
                <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
                <p class="mt-4 text-gray-600">Loading logs...</p>
            </div>
            
            <!-- Error -->
            <div v-else-if="errorMessage" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
                {{ errorMessage }}
            </div>
                <!-- <CrudTable
                    :title="title"
                    :headers="headers"
                    :contents="logs"
                    :hasCrud=false
                >
                </CrudTable> -->
                <LogTable 
                    :logs="logs" 
                    :loading="isLoading"
                    @view-detail="handleViewDetail"
                >
                </LogTable>
            <div v-if="!isLoading && filteredLogs.length === 0" class="text-center py-12">
                <p class="text-gray-500">No departments found</p>
                <button
                    v-if="searchQuery"
                    @click="searchQuery = ''"
                    class="mt-2 text-emerald-600 hover:text-emerald-700"
                >
                    Clear search
                </button>
            </div>
            <div v-else>
                <Pagination
                    :current-page="paginatePage"
                    :total-pages="totalPages"
                    :maxVisible="perPages"
                    :showFirstLast="true"
                    :showPreviousNext="true"
                    :showPageNumbers="true"
                    :showInfo="true"
                    :variant="default"
                    @page-change="paginateInfo"
                >                    
                </Pagination>
            </div>
        </div>
    </div>
</template>