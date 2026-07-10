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
        attachedFiles.value.push(...Array.from(files))
        attachedFiles.value.forEach(file => {
            console.log('Processing file:', file.name)        
            if (file) {
                if (file.size > 25 * 1024 * 1024) {
                    alert("File size have to less than 25MB")
                    console.info(`File size is: ${file.size} and max is: `,25 * 1024 * 1024)
                    return
                }
                if (!allowedTypes.includes(file.type)) {
                    alert("The file format is not compatable, Please choose another one.")
                    console.info(`File type is: ${file.type} and allowed types are: `,allowedTypes)
                    return;
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
</script>

<template>
  <div 
    @click="triggerUpload"
    @dragover="handleDragOver"
    @dragleave="handleDragLeave"
    @drop="handleDrop"
    :class="[
      'cursor-pointer max-w-96 p-6 flex flex-col justify-center items-center border-2 border-dashed rounded-2xl shadow-2xl transition-all duration-200',
      isDragging ? 'border-green-500 bg-[#b7b7b7]' : 'border-gray-500 bg-[#e3e3e3]',
      fileData ? 'hover:border-red-500' : 'hover:border-green-500 hover:bg-[#b7b7b7]' //delete selection
    ]"
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
  <div 
        v-if="attachmentList"
        class="flex flex-col gap-2 bg-blue-100 shadow-2xl P-2 m-2 max-w-72" 
        v-for="(attach,index) in attachmentList" 
        :key="index"
    >
        <div v-if="attach" class="flex flex-row items-center p-2 gap-2 border-2 rounded-2xl">
            <p class="text-center font-medium break-all">{{ attach.name }}</p>
            <p class="text-sm text-gray-500">{{ (attach.size / 1024 / 1024).toFixed(2) }} MB</p>

            <button @click.stop="attach = null" class="mt-3 px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition duration-200">Remove</button>
        </div>
    </div>   
</template>
