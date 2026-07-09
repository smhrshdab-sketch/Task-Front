<script setup lang="ts">
    import { computed } from 'vue'

    const props = defineProps<{
        // Use 'number' (lowercase) for TypeScript types
        progress: number
    }>()

    // Create a style object for the dynamic width
    const barStyle = computed(() => ({
        width: `${props.progress}%`
    }))
</script>

<template>
    <div class="p-1">
        <div class="h-4 w-full rounded-2xl bg-gray-200 border-2 overflow-hidden">
            <!-- Bind the style object here -->
            <div 
                class="h-full p-1 rounded-2xl bg-green-500 transition-all duration-300"
                :style="barStyle"
            ></div>
        </div>        
    </div>
</template>

