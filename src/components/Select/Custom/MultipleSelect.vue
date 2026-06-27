<script setup lang="ts">
import { ref, computed } from 'vue'
import Element from './Element.vue'

// تعریف اینترفیس به صورت دقیق‌تر
interface Item {
    id: number
    title: string        
}

// تعریف Props
const props = defineProps<{
    originalItem: Item[]
}>()
const emit = defineEmits<{
  (e: 'update:modelValue', ids: number[]): void
}>();
const selectedIds = ref<number[]>([])

const selectedItems = computed(() => {
    return props.originalItem.filter(item => selectedIds.value.includes(item.id))
})

const availableItems = computed(() => {
    return props.originalItem.filter(item => !selectedIds.value.includes(item.id))
})

const selectItem = (id: number) => {
    if (!selectedIds.value.includes(id)) {
        selectedIds.value.push(id)
        emit('update:modelValue', Array.from(selectedIds.value));
    }
}

const removeItem = (id: number) => {
    selectedIds.value = selectedIds.value.filter(itemId => itemId !== id)
    emit('update:modelValue', Array.from(selectedIds.value));
}
</script>

<template>
    <div class="w-full p-2 space-y-4">
        <!-- بخش آیتم‌های انتخاب شده -->
        <div class="flex flex-row flex-wrap gap-2 border-2 border-gray-400 p-2 min-h-12.5">
            <Element 
                v-for="value in selectedItems"
                :key="value.id"
                :id="value.id"             
                :title="value.title"
                @remove="removeItem"
            ></Element>
            <p v-if="selectedItems.length === 0" class="text-gray-400 text-sm italic">
                Select Items
            </p>
        </div>

        <!-- بخش لیست گزینه‌ها -->
        <div class="w-full rounded-xl shadow-md max-h-36 overflow-y-auto">
            <ul class="flex flex-col gap-1">
                <li
                    v-for="item in availableItems" 
                    :key="item.id"
                    class="text-2xl font-semibold bg-purple-600 text-white hover:bg-purple-800 transition-colors cursor-pointer p-2"
                    @click="selectItem(item.id)"
                >
                    {{ item.title }}
                </li>
            </ul>
            <p v-if="availableItems.length === 0" class="text-center p-4 text-gray-500">
                Nothing 
            </p>
        </div>
    </div>
</template>
