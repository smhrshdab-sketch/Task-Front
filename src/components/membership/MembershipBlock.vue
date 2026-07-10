<!-- src/components/membership/MembershipBlock.vue -->
<script setup lang="ts">
const props = defineProps<{
    membership: {
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
}>()

const emit = defineEmits<{
    (e: 'click'): void
}>()

// Add defensive check
if (!props.membership) {
    console.error('No membership prop received')
}

const getStatusColor = (status: string) => {
    return status === 'active' 
        ? 'bg-green-100 text-green-700' 
        : 'bg-red-100 text-red-700'
}

const getAvatarUrl = (avatarPath: string | null) => {
    if (avatarPath) {
        return `http://localhost:8080/storage/${avatarPath}`
    }
    return null
}
</script>

<template>
    <div 
        v-if="membership && membership.account"
        @click="emit('click')"
        class="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden"
    >
        <!-- Header -->
        <div class="p-4 bg-linear-to-r from-blue-500 to-blue-600 text-white">
            <div class="flex items-center gap-3">
                <img 
                    v-if="getAvatarUrl(membership.account.avatar_path)"
                    :src="getAvatarUrl(membership.account.avatar_path)"
                    class="w-12 h-12 rounded-full border-2 border-white object-cover"
                >
                <div v-else class="w-12 h-12 rounded-full bg-white/30 flex items-center justify-center text-xl font-bold">
                    {{ membership.account.name?.charAt(0) || '?' }}
                </div>
                <div class="flex-1">
                    <h3 class="font-bold text-lg">{{ membership.account.name }}</h3>
                </div>
            </div>
        </div>
        
        <!-- Body -->
        <div class="p-4 space-y-3">
            <div class="flex justify-between">
                <span class="text-sm text-gray-500">Role:</span>
                <span class="font-semibold">{{ membership.role?.title }}</span>
            </div>
            <div class="flex justify-between">
                <span class="text-sm text-gray-500">Department:</span>
                <span>{{ membership.department?.title || 'None' }}</span>
            </div>
            <div class="flex justify-between">
                <span class="text-sm text-gray-500">Status:</span>
                <span :class="['px-2 py-1 rounded-full text-xs', getStatusColor(membership.status)]">
                    {{ membership.status }}
                </span>
            </div>
        </div>
    </div>
</template>