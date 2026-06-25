<!-- src/components/PaginationVertical.vue -->
<script setup lang="ts">
import { computed } from 'vue'

interface Props {
    currentPage: number
    totalPages: number
    maxVisible?: number
}

const props = withDefaults(defineProps<Props>(), {
    maxVisible: 5
})

const emit = defineEmits<{
    (e: 'page-change', page: number): void
}>()

const visiblePages = computed(() => {
    const pages: number[] = []
    const start = Math.max(1, props.currentPage - Math.floor(props.maxVisible / 2))
    const end = Math.min(props.totalPages, start + props.maxVisible - 1)
    
    for (let i = start; i <= end; i++) {
        pages.push(i)
    }
    return pages
})

const goToPage = (page: number) => {
    if (page >= 1 && page <= props.totalPages && page !== props.currentPage) {
        emit('page-change', page)
    }
}
</script>

<template>
    <div class="flex flex-col items-center gap-2">
        <!-- Next window (down) -->
        <button
            v-if="currentPage < totalPages - Math.floor(maxVisible / 2)"
            @click="goToPage(currentPage + maxVisible)"
            class="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            title="Next window"
        >
            ↓ Next window ↓
        </button>
        
        <!-- Next page -->
        <button
            v-if="currentPage < totalPages"
            @click="goToPage(currentPage + 1)"
            class="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
        >
            Next Page ↓
        </button>
        
        <!-- Page numbers -->
        <div class="flex flex-col gap-1 my-2">
            <button
                v-for="page in visiblePages"
                :key="page"
                @click="goToPage(page)"
                :class="[
                    'w-12 h-12 rounded-lg transition-all duration-200 font-semibold',
                    currentPage === page 
                        ? 'bg-emerald-600 text-white' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                ]"
            >
                {{ page }}
            </button>
        </div>
        
        <!-- Previous page -->
        <button
            v-if="currentPage > 1"
            @click="goToPage(currentPage - 1)"
            class="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
        >
            ↑ Previous Page
        </button>
        
        <!-- Previous window (up) -->
        <button
            v-if="currentPage > maxVisible"
            @click="goToPage(currentPage - maxVisible)"
            class="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            title="Previous window"
        >
            ↑ Previous window ↑
        </button>
        
        <!-- End indicator -->
        <div v-if="currentPage === totalPages" class="text-gray-400 text-sm mt-2">
            — End —
        </div>
    </div>
</template>