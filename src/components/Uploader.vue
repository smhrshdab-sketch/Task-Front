<script setup lang="ts">
    import { ref } from 'vue'

    interface Attachment {
        name: string
        size: number
        type: string
        content: File
    }

    const fileInput = ref<HTMLInputElement | null>(null) 
    const fileData = ref<Attachment | null>(null)
    const attachmentList = ref<Attachment[]>([])
    const attachedFiles = ref<File[]>([]) 

    const triggerUpload = () => {
        console.log(fileInput.value)
        fileInput.value?.click()
    }

    const handleFileChange = (event: Event) => {
        const input = event.target as HTMLInputElement
        //const file = input.files?.[0]
        if (!input.files) return
        //const filesArray = Array.from(input.files)
        attachedFiles.value.push(...Array.from(input.files))
        attachedFiles.value.forEach(file => {
            console.log('Processing file:', file.name)        
            if (file) {
                    if (file.size > 25 * 1024 * 1024) {
                    alert("File size have to less than 25MB")
                    return
                }

                fileData.value = {
                    name: file.name,
                    size: file.size,
                    type: file.type,
                    content: file
                }
                attachmentList.value.push(fileData.value)
                console.info('File selected:', fileData.value)
            }
        })
        console.info('Selected files:', attachmentList.value)
    }
    const handleDroppedFile = () => {
        //
    }
</script>

<template>
  <div 
    @click="triggerUpload"
    @dragover.prevent
    class="cursor-pointer max-w-96 p-6 bg-[#e3e3e3] flex flex-col justify-center items-center border-4 border-dashed border-gray-500 rounded-2xl shadow-2xl hover:border-green-500 hover:bg-[#b7b7b7] transition-all duration-200"
  >
    <img class="w-16 h-16" src="@/assets/upload.png" alt="upload icon">
    <span class="font-bold">Click to upload</span>
    <span class="text-sm text-gray-600">Max file size: 25MB</span>
    
    <input 
      ref="fileInput" 
      type="file" 
      @change="handleFileChange" 
      class="hidden"
      multiple
    >
  </div>
</template>
