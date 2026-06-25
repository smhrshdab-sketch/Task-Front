<script setup lang="ts">
import {Ref} from "vue";
import {ref, watch, onMounted, onUnmounted} from "vue";
import type {IContact, IConversation} from "@/types";
import useStore from "@/store/store";

import {useAxios} from '@/Composables/useAxios';
const axios = useAxios();

import Button from "@/Components/ui/inputs/Button.vue";
import FadeTransition from "@/Components/ui/transitions/FadeTransition.vue";
import Modal from "@/Components/ui/utils/Modal.vue";
import Tabs from "@/Components/ui/navigation/Tabs/Tabs.vue";
import Tab from "@/Components/ui/navigation/Tabs/Tab.vue";

import Circle2Lines from "@/Components/states/loading-states/Circle2Lines.vue";
import SearchInput from "@/Components/ui/inputs/SearchInput.vue";
import Checkbox from "@/Components/ui/inputs/Checkbox.vue";
import ScrollBox from "@/Components/ui/utils/ScrollBox.vue";
import {getName} from "@/utils";
import ConversationItem from "@/Components/Shared/blocks/ConversationItem.vue";
import {conversations} from "@/store/defaults";
import {XMarkIcon} from "@heroicons/vue/24/outline";
import { useForm } from "@inertiajs/vue3";
import { CheckBadgeIcon, TrashIcon } from "@heroicons/vue/24/solid";
const props = defineProps<{
    open: boolean;
    allConversations: IConversation[];
    selectedMessageId: number;
    closeModal: () => void;
}>();

// the p element containing the modal title
const modalTitle: Ref<HTMLElement | null> = ref(null);

const filteredConversations: Ref<IConversation[]> = ref(props.allConversations);



// the name of the selected tab
const activeTabName = ref("conversations");

const searchText: Ref<string> = ref("");

const store = useStore();

// a list of contacts selected to make a call or create group
const selectedConversations: Ref<IContact[]> = ref([]);

// checks whether a contact is selected or not
const isConversationSelected = (contact: IContact) => {
    return Boolean(selectedConversations.value.find((item) => item.id === contact.id));
};

// (event) change the value of selected contacts
const handleSelectedConversationsChange = (contact: IContact) => {


        selectedConversations.value.push(contact);
        filteredConversations.value.splice( filteredConversations.value.findIndex((item) => item.id == contact.id), 1);

        // console.log(filteredConversations);
};

const handleUnSelectedConversationsChange = (contact: IContact) => {

    console.log(filteredConversations.value);

    let contactIndex = selectedConversations.value.findIndex((item) => item.id === contact.id);
    if (contactIndex !== -1) {
        selectedConversations.value.splice(contactIndex, 1);
        filteredConversations.value.push(contact);
    }
    // console.log(filteredConversations.value);

};
const freeForm = useForm({});
const isSending = ref(false);
const handleFinish = async () => {

    try {
        isSending.value = true;

        // freeForm.transform((data) => ({

        //     messageId: props.selectedMessageId, // Send the selected message
        //     conversations: selectedConversations.value.map(conversation => conversation.id), // Send the selected conversations

        // })).post((route('store.forward.multiple')), {

        // })
        const response = await axios.post(route('store.forward.multiple'), {
            messageId: props.selectedMessageId, // Send the selected message
            conversations: selectedConversations.value.map(conversation => conversation.id), // Send the selected conversations
        }, {
            headers: {
                'X-Socket-ID': window.Echo.socketId(),
            },
        })
        isSending.value = false;
        selectedConversations.value.forEach((conversation, index) => {
            store.updateConversation(conversation.id, response.data.forwardedMessages[index]);
        });
        props.closeModal()

    } catch (error) {
        isSending.value = false;
        // console.error('Error starting conversation:', error)
    }

}


// update the filtered contact groups based on the search text
watch(searchText, () => {
    console.log("Z");
    filteredConversations.value =
        props.allConversations?.filter(
            (conversation) =>
                getName(conversation)
                    ?.toLowerCase()
                    .includes(searchText.value.toLowerCase()),
        ) || [];

});

// update the filtered conversation based on the allConversation change
watch(() => props.allConversations, () => {

    console.log("AA");
    filteredConversations.value = props.allConversations
});


</script>

<template>
    <Modal :open="props.open" :close-modal="props.closeModal">
        <template v-slot:content>
        <div class="w-[70%] min-h-[20rem] bg-white dark:bg-gray-800 rounded pt-5">

            <div class="w-full  ">
                <!--header-->
                <div class="flex justify-between items-center mb-6 px-5">
                    <p
                        id="modal-title"
                        class="heading-1 text-color"
                        ref="modalTitle"
                        tabindex="0"
                    >
                        ارسال برای دیگران
                    </p>

                    <Button
                        @click="props.closeModal"
                        class="outlined-danger ghost-text py-2 px-4"
                    >
                        <XMarkIcon class="w-5 h-5 text-abrash-red"/>
                    </Button>

                </div>

                <div class="grid grid-cols-2 ">
                            <!--content-->
                    <div class="overflow-x-hidden ">
                                <!--search-->
                        <div class="mx-5 mt-3 mb-5">
                            <SearchInput v-model="searchText"/>
                        </div>

                        <!--contacts-->
                        <ScrollBox class="overflow-y-scroll h-[18rem] mb-5" style="visibility: visible !important">
                            <ConversationItem
                                v-if="store.status === 'success' && !store.delayLoading && store.user"
                                v-for="(conversation, index) in filteredConversations"
                                @click="handleSelectedConversationsChange(conversation)"
                                :conversation="conversation"
                                :active="false"
                                :key="index"
                            >
                                <template v-slot:checkbox>
                                    <Checkbox :value="isConversationSelected(conversation)"/>

                                </template>
                            </ConversationItem>

                            <Circle2Lines
                                v-if="store.status === 'loading' || store.delayLoading"
                                v-for="item in 3"
                            />
                        </ScrollBox>


                    </div>

                    <div class="">
                        <div class="mx-5 mt-3 mb-5">
                            <span>
                                مکالمات انتخاب شده
                            </span>
                        </div>

                        <ScrollBox class="overflow-y-scroll  h-[18rem] mb-5" style="visibility: visible !important">
                            <ConversationItem
                                v-if="store.status === 'success' && !store.delayLoading && store.user"
                                v-for="(conversation, index) in selectedConversations"
                                @click="handleUnSelectedConversationsChange(conversation)"
                                :conversation="conversation"
                                :active="false"
                                :key="index"
                            >
                                <template v-slot:checkbox>
                                    <!-- <TrashIcon class="w-5 text-abrash-red" /> -->
                                     <CheckBadgeIcon class="w-6 text-green-500" />
                                    <!-- <Checkbox :value="isConversationSelected(conversation)"/> -->
                                </template>
                            </ConversationItem>

                            <Circle2Lines
                                v-if="store.status === 'loading' || store.delayLoading"
                                v-for="item in 3"
                            />
                        </ScrollBox>
                    </div>

                </div>

                <div class="flex mx-5 my-5">
                    <div class="grow"></div>

                    <!--finish button-->
                    <Button
                        @click="handleFinish"
                        :disabled="isSending"
                        class="contained-primary contained-text"
                    >
                    <span v-if="!isSending">ارسال پیام</span>
                    <span v-else>درحال ارسال ...</span>
                    </Button>
                </div>

            </div>
        </div>
        </template>
    </Modal>
</template>
