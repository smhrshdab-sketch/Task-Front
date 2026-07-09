<script setup lang="ts">
//=====================
</script>
<template>
    <div 
        class="max-w-96 max-h-48 bg-[#e3e3e3] p-2 flex justify-center items-center border-2 border-dashed border-gray-500 rounded-2xl shadow-2xl hover:border-green-500 hover:bg-[#b7b7b7] transition:200"
    >
        <div class="flex flex-col gap-1.5">
            <div class="max-h-24 flex justify-center">
                <img class="text-center" src="@/assets/upload.png" alt="">
            </div>
            <span class="text-center">Click to upload or Drag and drop</span>
            <span class="text-center">Max file size: 25MB</span>
        </div>
    </div>
</template>