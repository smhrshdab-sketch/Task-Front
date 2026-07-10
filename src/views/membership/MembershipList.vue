<script setup lang="ts">
import { ref, onMounted,computed } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import MembershipBlock from '@/components/membership/MembershipBlock.vue'
import MembershipHero from '@/components/membership/MembershipHero.vue'

interface Membership {
    id: number
    status: string
    created_at: string
    account: {
        id: number
        name: string
        email: string
        avatar_path: string | null
    }
    department: {
        id: number
        title: string
        path: string
    } | null
    role: {
        id: number
        title: string
        slug: string
    }
}

interface PaginationMeta {
    current_page: number
    last_page: number
    per_page: number
    total: number
}

interface MembershipListData {
    items: Membership[]
    pagination: PaginationMeta
}

interface ApiResponse {
    success: boolean
    data: MembershipListData
    message: string
}


const router = useRouter()
const memberships = ref<Membership[]>([])
const isLoading = ref(true)
const errorMessage = ref('')
const currentPage = ref(1)
const totalPages = ref(1)
const totalItems = ref(0)
const searchQuery = ref('')

const API_URL = import.meta.env.VITE_API_URL
const filteredMemberships = computed(() => {
    if (!searchQuery.value) return memberships.value
    const search = searchQuery.value.toLowerCase()
    return memberships.value.filter(membership => 
        membership.account.name.toLowerCase().includes(search) ||
        membership.account.email.toLowerCase().includes(search) ||
        membership.department?.title.toLowerCase().includes(search) ||
        membership.role.title.toLowerCase().includes(search) ||
        membership.role.slug.toLowerCase().includes(search)
    )
})
console.log(`filteredMemberships is: `,filteredMemberships)
const fetchMemberships = async () => {
    isLoading.value = true
    errorMessage.value = ''

    try {
        const token = localStorage.getItem('access_token')
        if (!token) {
            router.push('/login')
            return
        }

        const response = await axios.get<ApiResponse>(`${API_URL}/membership`, {
            headers: {
                Authorization: `Bearer ${token}`,
                'X-Department-Id': localStorage.getItem('X-Department-Id') || '1'
            }
        })

        console.log('Full response:', response.data)

        const result = response.data.data

        if (result && Array.isArray(result.items)) {
            memberships.value = result.items
            currentPage.value = result.pagination?.current_page || 1
            totalPages.value = result.pagination?.last_page || 1
            totalItems.value = result.pagination?.total || 0

            console.log('✅ Success! Loaded', memberships.value.length, 'memberships')
            console.log('First membership:', memberships.value[0])
        } else {
            console.error('Unexpected response format:', response.data)
            memberships.value = []
        }
    } catch (error: any) {
        console.error('Failed to load memberships:', error)
        errorMessage.value = error.response?.data?.message || 'Failed to load memberships'
        memberships.value = []
    } finally {
        isLoading.value = false
    }
}


const goToDetail = (id: number) => {
    if (id) {
        router.push(`/membership/${id}`)
    }
}

const goToCreate = () => {
    router.push('/membership/create')
}

onMounted(() => {
    fetchMemberships()
})
</script>

<template>
    <div class="min-h-screen bg-gray-50">
        <MembershipHero 
                    title="Memberships"
                    description="Manage user memberships and permissions"
                    color="rgb(158 73 149)"
                />
        <div class="container mx-auto pt-3">
            <!-- Header -->
            <div class="flex justify-between items-center gap-2 mb-6">
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
                    @click="goToCreate"
                    class="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                >
                    + Add Membership
                </button>
            </div>
            
            <!-- Loading State -->
            <div v-if="isLoading" class="text-center py-12">
                <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
                <p class="mt-4 text-gray-600">Loading memberships...</p>
            </div>
            
            <!-- Error State -->
            <div v-else-if="errorMessage" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
                {{ errorMessage }}
            </div>
            
            <!-- Empty State -->
            <div v-else-if="memberships.length === 0" class="text-center py-12">
                <p class="text-gray-500">No memberships found</p>
                <button 
                    @click="goToCreate"
                    class="mt-4 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
                >
                    Create your first membership
                </button>
            </div>
            
            <!-- Memberships Grid -->
            <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <!-- ✅ Add check for membership existence -->
                <MembershipBlock 
                    v-for="membership in filteredMemberships" 
                    :key="membership?.id ?? Math.random()"
                    :membership="membership"
                    @click="membership?.id && goToDetail(membership.id)"
                />
            </div>
            
            <!-- Pagination -->
            <div v-if="totalPages > 1" class="mt-8">
                <div class="flex justify-center gap-2">
                    <button 
                        @click="handlePageChange(currentPage - 1)"
                        :disabled="currentPage === 1"
                        class="px-3 py-1 border rounded disabled:opacity-50"
                    >
                        Previous
                    </button>
                    <span class="px-3 py-1">
                        Page {{ currentPage }} of {{ totalPages }}
                    </span>
                    <button 
                        @click="handlePageChange(currentPage + 1)"
                        :disabled="currentPage === totalPages"
                        class="px-3 py-1 border rounded disabled:opacity-50"
                    >
                        Next
                    </button>
                </div>
            </div>
            
            <!-- Debug Section (remove after fixing) -->
            <div v-if="!isLoading && memberships.length === 0 && !errorMessage" class="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p class="text-yellow-800 font-semibold">Debug Info:</p>
                <pre class="text-xs mt-2">{{ { membershipsLength: memberships.length, totalItems, currentPage, totalPages } }}</pre>
            </div>
        </div>
    </div>
</template>