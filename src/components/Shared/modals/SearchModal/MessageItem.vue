<script setup lang="ts">
import type { IMessage } from "@/types";

import { getFullName } from "@/utils";
import { usePage } from "@inertiajs/vue3";
const props = defineProps<{
  message: IMessage;
}>();
</script>

<template>
  <button
      v-if="props.message"
    class="w-full p-5 flex outline-none hover:bg-indigo-100 focus:bg-indigo-100 active:bg-indigo-200 dark:hover:bg-gray-600 dark:focus:bg-gray-600 duration-200"
  >
    <!--profile image-->
    <div class="mr-4">

        <div
            v-if="usePage().props.user.gender == 1"
            :style="{ backgroundImage: `url(${`/assets/images/profile_man.png`})` }"
            class="w-[2.25rem] h-[2.25rem] bg-cover bg-center rounded-full"
        ></div>
        <div
            v-else-if="usePage().props.user.gender == 0"
            :style="{ backgroundImage: `url(${`/assets/images/profile_woman.png`})` }"
            class="w-[2.25rem] h-[2.25rem] bg-cover bg-center rounded-full"
        ></div>
      <!-- <div
        :style="{ backgroundImage: `url(${props.message.sender.avatar ?? `/assets/images/user.svg`})` }"
        class="w-7 h-7 rounded-full bg-cover bg-center"
      ></div> -->
    </div>

    <!--name and message-->
    <div class="grow">
      <div class="flex flex-col items-start">
        <p class="heading-2 text-color mb-4">
          {{ getFullName(props.message.sender) }}
        </p>

        <p class="body-2 text-color"> {{ props.message.content }} </p>
      </div>
    </div>

    <!--message date-->
    <div>
      <p class="opacity-100 font-light text-xs leading-4 tracking-[.01rem]">
        <span class="body-4 text-color"> {{ props.message.date }} </span>
      </p>
    </div>
  </button>
</template>
