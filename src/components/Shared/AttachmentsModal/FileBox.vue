<script setup lang="ts">
import { ref, defineProps, defineEmits, watch, computed } from "vue";
import FileItem from "./FileItem.vue";
import Button from '@/Components/Button.vue';
import Card from "@/Components/Card/Card.vue";
import axios from 'axios'
import AttachmentsModal from '@/Components/Shared/AttachmentsModal/AttachmentsModal.vue';

interface FileInfo {
  id: number;
  file_name: string;
  extension: string;
}

const props = defineProps({
  files: {
    type: Array,
    default: () => []
  },
  documentId: Number
});

const emit = defineEmits(["update:files", "remove"]);
const openAttachmentsModal = ref(false);

// Use computed to reactively sync props.files → internal files
const localFiles = ref<FileInfo[]>([])
watch(() => props.files, (newFiles) => {
  localFiles.value = [...(newFiles as FileInfo[])];
}, { immediate: true, deep: true })

const removeFile = async (id: number) => {
  try {
    await axios.post(route('document.attach.remove', {
      documentId: props.documentId,
      attachmentId: id
    }));

    // Update local state
    localFiles.value = localFiles.value.filter(f => f.id !== id);

    // Sync to parent
    emit("update:files", localFiles.value);
  } catch (err) {
    console.error(err);
  }
}

function handleAttachmentClick() {
  openAttachmentsModal.value = true;
}

function addFile(name: string, ext: string) {
  // This will automatically trigger the update
  files.value = [
    ...files.value,
    {
      id: Date.now(),
      file_name: name,
      extension: ext
    }
  ];
}
</script>

<template>
    <Card>
      <Button @click="handleAttachmentClick">ضمیمه</Button>

      <div class="mt-4 max-h-64 overflow-y-auto pr-1">
        <FileItem
          v-for="f in localFiles"
          :key="f.id"
          :id="f.id"
          :file_name="f.file_name"
          :extension="f.extension"
          @remove="removeFile"
        />

        <AttachmentsModal
          :open="openAttachmentsModal"
          :document-id="props.documentId"
          :close-modal="() => (openAttachmentsModal = false)"
          @fileInfo="addFile"
        />      
      </div>
    </Card>
</template>