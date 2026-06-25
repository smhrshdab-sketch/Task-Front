<!-- src/components/DepartmentBlock.vue -->
<script setup lang="ts">
    import { computed } from 'vue'
    import { useRouter } from 'vue-router'
    import { useDelete } from '@/composables/useDelete'

    // Props with proper typing
    interface Props {
        id: number
        title: string
        description: string
        status?: string
    }

    const props = defineProps<Props>()

    const router = useRouter()
    const emit = defineEmits<{
        (e: 'click'): void
        (e: 'delete', id: number): void
        (e: 'edit', id: number): void
        (e: 'suspend', id: number): void
    }>()
    const { deleteItem, isDeleting } = useDelete({
        resource: 'department',
        confirmMessage: `Delete "${props.title}"? This action cannot be undone.`,
        successMessage: `Department "${props.title}" deleted successfully`,
        onSuccess: () => {
            // Emit event to parent to refresh the list
            emit('delete',props.id)
        }
    })
    // Action handlers
    const handleCardClick = () => {
        emit('click')
    }

    const handleDelete = async (e: Event) => {
        e.stopPropagation()  // Prevent card click
        
        const result = await deleteItem(props.id)
        if (result) {
            // Optional: Any additional cleanup
        }
    }

    const handleEdit = (e: Event) => {
        e.stopPropagation()
        router.push(`/department/${props.id}/edit`)
    }

    const handleSuspend = (e: Event) => {
        e.stopPropagation()
        if (confirm(`Suspend department "${props.title}"?`)) {
            emit('suspend', props.id)
        }
    }

    // Truncate description
    const truncatedDescription = computed(() => {
    const description = props.description ?? ''

    return description.length > 60
        ? description.slice(0, 60) + '...'
        : description
    })

</script>

<template>
    <div 
        @click="handleCardClick"
        class="group bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden border border-gray-100 hover:border-emerald-200"
    >
        <!-- Title Section -->
        <div v-if="status == 'active'" class="p-4 bg-linear-to-r from-emerald-500 to-green-500">
            <h3 class="text-xl font-bold text-white line-clamp-2">
                {{ title }}
            </h3>
        </div>
        <div v-else class="p-4 bg-linear-to-r from-red-300 to-red-500">
            <h3 class="text-xl font-bold text-white line-clamp-2">
                {{ title }}
            </h3>
        </div>
        
        <!-- Description Section -->
        <div class="p-4 bg-gray-50 min-h-25">
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
            
            <button 
                @click="handleSuspend"
                class="p-2 rounded-lg hover:bg-yellow-50 transition-colors"
                title="Suspend"
            >
                <span class="text-yellow-500 text-xl">⏸️</span>
            </button>
        </div>
    </div>
</template>