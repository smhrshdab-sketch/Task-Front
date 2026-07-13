<script setup lang="ts">
    import { ref } from 'vue'
    import FileCard from './FileCard.vue'

    interface Attachment {
        id:number
        name: string
        size: number
        type: string
        content: File
    }

    const fileInput = ref<HTMLInputElement | null>(null) 
    const fileData = ref<Attachment | null>(null)
    const attachmentList = ref<Attachment[]>([])
    const attachedFiles = ref<File[]>([]) 
    const isDragging = ref<boolean>(false)
    const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf', 'application/zip','text/plain','audio/mpeg','video/mp4'];

    const triggerUpload = () => {
        console.log(fileInput.value)
        fileInput.value?.click()
    }

    const handleFileChange = (event: Event) => {
        const input = event.target as HTMLInputElement
        //const file = input.files?.[0]
        if (!input.files) return
        if (!input.files || input.files.length === 0) return
        processFiles(input.files)
        input.value = ''
    }
    const handleDroppedFile = (event: Event) => {
        const input = event.target as HTMLInputElement
        //event.dataTransfer?.files        
        if (!input.files) return
    }
    const handleDragOver = (event: DragEvent) => {
        event.preventDefault() //prevent browser open or play the fileS
        isDragging.value = true
    }

    const handleDragLeave = () => {
         isDragging.value = false
    }

    const handleDrop = (event: DragEvent) => {
        event.preventDefault() //prevent browser open or play the fileS
        isDragging.value = false
    
        const files = event.dataTransfer?.files
        if (!files || files.length === 0) return
        processFiles(files)
    }
    const processFiles = (files: FileList | null) => {
        if (!files || files.length === 0) return
        Array.from(files).forEach(file => {
            // اعتبارسنجی
            if (file.size > 200 * 1024 * 1024) return alert(`${file.name} is bigger than 200MB`)
            if (!allowedTypes.includes(file.type)) return alert(`${file.type} is not acceptable format!`)

            // اضافه کردن به لیست
            attachmentList.value.push({
                id: Date.now() + Math.random(),
                name: file.name,
                size: file.size,
                type: file.type,
                content: file
            })
        })
    }
    const removeFile = (index: number) => {
        attachmentList.value.splice(index, 1)
    }
    const handleRemoveFile = (id: number) => {
        attachmentList.value = attachmentList.value.filter(item => item.id !== id)
    }
</script>

<template>
  <div class="p-8 flex flex-col items-center">
    <!-- Dropzone Area -->
    <div 
      @click="triggerUpload"
      @dragover.prevent="isDragging = true"
      @dragleave.prevent="isDragging = false"
      @drop.prevent="handleDrop"
      :class="[
        'cursor-pointer w-full max-w-md p-10 flex flex-col items-center border-2 border-dashed rounded-3xl transition-all',
        isDragging ? 'border-blue-500 bg-blue-50 scale-[1.02]' : 'border-gray-300 bg-gray-50'
      ]"
    >
      <span class="text-4xl mb-4">☁️</span>
      <p class="text-gray-600 font-medium">Drop your files here or click to browse</p>
      <input ref="fileInput" type="file" @change="handleFileChange" class="hidden" multiple>
    </div>

    <!-- List Area -->
    <div class="w-full max-w-md mt-6 flex flex-col gap-3">
      <FileCard 
        v-for="item in attachmentList" 
        :key="item.id" 
        :attach="item"
        @remove="handleRemoveFile"
      />
    </div>
  </div>
</template>