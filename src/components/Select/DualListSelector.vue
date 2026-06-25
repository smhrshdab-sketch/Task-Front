<!-- src/components/DualListSelector.vue -->
<script setup lang="ts">
import { ref, computed, watch } from 'vue'

interface Item {
    id: number | string
    name: string
    description?: string
    icon?: string
}

interface Props {
    // Available items (not yet assigned)
    availableItems: Item[]
    // Selected items (assigned)
    selectedItems: Item[]
    // Title for left column (available)
    availableTitle?: string
    // Title for right column (selected)
    selectedTitle?: string
    // Search placeholder text
    searchPlaceholder?: string
    // Enable search functionality
    enableSearch?: boolean
    // Maximum items that can be selected (0 = unlimited)
    maxSelection?: number
    // Show item descriptions
    showDescriptions?: boolean
    // Allow removing from selected (right side)
    allowRemove?: boolean
    // Allow adding to selected (left side)
    allowAdd?: boolean
    // Loading state
    isLoading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
    availableItems: () => [],
    selectedItems: () => [],
    availableTitle: 'Available Items',
    selectedTitle: 'Selected Items',
    searchPlaceholder: 'Search items...',
    enableSearch: true,
    maxSelection: 0,
    showDescriptions: false,
    allowRemove: true,
    allowAdd: true,
    isLoading: false
})

const emit = defineEmits<{
    (e: 'update:selectedItems', items: Item[]): void
    (e: 'add', items: Item[]): void
    (e: 'remove', items: Item[]): void
}>()

// Search states
const availableSearch = ref('')
const selectedSearch = ref('')

// Selected items for bulk operations (checkbox selection)
const selectedAvailableItems = ref<Item[]>([])
const selectedSelectedItems = ref<Item[]>([])

// Filter available items based on search
const filteredAvailableItems = computed(() => {
    if (!props.enableSearch || !availableSearch.value) {
        return props.availableItems
    }
    const search = availableSearch.value.toLowerCase()
    return props.availableItems.filter(item => 
        item.name.toLowerCase().includes(search) ||
        (item.description && item.description.toLowerCase().includes(search))
    )
})

// Filter selected items based on search
const filteredSelectedItems = computed(() => {
    if (!props.enableSearch || !selectedSearch.value) {
        return props.selectedItems
    }
    const search = selectedSearch.value.toLowerCase()
    return props.selectedItems.filter(item => 
        item.name.toLowerCase().includes(search) ||
        (item.description && item.description.toLowerCase().includes(search))
    )
})

// Check if max selection reached
const isMaxSelectionReached = computed(() => {
    return props.maxSelection > 0 && props.selectedItems.length >= props.maxSelection
})

// Check if specific item is selected
const isItemSelected = (item: Item): boolean => {
    return props.selectedItems.some(selected => selected.id === item.id)
}

// Check if bulk select checkbox is checked for available items
const isAllAvailableSelected = computed(() => {
    return filteredAvailableItems.value.length > 0 && 
           selectedAvailableItems.value.length === filteredAvailableItems.value.length
})

// Check if bulk select checkbox is checked for selected items
const isAllSelectedSelected = computed(() => {
    return filteredSelectedItems.value.length > 0 && 
           selectedSelectedItems.value.length === filteredSelectedItems.value.length
})

// Add single item to selected
const addItem = (item: Item) => {
    if (!props.allowAdd) return
    if (isMaxSelectionReached.value) return
    if (isItemSelected(item)) return
    
    const newSelected = [...props.selectedItems, item]
    emit('update:selectedItems', newSelected)
    emit('add', [item])
    
    // Remove from bulk selection if present
    selectedAvailableItems.value = selectedAvailableItems.value.filter(i => i.id !== item.id)
}

// Remove single item from selected
const removeItem = (item: Item) => {
    if (!props.allowRemove) return
    
    const newSelected = props.selectedItems.filter(selected => selected.id !== item.id)
    emit('update:selectedItems', newSelected)
    emit('remove', [item])
    
    // Remove from bulk selection if present
    selectedSelectedItems.value = selectedSelectedItems.value.filter(i => i.id !== item.id)
}

