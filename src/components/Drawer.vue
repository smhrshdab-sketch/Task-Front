<script setup lang="ts">
    import { ref, onMounted, reactive, watch } from 'vue'
    import SelectBox from '@/components/SelectBox.vue'
//------------------------
    interface Item {
            id: number
            description: string
        }    
    const props = defineProps<{
        isOpen: Boolean,
        title:String,
        items: Item[]
    }>()
    const isDrawerOpen = ref<boolean>(false)
    //============
    const emit = defineEmits<{
        (e: 'closed'): void,
        (e: 'selected',item:number): void
    }>()
    
    const close = () => {
        emit('closed')
    }
    onMounted(async () => {//
    })
    
    console.log(`(Drawer) items: `,props.items)
    const select = (id:number) => {
        console.log('Selected department ID:', id)
        emit('selected',id)
    }
</script>
<template>
    <!-- Overlay -->
  <Transition
    enter-active-class="transition-opacity duration-300"
    enter-from-class="opacity-0"
    enter-to-class="opacity-100"
    leave-active-class="transition-opacity duration-300"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0"
  >
    <div v-if="isOpen" class="fixed inset-0 bg-gray-900/50 blur-[2px] z-40"></div>
  </Transition>
  <Transition
    enter-active-class="transition-transform duration-500 ease-in-out"
    enter-from-class="translate-x-full"
    enter-to-class="translate-x-0"
    leave-active-class="transition-transform duration-500 ease-in-out"
    leave-from-class="translate-x-0"
    leave-to-class="translate-x-full"
  >
    <div v-if="isOpen"
        class="fixed top-0 right-0 h-screen w-80 bg-white shadow-xl z-50"
    >
        <div class="w-full p-1 flex flex-col gap-2">
            <div class="flex justify-between items-center p-1 border-b-blue-200 border-b-2">
                <button @click="close"  class="w-8 h-8 rounded-full bg-red-200 hover:bg-red-500">
                    <span class="text-white text-2xl font-semibold">✗</span>
                </button>
                <span class="text-gray-800 text-xl font-bold">{{ props.title }}</span>
            </div>
            <SelectBox
                :items="props.items"
                placeholder="Search here ..."
                @select="select"
            >
                <!--  -->
            </SelectBox>
        </div>
    </div>
  </Transition>
</template>