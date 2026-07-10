<!-- FileCard.vue -->
<script setup lang="ts">
interface Attachment {
    id: number
    name: string
    size: number
    type: string
    content: File
}

// تعریف Props
const props = defineProps<{
    attach: Attachment
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
  </div>
</template>
