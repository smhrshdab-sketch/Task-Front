<script setup lang="ts">
  import axios from 'axios'
  import { ref, defineProps, watch } from "vue";
  import FileItemNoDel from "./FileItemNoDel.vue";

  const props = defineProps({
    files: {
      type: Array,
      default: () => []
    },
    documentId: Number
  });

  const files = ref([]);
  //===================
  const download = (id: string, name: string) => {
      const url = route('attachments.download', { attachment: id });
      console.log('Downloading from URL:', url); // optional debug
      window.location.href = url;
  }


  watch(
    () => props.files,
    (val) => (files.value = val ?? []),
    { immediate: true }
  );
</script>

<template>
  <div class="w-full max-w-md ">

    <div class="mt-4 max-h-64 overflow-y-auto pr-1">

      <FileItemNoDel
        v-for="f in files"
        :key="f.id"
        :id="f.id"
        :file_name="f.file_name"
        :extension="f.extension"
        @file-id="download"
      />
    </div>

  </div>
</template>
