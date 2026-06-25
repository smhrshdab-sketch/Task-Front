<!-- src/components/roleBlock.vue -->
<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'

// Props with proper typing
interface Props {
    id: number
    title: string
    description: 'fix description'
    slug: string
}

const props = defineProps<Props>()

const router = useRouter()
const emit = defineEmits<{
    (e: 'click'): void
    (e: 'delete', id: number): void
    (e: 'edit', id: number): void
    (e: 'suspend', id: number): void
}>()

// Action handlers
const handleCardClick = () => {
    emit('click')
}

const handleDelete = (e: Event) => {
    e.stopPropagation() // Prevent card click
    if (confirm(`Are you sure you want to delete "${props.title}"?`)) {
        emit('delete', props.id)
    }
}

const handleEdit = (e: Event) => {
    e.stopPropagation()
    router.push(`/role/${props.id}/update`)
}

// Truncate description
const truncatedDescription = computed(() => {
    console.log(`describ is : ${props.description} and length is : `)
    //if (props.description.length <= 60) return props.description
    return props.description
})
</script>

<template>
    <div 
        @click="handleCardClick"
        class="group bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden border border-gray-100 hover:border-emerald-200"
    >
        <!-- Title Section -->
        <div class="p-4 bg-linear-to-r from-blue-500 to-blue-200">
            <h3 class="text-xl font-bold text-white line-clamp-2">
                {{ title }}
            </h3>
        </div>
        
        <!-- Description Section -->
        <div class="p-4 bg-gray-50 min-h-25">
            <p class="text-xl text-black">{{ slug }}</p>
            <p class="text-gray-600 text-sm leading-relaxed">
                {{ truncatedDescription }}
            </p>
        </div>
        
        <!-- Actions Section -->
        <div class="p-3 bg-white border-t border-gray-100 flex justify-around gap-2">
            <button 
                @click="handleEdit"
                class="p-2 rounded-lg hover:bg-blue-50 transition-colors group"
                title="Edit"
            >
                <span class="text-blue-500 text-xl">✏️</span>
            </button>
            
            <button 
                @click="handleDelete"
                class="p-2 rounded-lg hover:bg-red-50 transition-colors"
                title="Delete"
            >
                <span class="text-red-500 text-xl">🗑️</span>
            </button>
        </div>
    </div>
</template>