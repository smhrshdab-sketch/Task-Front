<script setup lang="ts">
const props = defineProps<{
        id: number
        status: string
        title: string
        description: string
}>()

const emit = defineEmits<{
    (e: 'click'): void
}>()

const getStatusColor = (status: string) => {
    return status === 'active' 
        ? 'bg-green-100 text-green-700' 
        : 'bg-red-100 text-red-700'
}

const getAvatarUrl = (avatarPath: string | null) => {
    if (avatarPath) {
        return `http://localhost:8000/storage/${avatarPath}`
    }
    return null
}
</script>

<template>
    <div 
        @click="emit('click')"
        class="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden"
    >
        <!-- Header -->
        <div class="p-4 bg-linear-to-r from-blue-500 to-blue-600 text-white">
            <div class="flex items-center gap-3">
                <div class="flex-1">
                    <h3 class="font-bold text-lg">{{ props.title }}</h3>
                </div>
            </div>
        </div>
        
        <!-- Body -->
        <div class="p-4 space-y-3">
            <div class="flex justify-between">
                <span class="text-sm text-gray-500">Description:</span>
                <span>{{ props.description.slice(0,50) || 'None' }}</span>
            </div>
            <div class="flex justify-between">
                <span class="text-sm text-gray-500">Status:</span>
                <span :class="['px-2 py-1 rounded-full text-xs', getStatusColor(props.status)]">
                    {{ props.status }}
                </span>
            </div>
        </div>
    </div>
</template>