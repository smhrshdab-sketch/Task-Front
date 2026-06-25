<script setup lang="ts">
import type { IAttachment } from "@/types";

import {
  ArrowPathRoundedSquareIcon,
  DocumentIcon,
  PhotoIcon,
  TrashIcon,
  VideoCameraIcon,
} from "@heroicons/vue/24/outline";
import IconButton from "@/Components/ui/inputs/IconButton.vue";
import CircularProgress from "@/Components/states/loading-states/CircularProgress.vue";
import Spinner from "@/Components/states/loading-states/Spinner.vue";
import { CheckIcon } from "@heroicons/vue/24/solid";

const props = defineProps<{
  attachment: IAttachment;
}>();

const emit = defineEmits(['remove']); // Allow the parent component to listen for the remove event
</script>

<template>
  <div href="#" class="flex px-5 py-4 transition-all duration-300">
    <!--icon-->
    <div
      class="w-8 h-8 mr-4 rounded-full flex justify-center items-center bg-gray-100 dark:bg-gray-600"
    >
      <PhotoIcon
        class="stroke-1 h-5 w-5 text-black opacity-100 dark:text-white dark:opacity-100"
        v-if="attachment.type === 'image'"
      />
      <VideoCameraIcon
        class="stroke-1 h-5 w-5 text-black opacity-100 dark:text-white dark:opacity-100"
        v-else-if="attachment.type === 'video'"
      />
      <DocumentIcon
        class="stroke-1 h-5 w-5 text-black opacity-100 dark:text-white dark:opacity-100"
        v-else-if="attachment.type === 'file'"
      />
    </div>

    <!--name, date and size-->
    <div class="grow">
      <div class="flex items-center justify-between mb-3">
        <p class="heading-2 text-color " tabindex="0">
          {{ attachment.name }}
        </p>
      </div>

      <div class="flex justify-start">
        <p class="body-2 text-color" tabindex="0">
          {{ attachment.size }}
        </p>
      </div>
    </div>

    <!--action buttons-->
    <div class="flex items-center">
      <!-- <IconButton class="ic-btn-ghost-primary w-7 h-7 mr-2" title="replace">
        <ArrowPathRoundedSquareIcon class="w-[.9375rem] h-[.9375rem]" />
      </IconButton> -->
      <div class="flex">
          <IconButton class="ic-btn-ghost-danger w-7 h-7" title="delete" @click="$emit('remove')">
            <TrashIcon v-if="attachment.progress === 0 || attachment.progress === 100" class="w-[.9375rem] h-[.9375rem]" />
            <Spinner
                v-else-if="attachment.progress > 0 && attachment.progress < 100"
                :specialClass="'animate-spin !w-6'"/>

            <CheckIcon v-else-if="attachment.progress === 100" class="w-[.9375rem] h-[.9375rem] text-green-600 dark:text-green-500"></CheckIcon>
          </IconButton>

            <div class="flex items-center justify-center p-2">

                <CheckIcon v-if="attachment.progress === 100"  class="w-[.9375rem] h-[.9375rem] text-green-600 dark:text-green-500"></CheckIcon>
            </div>

        </div>
        <!-- Circular Progress -->
        <CircularProgress v-if="attachment.progress > 0" :progress="attachment.progress"></CircularProgress>
        <!-- End Circular Progress -->
    </div>
  </div>
</template>
