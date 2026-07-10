<script setup lang="ts">
    import { ref, onMounted, computed } from 'vue'
    import { useRouter } from 'vue-router'
    import axios from 'axios'
    import TaskHero from '@/components/Task/TaskHero.vue'
    import TaskBlock from '@/components/Task/TaskBlock.vue'
    import GradientRing from '@/components/GradientRing.vue'
    interface Task {
        id: number
        title: string
        project:number
        department:number
        assignee:number
        description: string
        status: string
        priority:string
        deadLine:string
        created_at: string
        updated_at: string
    }
    //=================
    const router = useRouter()
    const tasks = ref<Task[]>([])
    const isLoading = ref(true)
    const errorMessage = ref('')
    const searchQuery = ref('')

    const API_URL = import.meta.env.VITE_API_URL

    const filteredTasks = computed(() => {
        if (!searchQuery.value) return tasks.value
        const search = searchQuery.value.toLowerCase()
        return tasks.value.filter(task => 
            task.title.toLowerCase().includes(search) ||
            task.description.toLowerCase().includes(search)
        )
    })
    const fetchTasks = async () => {
        isLoading.value = true
        errorMessage.value = ''
        
        try {
            const token = localStorage.getItem('access_token')
            if (!token) {
                router.push('/login')
                return
            }
            const x_dep_id = localStorage.getItem('X-Department-Id')
            const response = await axios.get(`${API_URL}/task`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'X-Department-Id':x_dep_id
                }
            })
            
            tasks.value = response.data.data || response.data
            
        } catch (error: any) {
            console.error('Failed to load tasks:', error)
            errorMessage.value = error.response?.data?.message || 'Failed to load tasks'
        } finally {
            isLoading.value = false
        }
    }
    const goToTaskDetail = (id: number) => {
    router.push(`/tasks/${id}`)
}

    const goToCreateTask = () => {
        router.push('/task/create')
    }

    const deleteTask = async (id: number, title: string) => {
        if (!confirm(`Are you sure you want to delete task "${title}"?`)) return
        
        try {
            const token = localStorage.getItem('access_token')
            await axios.delete(`${API_URL}/tasks/${id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            })
            
            // Refresh list
            await fetchTasks()
            
        } catch (error: any) {
            console.error('Failed to delete task:', error)
            alert(error.response?.data?.message || 'Failed to delete task')
        }
    }

    onMounted(() => {
        fetchTasks()
    })
</script>
<template>
    <div class="min-h-screen bg-gray-50">
        <!-- Header -->
        <TaskHero 
                    title="Tasks"
                    description="Manage user tasks and permissions"
                    color="rgb(58 73 149)"
                />
        <div class="container mx-auto px-4">
            
            
            <!-- Search -->
            <div class="flex justify-between items-center gap-4 my-6">
                <div class="flex-1 relative">
                    <input 
                        v-model="searchQuery"
                        type="text" 
                        class="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        placeholder="Search tasks by name or description..."
                    >
                    <span class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">🔍</span>
                </div>
                
                <button 
                    @click="goToCreateTask"
                    class="px-4 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors flex items-center gap-2"
                >
                    <span>➕ Create New Task</span>
                </button>
            </div>
            
            <!-- Loading -->
            <div v-if="isLoading" class="text-center py-12">
                <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
                <p class="mt-4 text-gray-600">Loading tasks...</p>
            </div>
            
            <!-- Error -->
            <div v-else-if="errorMessage" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
                {{ errorMessage }}
            </div>
            
            <!-- Tasks Grid -->
            <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <TaskBlock v-for="task in filteredTasks"
                    :key="task.id"
                    :id="task.id"
                    :title="task.title"
                    :status="task.status"
                    :description="task.description"
                    @click="goToTaskDetail(task.id)"
                >
                </TaskBlock>                
            </div>
            
            <!-- Empty State -->
            <div v-if="!isLoading && filteredTasks.length === 0" class="text-center py-12">
                <p class="text-gray-500">No tasks found</p>
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
    <GradientRing
        :outer-radius="80" 
        :inner-radius="60"
        :angle="153"
        :percentage="75"
        color1="#10B981"
        color2="#6a6d1e"
        label-format="percentage"
        sub-label="Completion"
        :label-font-size="32"
        :sub-label-font-size="14"
    >
    </GradientRing>
</template>