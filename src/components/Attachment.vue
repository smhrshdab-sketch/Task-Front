<script setup lang="ts">
    import { computed } from 'vue'
    import ProgressBar from './ProgressBar.vue';

    const props = defineProps<{
        size: number
        type:string
        title:string
        status:string
        progress:number
    }>()
    
    //=============
    const cancelUploading = () => {
        console.log(`Uploading is canceled`)
    }
    //--------------
    const deleteAttachment = () => {
        console.log(`attachment is Deleted`)
    }
    console.info(`Atachment props: `,props)
</script>
<template>
    <div class="max-h-36 border-2 rounded-2xl p-2 grid grid-cols-12 shadow-2xl">
        <div class="h-full flex justify-center items-center col-span-1">
            <img src="@/assets/logo.png" alt="bin" class="h-20 w-20 rounded-full shadow-2xl">
        </div>
        <div class="flex justify-around items-center col-span-11">
            <div v-if="props.status == 'uploading'" class=" w-full flex flex-col px-2">
                <div class="flex justify-between">
                    <span class="text-xl font-semibold" v-text="props.status"></span>
                    <button @click="cancelUploading" class="w-8 h-8 rounded-full bg-red-300 hover:bg-red-600 transition:200">
                        <span class="text-white text-2xl font-semibold">✗</span>
                    </button>
                </div>                
                <div class="flex justify-between pr-10">
                    <div class="">
                        <span class="text-gray-600 text-2xl">{{ props.title }}.{{ props.type }}</span>
                    </div>
                    <div class="">
                        <span class="text-gray-600 text-xl" v-text="props.size"></span>
                    </div>
                    <div class="">
                        <span class="text-gray-600 text-xl">{{ props.progress }}%</span>
                    </div>                    
                </div>
                <ProgressBar :progress="props.progress"></ProgressBar>
            </div>
            <div v-else class="w-full flex justify-around">   
                <div class="">
                    <span class="text-black text-2xl">{{ props.title }}.{{ props.type }}</span>
                </div>
                <div class="">
                    <span class="text-black text-xl" v-text="props.size"></span>
                </div>
                <button @click="deleteAttachment" class="">
                    <img src="@/assets/bin.png" alt="bin" class="w-8 h-8">
                </button>             
            </div>
        </div>
    </div>
</template>