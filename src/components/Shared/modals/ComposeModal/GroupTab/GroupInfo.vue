<script setup lang="ts">
import { ref } from 'vue';

import Button from "@/Components/ui/inputs/Button.vue";
import DropFileUpload from "@/Components/ui/inputs/DropFileUpload.vue";
import LabeledTextInput from "@/Components/ui/inputs/LabeledTextInput.vue";

// Group Information
const groupName = ref('');
const groupAvatar = ref<File | null>(null);

const emit = defineEmits(['active-page-change']);

const handleStepForwardAndEmitData = () => {
    if (!groupName.value.trim()) {
        alert('Group name is required');
        return;
    }

    emit('active-page-change', {
        tabName: 'group-members',
        animationName: 'slide-left',
        data: {
            groupName: groupName.value,
            groupAvatar: groupAvatar.value
        }
    });
};
</script>

<template>
    <div class="px-5">
        <!--inputs-->
        <div class="mb-5 flex">
            <div class="mb-5 w-full">
                <LabeledTextInput
                    v-model="groupName"
                    type="text" placeholder="نام گروه" label="عنوان" />
            </div>

            <div>
                <!-- <DropFileUpload
                    accept="image/*"
                    :value="groupAvatar"
                    @value-changed="(value) => (groupAvatar = value)"
                    label="Avatar" /> -->
            </div>
        </div>

        <!--next button-->
        <div class="flex pb-6">
            <div class="grow"></div>
            <Button
                @click="handleStepForwardAndEmitData"
                class="contained-primary contained-text"
            >
                مرحله بعد
            </Button>
        </div>
    </div>
</template>
