<script setup lang="ts">
    import { ref, computed, watch, nextTick } from 'vue'
    
    interface Item {
        id: number
        description: string
    }
    
    const props = defineProps<{
        items: Item[]
        placeholder?: string
    }>()
    
    const emit = defineEmits<{
        (e: 'select', id: number): void
    }>()
    
    const searchWord = ref<string>('')
    const selectedIndex = ref<number>(-1)      // Index of highlighted item
    const listRef = ref<HTMLElement | null>(null)
    
    // Filter items based on search word (case-insensitive)
    const filteredItems = computed(() => {
        if (!searchWord.value.trim()) {
            return props.items
        }
        const lowerSearch = searchWord.value.toLowerCase()
        return props.items.filter(item =>
            item.description.toLowerCase().includes(lowerSearch)
        )
    })
    
    // Reset selected index when filtered items change
    watch(filteredItems, () => {
        selectedIndex.value = -1
    })
    
    // Scroll the highlighted item into view when index changes
    watch(selectedIndex, (newIndex) => {
        if (newIndex >= 0 && listRef.value) {
            const items = listRef.value.querySelectorAll('li')
            if (items[newIndex]) {
                items[newIndex].scrollIntoView({ block: 'nearest' })
            }
        }
    })
    
    const select = (id: number) => {
        emit('select', id)
        // Optional: clear search and close after selection? 
        // Leave open for now.
    }
    
    // Keyboard navigation
    const handleKeydown = (e: KeyboardEvent) => {
        if (filteredItems.value.length === 0) return
        
        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault()
                selectedIndex.value = (selectedIndex.value + 1) % filteredItems.value.length
                break
            case 'ArrowUp':
                e.preventDefault()
                selectedIndex.value = selectedIndex.value <= 0 
                    ? filteredItems.value.length - 1 
                    : selectedIndex.value - 1
                break
            case 'Enter':
                e.preventDefault()
                if (selectedIndex.value >= 0 && filteredItems.value[selectedIndex.value]) {
                    select(filteredItems.value[selectedIndex.value].id)
                } else if (filteredItems.value.length === 1) {
                    // If no highlight but only one result, select it
                    select(filteredItems.value[0].id)
                }
                break
            case 'Escape':
                searchWord.value = ''
                break
        }
    }
</script>

<template>
    <div class="w-full border-2 rounded-xl p-1 bg-white shadow-sm">
        <!-- Input with magnifier icon inside -->
        <div class="relative">
            <span class="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
            </span>
            <input 
                type="text" 
                :placeholder="placeholder || 'Search ...'" 
                v-model="searchWord"
                @keydown="handleKeydown"
                class="w-full p-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 mb-2"
            />
        </div>
        
        <!-- List container with scroll -->
        <ul 
            ref="listRef"
            class="flex flex-col gap-1 max-h-64 overflow-y-auto"
        >
            <li 
                v-for="(item, idx) in filteredItems"
                :key="item.id"
                :class="[
                    'p-2 rounded-lg cursor-pointer transition-colors',
                    idx === selectedIndex 
                        ? 'bg-orange-300 ring-2 ring-orange-500' 
                        : 'bg-orange-100 hover:bg-orange-200'
                ]"
                @click="select(item.id)"
                @mouseenter="selectedIndex = idx"
            >
                {{ item.description }}
            </li>
            <li 
                v-if="filteredItems.length === 0"
                class="p-2 text-center text-gray-500 italic"
            >
                No matching items found
            </li>
        </ul>
    </div>
</template>