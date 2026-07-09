<script setup lang="ts">
    import { ref } from 'vue'

    interface Attachment {
        name: string
        size: number
        type: string
        content: File
    }

    const fileInput = ref<HTMLInputElement | null>(null) // رفرنس به اینپوت
    const fileData = ref<Attachment | null>(null)

    const triggerUpload = () => {
        console.log(fileInput.value)
        fileInput.value?.click()
    }

    const handleFileChange = (event: Event) => {
        const input = event.target as HTMLInputElement
        const file = input.files?.[0]
        
        if (file) {
                if (file.size > 25 * 1024 * 1024) {
                alert("حجم فایل نباید بیشتر از 25 مگابایت باشد")
                return
            }

            // مقداردهی شیء
            fileData.value = {
                name: file.name,
                size: file.size,
                type: file.type,
                content: file
            }
            console.info('File selected:', fileData.value)
         }
         //=======
         const file2 = input.files?.[1]
        
        if (file2) {
                if (file2.size > 25 * 1024 * 1024) {
                alert("حجم فایل نباید بیشتر از 25 مگابایت باشد")
                return
            }

            // مقداردهی شیء
            fileData.value = {
                name: file2.name,
                size: file2.size,
                type: file2.type,
                content: file2
            }
            console.info('File2 selected:', fileData.value)
         }
    }
</script>

<template>
  <div 
    @click="triggerUpload"
    class="cursor-pointer max-w-96 p-6 bg-[#e3e3e3] flex flex-col justify-center items-center border-2 border-dashed border-gray-500 rounded-2xl shadow-2xl hover:border-green-500 hover:bg-[#b7b7b7] transition-all duration-200"
  >
    <img class="w-16 h-16" src="@/assets/upload.png" alt="upload icon">
    <span class="font-bold">Click to upload</span>
    <span class="text-sm text-gray-600">Max file size: 25MB</span>
    
    <!-- ref را اینجا اضافه کردیم -->
    <input 
      ref="fileInput" 
      type="file" 
      @change="handleFileChange" 
      class="hidden"
    >
  </div>
</template>