// Add multiple items (bulk add)
const addMultipleItems = () => {
    if (!props.allowAdd) return
    
    // Filter out items that are already selected and respect max selection
    let itemsToAdd = [...selectedAvailableItems.value]
    
    if (isMaxSelectionReached.value) {
        const remainingSlots = props.maxSelection - props.selectedItems.length
        itemsToAdd = itemsToAdd.slice(0, remainingSlots)
    }
    
    if (itemsToAdd.length === 0) return
    
    const newSelected = [...props.selectedItems, ...itemsToAdd]
    emit('update:selectedItems', newSelected)
    emit('add', itemsToAdd)
    
    // Clear selection
    selectedAvailableItems.value = []
}

// Remove multiple items (bulk remove)
const removeMultipleItems = () => {
    if (!props.allowRemove) return
    
    const itemsToRemove = [...selectedSelectedItems.value]
    const newSelected = props.selectedItems.filter(
        selected => !itemsToRemove.some(toRemove => toRemove.id === selected.id)
    )
    
    emit('update:selectedItems', newSelected)
    emit('remove', itemsToRemove)
    
    // Clear selection
    selectedSelectedItems.value = []
}

// Move all items (add all available)
const addAllItems = () => {
    if (!props.allowAdd) return
    
    let itemsToAdd = [...props.availableItems]
    
    if (isMaxSelectionReached.value) {
        const remainingSlots = props.maxSelection - props.selectedItems.length
        itemsToAdd = itemsToAdd.slice(0, remainingSlots)
    }
    
    if (itemsToAdd.length === 0) return
    
    const newSelected = [...props.selectedItems, ...itemsToAdd]
    emit('update:selectedItems', newSelected)
    emit('add', itemsToAdd)
}

// Remove all items (clear selected)
const removeAllItems = () => {
    if (!props.allowRemove) return
    
    const itemsToRemove = [...props.selectedItems]
    emit('update:selectedItems', [])
    emit('remove', itemsToRemove)
}

// Toggle bulk select for available items
const toggleSelectAllAvailable = () => {
    if (isAllAvailableSelected.value) {
        selectedAvailableItems.value = []
    } else {
        selectedAvailableItems.value = [...filteredAvailableItems.value]
    }
}

// Toggle bulk select for selected items
const toggleSelectAllSelected = () => {
    if (isAllSelectedSelected.value) {
        selectedSelectedItems.value = []
    } else {
        selectedSelectedItems.value = [...filteredSelectedItems.value]
    }
}

// Check if an available item is in bulk selection
const isAvailableItemSelected = (item: Item): boolean => {
    return selectedAvailableItems.value.some(selected => selected.id === item.id)
}

// Check if a selected item is in bulk selection
const isSelectedItemSelected = (item: Item): boolean => {
    return selectedSelectedItems.value.some(selected => selected.id === item.id)
}

// Clear search inputs
const clearSearches = () => {
    availableSearch.value = ''
    selectedSearch.value = ''
}
</script>

