<!-- FileCard.vue -->
<script setup lang="ts">
interface Attachment {
    id: number
    name: string
    size: number
    type: string
    content: File | null  
    isPersisted: boolean 
    url: string | null
    progress: number  
    status: 'uploading' | 'completed' | 'error'
}

// تعریف Props
const props = defineProps<{
    attach: Attachment
    readonly: { 
        type: Boolean,
        default: false
    }
}>()

// تعریف Emits برای ارسال پیام به پدر
const emit = defineEmits<{
    (e: 'remove', id: number): void
}>()

const getFileIcon = (type: string) => {
  if (type.startsWith('image/')) return '🖼️';
  if (type === 'application/pdf') return '📄';
  if (type.startsWith('video/')) return '🎬';
  if (type.startsWith('audio/')) return '🎵';
  if (type === 'text/plain') return '📝';
  return '📎';
}

const formatSize = (bytes: number) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}
</script>

<template>
  <div class="flex items-center p-3 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all group">
    <!-- آیکون -->
    <div class="text-2xl mr-3 bg-gray-50 w-12 h-12 flex items-center justify-center rounded-lg">
      {{ getFileIcon(attach.type) }}
    </div>

    <!-- اطلاعات فایل -->
    <div class="flex-1 min-w-0">
      <p class="text-sm font-semibold text-gray-800 truncate">{{ attach.name }}</p>
      <p class="text-xs text-gray-500">{{ formatSize(attach.size) }}</p>
    </div>

    <!-- دکمه حذف -->
    <button 
      @click="emit('remove', attach.id)"
      class="ml-2 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
    >
      <span class="text-xl">&times;</span>
    </button>
     <!-- نوار پیشرفت (Progress Bar) -->
      <!-- <div v-if="!attach.isPersisted && attach.status == 'uploading'" class="mt-3 w-full bg-gray-100 rounded-full h-1.5 overflow-hidden"> -->
     <div v-if="!attach.isPersisted" class="mt-3 w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
      <div 
        class="h-full transition-all duration-300 ease-out"
        :class="[
            attach.status === 'completed' ? 'bg-green-500' : 'bg-blue-500',
            attach.status === 'error' ? 'bg-red-500' : ''
        ]"
        :style="{ width: attach.progress + '%' }"
      ></div>
    </div>
    <a v-if="attach.url" :href="attach.url" target="_blank">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6 hover:size-7 hover:text-green-500 hover:cursor-pointer">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 9.75v6.75m0 0-3-3m3 3 3-3m-8.25 6a4.5 4.5 0 0 1-1.41-8.775 5.25 5.25 0 0 1 10.233-2.33 3 3 0 0 1 3.758 3.848A3.752 3.752 0 0 1 18 19.5H6.75Z" />
      </svg>
    </a>
    <div class="flex justify-between mt-1">
        <span class="text-[10px] text-gray-400 uppercase">{{ attach.status }}</span>
        <span class="text-[10px] font-bold text-gray-600">{{ attach.progress }}%</span>
    </div>
  </div>
</template>
