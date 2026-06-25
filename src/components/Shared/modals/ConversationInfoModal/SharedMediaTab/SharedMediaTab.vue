<script setup lang="ts">
import type {IContact, IConversation, IMessage} from "@/types";
import {computed, ref, Ref} from "vue";

import {hasAttachments} from "@/utils";

import {ArrowUturnLeftIcon} from "@heroicons/vue/24/outline";
import MediaItem from "@/Components/Shared/modals/ConversationInfoModal/SharedMediaTab/MediaItem.vue";
import SearchInput from "@/Components/ui/inputs/SearchInput.vue";
import NoMedia from "@/Components/states/empty-states/NoMedia.vue";
import ScrollBox from "@/Components/ui/utils/ScrollBox.vue";
import IconButton from "@/Components/ui/inputs/IconButton.vue";

const props = defineProps<{
    closeModal: () => void;
    conversation: IConversation;
    handleGotoSearchedAttachment: (messageId: number) => void;
    contact?: IContact;
}>();

const currentRoute: Ref<string> = ref("");

// extract messages that contain attachments.
const attachmentMessages = computed(() => {
    let media: IMessage[] = [];
    for (let message of props.conversation.messages) {
        if (hasAttachments(message)) {
            if (props.contact) {
                if (message.sender.id === props.contact.id) {
                    media.push(message);
                }
            } else {
                media.push(message);
            }
        }
    }
    return media;
});


</script>

<template>
    <div>
        <!--header-->
        <div class="mb-6 px-5 flex justify-between items-center">
            <p id="modal-title" class="heading-1 text-color" tabindex="0">
                رسانه ها
            </p>

            <!--return button-->
            <IconButton
                @click="
          $emit('active-page-change', {
            tabName: 'conversation-info',
            animationName: 'slide-right',
          })
        "
                class="ic-btn-outlined-danger p-2"
            >
                <ArrowUturnLeftIcon class="w-5 h-5"/>
            </IconButton>
        </div>

        <!--search-->
        <div class="mb-5 mx-5">
            <SearchInput/>
        </div>

        <!--media messages-->
        <ScrollBox class="overflow-y-scroll max-h-[13.875rem]">
            <div
                v-if="attachmentMessages.length > 0"
                v-for="(message, index) in attachmentMessages"
                :key="index"
            >
                <MediaItem
                    v-for="(attachment, index) in message.attachments"
                    @click="props.handleGotoSearchedAttachment(message.id)"
                    :attachment="attachment"
                    :date="message.date"
                    :key="index"
                />
            </div>

            <NoMedia v-else vertical/>
        </ScrollBox>
    </div>
</template>
