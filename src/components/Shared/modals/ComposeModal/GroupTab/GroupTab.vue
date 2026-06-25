<script setup lang="ts">
import { computed, ref } from "vue";

import { useAxios } from '@/Composables/useAxios';
const axios = useAxios();

import GroupInfo from "@/Components/Shared/modals/ComposeModal/GroupTab/GroupInfo.vue";
import GroupMembers from "@/Components/Shared/modals/ComposeModal/GroupTab/GroupMembers.vue";
import SlideTransition from "@/Components/ui/transitions/SlideTransition.vue";
import Checkbox from "@/Components/ui/inputs/Checkbox.vue";

import {router} from "@inertiajs/vue3";


const props = defineProps<{
    closeModal: () => void;
}>();


defineEmits(["activePageChange"]);

// used to determine whether to slide left or right
const animation = ref("slide-left");

// name of the active modal page
const activePageName = ref("group-info");

// the active page component
const ActivePage = computed((): any => {
  if (activePageName.value === "group-info") return GroupInfo;
  else if (activePageName.value === "group-members") return GroupMembers;
});

// Collect group information
const groupName = ref('');
const groupAvatar = ref<File | null>(null);
const selectedContacts = ref([]);


// (event) to move between modal pages
const handleChangeActiveTab = (event: { tabName: string; animationName: string; data?: any }) => {
    animation.value = event.animationName;

    if (event.tabName === "group-members" && event.data) {
        // Data from GroupInfo (name & avatar)
        groupName.value = event.data.groupName;
        groupAvatar.value = event.data.groupAvatar;
    } else if (event.tabName === "finish" && event.data) {
        // Data from GroupMembers (selected contacts)
        selectedContacts.value = event.data.selectedContacts;

        // Trigger the createGroup method here once all data is collected
        createGroup();
    }

    activePageName.value = event.tabName;
};


// Function to create the group
const createGroup = async () => {
    const formData = new FormData();
    formData.append('name', groupName.value);
    formData.append('type', 'group');
    formData.append('users',  JSON.stringify(selectedContacts.value));

    if (groupAvatar.value) {
        formData.append('avatar', groupAvatar.value);
    }


    console.log(selectedContacts.value, formData);

    try {
        const response = await axios.post(route('conversations.store'), formData, {
            headers: {
                'X-Socket-ID': window.Echo.socketId(),
                'Content-Type': 'multipart/form-data',
            },
        });
        console.log(response.data);
        props.closeModal();
        activePageName.value = "group-info";

        // router.visit(route(`conversations.group.show`, {conversation: response.data.id}))
    } catch (error) {
        // console.error('Error creating group:', error);
    }
};

</script>

<template>
  <div>
    <!--content-->
    <div class="overflow-x-hidden">
        <SlideTransition :animation="animation">
            <component
            @active-page-change="handleChangeActiveTab"
            :is="ActivePage"
            :key="activePageName"
            />
        </SlideTransition>

    </div>
    <div class="flex justify-between items-center mt-4 p-4">
        <div class="text-sm font-bold">
            ادمین به عنوان مدیر گروه به تمام گروه ها اضافه میشود
        </div>
    </div>
  </div>
</template>
