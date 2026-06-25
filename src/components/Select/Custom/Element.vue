<script setup lang="ts">
    import { ref, onMounted, reactive, watch } from 'vue'
    const props = defineProps({
        data:String
    })
    //----------
    const emit = defineEmits<{
        (e: 'remove'): void,
    }>()
    const remove = () => {
        emit('remove')
    }
</script>
<template>
    <div class="flex p-1 justify-between items-center rounded-b-sm shadow-sm bg-green-200 hover:bg-green-500 transition-all duration-200">
        <span class="text-white font-semibold" v-text="props.data"></span>
        <button @click="remove"  class="w-8 h-8 rounded-full bg-red-200 hover:bg-red-500">
            <span class="text-white text-2xl font-semibold">✗</span>
        </button>
    </div>
</template>