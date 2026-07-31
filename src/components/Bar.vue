<script setup lang="ts">
    const props = defineProps<{
        items:string[]
    }>()
</script>
<template>
    <ul class="m-2 min-w-64 py-1 px-3 flex justity-around rounded bg-gray-200">
        <li 
            class="p-2 text-xl hover:bg-gray-400 hover:font-semibold"
            v-for="link in props.items" :key="link"
        >            
        {{ link }}
        </li>
    </ul>
</template>