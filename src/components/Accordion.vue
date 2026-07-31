<script setup lang="ts">
    import {ref} from 'vue'
    //====================
    const props = defineProps<{
        title:string,
        content:string
    }>()
    const showContent = ref<boolean>(false)
    const switchShowContent = () => {
        showContent.value = !showContent.value
    }
</script>
<template>
    <div class="w-full min-h-16 m-2 p-2 flex justify-center rounded-xl border-gray-500 bg-yellow-100">
        <div class="w-full flex flex-col gap-1 px-2">
            <div class="w-full flex justify-between ">
                <span class="text-xl font-medium hover:font-bold">{{ props.title }}</span>
                <svg v-if="!showContent" @click="switchShowContent" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6 hover:size-7">
                    <path stroke-linecap="round" stroke-linejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                </svg>
                <svg v-if="showContent" @click="switchShowContent" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6 hover:size-7">
                    <path stroke-linecap="round" stroke-linejoin="round" d="m4.5 15.75 7.5-7.5 7.5 7.5" />
                </svg>
            </div>
            <div v-if="showContent" class="w-full bg-blue-100 p-2 rounded">{{ props.content }}</div>
        </div>
    </div>
</template>