<script setup lang="ts">
    import {ref,onMounted} from 'vue'
    //====================================
    const status = ref<boolean>(false)
    const positionX = ref(0)
    const props = defineProps({
        state:Boolean
    })
    const emit = defineEmits<{
        (e: 'state', mode: boolean): void
    }>()
    //====================
    const switcher = () => {
        if(status.value){
            positionX.value -= 20            
        }
        else{
            positionX.value += 20
        }
        status.value = !status.value
        emit('state',status.value)
    }
    onMounted(() => {
        status.value = props.state
    })
</script>
<template>
    <div
       :class="['w-16 h-10 rounded-3xl p-1 relative border-black border-2',status ? 'bg-green-500' : 'bg-white']"
       @click="switcher"
    >
        <div 
            class="absolute w-8 h-8 rounded-full bg-gray-600 transition-transform duration-200" 
            :style="{ transform: `translateX(${positionX}px)` }"
        ></div>
    </div>
</template>