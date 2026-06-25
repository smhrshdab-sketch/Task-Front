<script setup lang="ts">
interface Props {
    title?: string
    description?: string
    color?: string
}

const props = withDefaults(defineProps<Props>(), {
    title: 'Roles',
    description: 'Manage your roless',
    color: 'rgb(58 73 149)'
})
</script>

<template>
    <div 
        class="w-full py-16 px-4 relative overflow-hidden"
        :style="{ backgroundColor: color }"
    >
        <!-- Decorative background pattern -->
        <div class="absolute inset-0 opacity-10">
            <div class="absolute top-0 left-0 w-64 h-64 bg-white rounded-full -translate-x-1/2 -translate-y-1/2"></div>
            <div class="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full translate-x-1/2 translate-y-1/2"></div>
        </div>
        
        <div class="container mx-auto text-center relative z-10">
            <h1 class="text-4xl md:text-5xl font-bold text-white mb-4">
                {{ title }}
            </h1>
            <p class="text-xl text-white opacity-90 max-w-2xl mx-auto">
                {{ description }}
            </p>
        </div>
    </div>
</template>