<template>
    <div class="dual-list-selector">
        <!-- Loading State -->
        <div v-if="isLoading" class="flex justify-center items-center py-12">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
            <span class="ml-2 text-gray-600">Loading...</span>
        </div>
        
        <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- LEFT COLUMN: Available Items -->
            <div class="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
                <!-- Header -->
                <div class="bg-gradient-to-r from-gray-50 to-gray-100 p-4 border-b border-gray-200">
                    <div class="flex justify-between items-center mb-3">
                        <h3 class="font-semibold text-gray-700">
                            {{ availableTitle }}
                            <span class="text-sm text-gray-400 ml-1">
                                ({{ availableItems.length }})
                            </span>
                        </h3>
                        <button
                            v-if="allowAdd && availableItems.length > 0"
                            @click="addAllItems"
                            :disabled="isMaxSelectionReached"
                            class="text-xs px-2 py-1 bg-emerald-500 text-white rounded hover:bg-emerald-600 transition-colors disabled:opacity-50"
                            title="Add all"
                        >
                            Add All →
                        </button>
                    </div>
                    
                    <!-- Search -->
                    <div v-if="enableSearch" class="relative">
                        <input
                            v-model="availableSearch"
                            type="text"
                            :placeholder="searchPlaceholder"
                            class="w-full px-3 py-2 pl-8 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                        />
                        <span class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">🔍</span>
                    </div>
                </div>
                
                <!-- Bulk Select Bar -->
                <div v-if="filteredAvailableItems.length > 0" 
                     class="px-4 py-2 bg-gray-50 border-b border-gray-200 flex justify-between items-center text-sm">
                    <label class="flex items-center cursor-pointer">
                        <input
                            type="checkbox"
                            :checked="isAllAvailableSelected"
                            @change="toggleSelectAllAvailable"
                            class="mr-2 rounded border-gray-300 text-emerald-500 focus:ring-emerald-500"
                        />
                        <span class="text-gray-600">Select All</span>
                    </label>
                    <button
                        v-if="selectedAvailableItems.length > 0 && allowAdd"
                        @click="addMultipleItems"
                        :disabled="isMaxSelectionReached"
                        class="px-3 py-1 bg-emerald-500 text-white text-xs rounded hover:bg-emerald-600 transition-colors disabled:opacity-50"
                    >
                        Add Selected ({{ selectedAvailableItems.length }})
                    </button>
                </div>
                
                <!-- Items List -->
                <div class="max-h-96 overflow-y-auto">
                    <div v-if="filteredAvailableItems.length === 0" class="text-center py-8 text-gray-400">
                        No items available
                    </div>
                    
                    <div
                        v-for="item in filteredAvailableItems"
                        :key="item.id"
                        @click="addItem(item)"
                        :class="[
                            'item-card group cursor-pointer transition-all duration-200 border-b border-gray-100',
                            isItemSelected(item) ? 'opacity-50 bg-gray-50' : 'hover:bg-emerald-50',
                            isAvailableItemSelected(item) ? 'bg-emerald-50' : ''
                        ]"
                    >
                        <div class="flex items-center p-3">
                            <!-- Bulk select checkbox -->
                            <input
                                type="checkbox"
                                :checked="isAvailableItemSelected(item)"
                                @click.stop="(e) => {
                                    if (isAvailableItemSelected(item)) {
                                        selectedAvailableItems = selectedAvailableItems.filter(i => i.id !== item.id)
                                    } else {
                                        selectedAvailableItems = [...selectedAvailableItems, item]
                                    }
                                }"
                                class="mr-3 rounded border-gray-300 text-emerald-500 focus:ring-emerald-500"
                            />
                            
                            <!-- Icon -->
                            <div v-if="item.icon" class="mr-3 text-xl">
                                {{ item.icon }}
                            </div>
                            
                            <!-- Content -->
                            <div class="flex-1">
                                <div class="font-medium text-gray-800">
                                    {{ item.name }}
                                </div>
                                <div v-if="showDescriptions && item.description" class="text-sm text-gray-500">
                                    {{ item.description }}
                                </div>
                            </div>
                            
                            <!-- Add button -->
                            <button
                                v-if="allowAdd && !isItemSelected(item) && !isMaxSelectionReached"
                                @click.stop="addItem(item)"
                                class="opacity-0 group-hover:opacity-100 transition-opacity px-2 py-1 bg-emerald-500 text-white text-xs rounded hover:bg-emerald-600"
                            >
                                Add →
                            </button>
                            
                            <!-- Already selected badge -->
                            <span v-else-if="isItemSelected(item)" class="text-xs text-gray-400">
                                Added ✓
                            </span>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- RIGHT COLUMN: Selected Items -->
            <div class="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
                <!-- Header -->
                <div class="bg-gradient-to-r from-emerald-50 to-green-50 p-4 border-b border-emerald-200">
                    <div class="flex justify-between items-center mb-3">
                        <h3 class="font-semibold text-emerald-800">
                            {{ selectedTitle }}
                            <span class="text-sm text-emerald-600 ml-1">
                                ({{ selectedItems.length }}{{ maxSelection ? `/${maxSelection}` : '' }})
                            </span>
                        </h3>
                        <button
                            v-if="allowRemove && selectedItems.length > 0"
                            @click="removeAllItems"
                            class="text-xs px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                            title="Remove all"
                        >
                            ← Remove All
                        </button>
                    </div>
                    
                    <!-- Search -->
                    <div v-if="enableSearch" class="relative">
                        <input
                            v-model="selectedSearch"
                            type="text"
                            :placeholder="searchPlaceholder"
                            class="w-full px-3 py-2 pl-8 border border-emerald-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                        />
                        <span class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">🔍</span>
                    </div>
                </div>
                
                <!-- Bulk Select Bar -->
                <div v-if="filteredSelectedItems.length > 0" 
                     class="px-4 py-2 bg-emerald-50 border-b border-emerald-200 flex justify-between items-center text-sm">
                    <label class="flex items-center cursor-pointer">
                        <input
                            type="checkbox"
                            :checked="isAllSelectedSelected"
                            @change="toggleSelectAllSelected"
                            class="mr-2 rounded border-emerald-300 text-emerald-500 focus:ring-emerald-500"
                        />
                        <span class="text-emerald-700">Select All</span>
                    </label>
                    <button
                        v-if="selectedSelectedItems.length > 0 && allowRemove"
                        @click="removeMultipleItems"
                        class="px-3 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600 transition-colors"
                    >
                        Remove Selected ({{ selectedSelectedItems.length }})
                    </button>
                </div>
                
                <!-- Items List -->
                <div class="max-h-96 overflow-y-auto">
                    <div v-if="filteredSelectedItems.length === 0" class="text-center py-8 text-gray-400">
                        No items selected
                    </div>
                    
                    <div
                        v-for="item in filteredSelectedItems"
                        :key="item.id"
                        :class="[
                            'item-card group transition-all duration-200 border-b border-gray-100',
                            isSelectedItemSelected(item) ? 'bg-emerald-50' : 'hover:bg-red-50'
                        ]"
                    >
                        <div class="flex items-center p-3">
                            <!-- Bulk select checkbox -->
                            <input
                                type="checkbox"
                                :checked="isSelectedItemSelected(item)"
                                @click.stop="(e) => {
                                    if (isSelectedItemSelected(item)) {
                                        selectedSelectedItems = selectedSelectedItems.filter(i => i.id !== item.id)
                                    } else {
                                        selectedSelectedItems = [...selectedSelectedItems, item]
                                    }
                                }"
                                class="mr-3 rounded border-emerald-300 text-emerald-500 focus:ring-emerald-500"
                            />
                            
                            <!-- Icon -->
                            <div v-if="item.icon" class="mr-3 text-xl">
                                {{ item.icon }}
                            </div>
                            
                            <!-- Content -->
                            <div class="flex-1">
                                <div class="font-medium text-gray-800">
                                    {{ item.name }}
                                </div>
                                <div v-if="showDescriptions && item.description" class="text-sm text-gray-500">
                                    {{ item.description }}
                                </div>
                            </div>
                            
                            <!-- Remove button -->
                            <button
                                v-if="allowRemove"
                                @click.stop="removeItem(item)"
                                class="opacity-0 group-hover:opacity-100 transition-opacity px-2 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600"
                            >
                                ← Remove
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Max selection warning -->
        <div v-if="isMaxSelectionReached && maxSelection > 0" 
             class="mt-3 text-center text-sm text-amber-600">
            Maximum of {{ maxSelection }} items already selected
        </div>
    </div>
</template>

<style scoped>
.dual-list-selector {
    @apply w-full;
}

.item-card {
    @apply transition-all duration-200;
}

/* Custom scrollbar */
.max-h-96::-webkit-scrollbar {
    width: 6px;
}

.max-h-96::-webkit-scrollbar-track {
    @apply bg-gray-100;
}

.max-h-96::-webkit-scrollbar-thumb {
    @apply bg-gray-300 rounded-full;
}

.max-h-96::-webkit-scrollbar-thumb:hover {
    @apply bg-gray-400;
}
</style>