<script setup lang="ts">
interface Props {
    id: number
    title?: string        
}

const props = defineProps<Props>()

const emit = defineEmits<{
    (e: 'remove', id: number): void
}>()

const remove = () => {
    emit('remove', props.id)
}
</script>

<template>
    <!-- استفاده از style مستقیم برای اطمینان از عدم صفر شدن ابعاد -->
    <div 
        class="flex items-center justify-between gap-2 p-2 rounded-md shadow-sm transition-all duration-200"
        style="min-width: 150px; min-height: 45px; width: fit-content; display: inline-flex; background-color: #22c55e;"
    >
        <!-- بخش متن: استفاده از flex-grow برای پر کردن فضا -->
        <span 
            class="text-white font-medium text-sm truncate px-2"
            style="flex-grow: 1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;"
        >
            {{ title || 'No Title' }}
        </span>

        <!-- دکمه حذف: با ابعاد ثابت برای جلوگیری از تغییر سایز -->
        <button 
            @click="remove"  
            class="flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-full bg-red-400 hover:bg-red-600 transition-colors"
        >
            <span class="text-white text-xs leading-none">✕</span>
        </button>
    </div>
</template>

<style scoped>
/* اطمینان از اینکه کامپوننت به صورت اینلاین رفتار می‌کند */
div {
    display: inline-flex !important;
}
</style>
