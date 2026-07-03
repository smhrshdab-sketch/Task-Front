<!-- src/components/Pagination.vue -->
<script setup lang="ts">
import { computed } from 'vue'

interface Props {
    currentPage: number
    totalPages: number
    maxVisible?: number  // Maximum number of page buttons to show
    showFirstLast?: boolean  // Show first/last buttons
    showPreviousNext?: boolean  // Show previous/next buttons
    showPageNumbers?: boolean  // Show page number buttons
    showInfo?: boolean  // Show "Page X of Y" info
    variant?: 'default' | 'compact' | 'simple'  // Visual style
}

const props = withDefaults(defineProps<Props>(), {
    maxVisible: 5,
    showFirstLast: true,
    showPreviousNext: true,
    showPageNumbers: true,
    showInfo: true,
    variant: 'default'
})

const emit = defineEmits<{
    (e: 'page-change', page: number): void
}>()

// Generate array of page numbers to display
const visiblePages = computed(() => {
    if (!props.showPageNumbers) return []
    
    const pages: (number | string)[] = []
    const halfVisible = Math.floor(props.maxVisible / 2)
    let startPage = Math.max(1, props.currentPage - halfVisible)
    let endPage = Math.min(props.totalPages, startPage + props.maxVisible - 1)
    
    // Adjust if we're near the end
    if (endPage - startPage + 1 < props.maxVisible) {
        startPage = Math.max(1, endPage - props.maxVisible + 1)
    }
    
    // Add first page with ellipsis
    if (startPage > 1) {
        pages.push(1)
        if (startPage > 2) pages.push('...')
    }
    
    // Add visible pages
    for (let i = startPage; i <= endPage; i++) {
        pages.push(i)
    }
    
    // Add last page with ellipsis
    if (endPage < props.totalPages) {
        if (endPage < props.totalPages - 1) pages.push('...')
        pages.push(props.totalPages)
    }
    
    return pages
})

// Navigation methods
const goToPage = (page: number) => {
    if (page >= 1 && page <= props.totalPages && page !== props.currentPage) {
        emit('page-change', page)
        //console.info(`(Pagination)[goToPage]`)
    }
}

const nextPage = () => {
    if (props.currentPage < props.totalPages) {
        emit('page-change', props.currentPage + 1)
    }
}

const previousPage = () => {
    if (props.currentPage > 1) {
        emit('page-change', props.currentPage - 1)
    }
}

const firstPage = () => {
    if (props.currentPage !== 1) {
        emit('page-change', 1)
    }
}

const lastPage = () => {
    if (props.currentPage !== props.totalPages) {
        emit('page-change', props.totalPages)
    }
}

// Button styling based on variant
const buttonClasses = computed(() => {
    const base = 'px-3 py-2 rounded-lg transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed'
    
    switch (props.variant) {
        case 'compact':
            return `${base} px-2 py-1 text-sm`
        case 'simple':
            return `${base} px-3 py-1 border`
        default:
            return `${base} hover:bg-emerald-50 text-gray-700 hover:text-emerald-600`
    }
})

const activeButtonClasses = computed(() => {
    switch (props.variant) {
        case 'compact':
            return 'bg-emerald-600 text-white'
        case 'simple':
            return 'bg-emerald-600 text-white'
        default:
            return 'bg-emerald-600 text-white hover:bg-emerald-700'
    }
})

const navButtonClasses = computed(() => {
    const base = 'px-3 py-2 rounded-lg transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed'
    
    switch (props.variant) {
        case 'compact':
            return `${base} px-2 py-1 text-sm hover:bg-gray-100`
        case 'simple':
            return `${base} px-3 py-1 border hover:bg-gray-50`
        default:
            return `${base} hover:bg-gray-100 text-gray-600`
    }
})
</script>

<template>
    <div v-if="totalPages > 0" class="flex flex-col items-center gap-3">
        <!-- Page info -->
        <div v-if="showInfo" class="text-sm text-gray-600">
            Page {{ currentPage }} of {{ totalPages }}
        </div>
        
        <!-- Pagination controls -->
        <div class="flex items-center gap-1 flex-wrap justify-center">
            <!-- First page button -->
            <button
                v-if="showFirstLast"
                @click="firstPage"
                :disabled="currentPage === 1"
                :class="navButtonClasses"
                title="First page"
            >
                <span class="hidden sm:inline">« First</span>
                <span class="sm:hidden">««</span>
            </button>
            
            <!-- Previous button -->
            <button
                v-if="showPreviousNext"
                @click="previousPage"
                :disabled="currentPage === 1"
                :class="navButtonClasses"
                title="Previous page"
            >
                <span class="hidden sm:inline">← Previous</span>
                <span class="sm:hidden">←</span>
            </button>
            
            <!-- Previous window (jump back by maxVisible) -->
            <button
                v-if="showPreviousNext && currentPage > maxVisible"
                @click="goToPage(Math.max(1, currentPage - maxVisible))"
                :class="navButtonClasses"
                title="Jump back"
            >
                ⋯
            </button>
            
            <!-- Page number buttons -->
            <template v-for="page in visiblePages" :key="page">
                <button
                    v-if="page === '...'"
                    :class="navButtonClasses"
                    disabled
                >
                    ...
                </button>
                <button
                    v-else
                    @click="goToPage(page as number)"
                    :class="[
                        buttonClasses,
                        currentPage === page ? activeButtonClasses : ''
                    ]"
                >
                    {{ page }}
                </button>
            </template>
            
            <!-- Next window (jump forward by maxVisible) -->
            <button
                v-if="showPreviousNext && currentPage <= totalPages - maxVisible"
                @click="goToPage(Math.min(totalPages, currentPage + maxVisible))"
                :class="navButtonClasses"
                title="Jump forward"
            >
                ⋯
            </button>
            
            <!-- Next button -->
            <button
                v-if="showPreviousNext"
                @click="nextPage"
                :disabled="currentPage === totalPages"
                :class="navButtonClasses"
                title="Next page"
            >
                <span class="hidden sm:inline">Next →</span>
                <span class="sm:hidden">→</span>
            </button>
            
            <!-- Last page button -->
            <button
                v-if="showFirstLast"
                @click="lastPage"
                :disabled="currentPage === totalPages"
                :class="navButtonClasses"
                title="Last page"
            >
                <span class="hidden sm:inline">Last »</span>
                <span class="sm:hidden">»»</span>
            </button>
        </div>
        
        <!-- Page size selector (optional) -->
        <div v-if="$slots.pageSize" class="flex items-center gap-2">
            <slot name="pageSize" />
        </div>
    </div>
</template>