<script setup lang="ts">
import {computed, Ref, ref, watch} from "vue";
import type {IContact, IConversation} from "@/types";

import ConversationInfoTab from "@/Components/Shared/modals/ConversationInfoModal/ConversationInfoTab/ConversationInfoTab.vue";
import EditGroupInfoTab from "@/Components/Shared/modals/ConversationInfoModal/EditGroupInfoTab.vue";
import ConversationMembersTab from "@/Components/Shared/modals/ConversationInfoModal/ConversationMembersTab.vue";
import SharedMediaTab from "@/Components/Shared/modals/ConversationInfoModal/SharedMediaTab/SharedMediaTab.vue";
import Modal from "@/Components/ui/utils/Modal.vue";
import SlideTransition from "@/Components/ui/transitions/SlideTransition.vue";

defineEmits(["activePageChange"]);

const props = defineProps<{
    open: boolean;
    openShared: boolean;
    conversation: IConversation;
    closeModal: () => void;
    changeStatus: (conversation: IConversation, changeStatusTo: string) => void;
    handleGotoSearchedAttachment: (messageId: number) => void;
}>();

// selected group member
const selectedMember: Ref<IContact | undefined> = ref();

// used to determine whether to slide left or right
const animation = ref("slide-left");

// name of the active modal page
const activePageName = ref("conversation-info");

// the active modal page component
const ActiveTab = computed((): any => {
    if (activePageName.value === "conversation-info") return ConversationInfoTab;
    else if (activePageName.value === "members") return ConversationMembersTab;
    else if (activePageName.value === "group-member") return ConversationInfoTab;
    else if (activePageName.value === "shared-media") return SharedMediaTab;
    else if (activePageName.value === "edit-group") return EditGroupInfoTab;
});

// (event) move between modal pages
const handleChangeActiveTab = (event: {
    tabName: string;
    animationName: string;
    contact?: IContact;
    removeContact?: boolean;
}) => {
    animation.value = event.animationName;
    activePageName.value = event.tabName;
    // console.log(activePageName.value);
    if (event.contact) {
        selectedMember.value = event.contact;
    }

    if (event.removeContact) {
        selectedMember.value = undefined;
    }
};

watch(
    () => props.openShared,
    (newVal) => {
        if (newVal) {
            activePageName.value = 'shared-media'
        } else {
            activePageName.value = 'conversation-info'
        }
    }
)
</script>

<template>
    <Modal :open="props.open" :close-modal="props.closeModal">
        <template v-slot:content>
            <div class="overflow-x-hidden">
                <div class="w-[18.75rem] bg-white dark:bg-gray-800 rounded py-6">
                    <!--content-->
                    <SlideTransition :animation="animation">
                        <component
                            @active-page-change="handleChangeActiveTab"
                            :is="ActiveTab"
                            :conversation="props.conversation"
                            :close-modal="props.closeModal"
                            :change-status="props.changeStatus"
                            :handle-goto-searched-attachment="props.handleGotoSearchedAttachment"
                            :key="activePageName"
                            :contact="selectedMember"
                        />
                    </SlideTransition>
                </div>
            </div>
        </template>
    </Modal>
</template>
