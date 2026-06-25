<script setup lang="ts">

import {ref, watch} from 'vue';
import {debounce} from 'lodash';

import {useAxios} from '@/Composables/useAxios';
const axios = useAxios();

import type {IConversation} from "@/types";

import NoMessage from "@/Components/states/empty-states/NoMessage.vue";
import Button from "@/Components/ui/inputs/Button.vue";
import SearchInput from "@/Components/ui/inputs/SearchInput.vue";
import Modal from "@/Components/ui/utils/Modal.vue";
import MessageItem from "@/Components/Shared/modals/SearchModal/MessageItem.vue";
import ScrollBox from "@/Components/ui/utils/ScrollBox.vue";
import DropFileUpload from "@/Components/ui/inputs/DropFileUpload.vue";
import { XMarkIcon } from '@heroicons/vue/24/solid';
import { useForm } from '@inertiajs/vue3';

// Search query ref
const searchQuery = ref('');
const searchResults = ref([]);
const loadingSearch = ref(false);

const props = defineProps<{
    open: boolean;
    closeModal: () => void;
    handleGotoSearchedMessage: (messageId: number) => void;
    conversation: IConversation;
}>();

const form = useForm({});
// Function to search messages
const searchMessages = async (query: string) => {

    if (!query) return; // Prevent empty query
    loadingSearch.value = true;

    // form.transform((data) => ({
    //     'params' : query
    // })).get(route('conversations.search.messages', {conversation: props.conversation.id}), {
    //         preserveState: false,
    //         onFinish:() =>
    //         {
    //             form.reset();
    //         }
    //     });
    try {
        const response = await axios.get(route('conversations.search.messages', {conversation: props.conversation.id}), {
            params: {query},
        });
        console.log('Search results:', response.data);
        searchResults.value = response.data.messages;
    } catch (error) {
        // console.error('Error searching messages:', error);
    } finally {
        loadingSearch.value = false;
    }
};

// Debounced search
const debouncedSearch = debounce(searchMessages, 300);

// Watch search query and call debounced search
watch(searchQuery, (newQuery) => {
    debouncedSearch(newQuery);
});

</script>

<template>
    <Modal :open="props.open" :close-modal="props.closeModal">
        <template v-slot:content>
            <div class="w-[27.75rem] py-6 bg-white dark:bg-gray-800 rounded">
                <!--header-->
                <div class="mb-6 px-5 flex justify-between items-center">
                    <p id="modal-title" class="heading-1 text-color" tabindex="0">
                        مکالمات
                    </p>

                    <Button
                        @click="props.closeModal"
                        class="outlined-danger ghost-text py-2 px-4"
                        typography="body-4"
                    >
                        <XMarkIcon class="w-4 cursor-pointer hover:text-abrash-red" />
                    </Button>
                </div>

                <!--search-->
                <div class="mx-5 mb-5">
                    <SearchInput
                        :value="searchQuery"
                        @value-changed="(value) => (searchQuery = value)"
                    />
                </div>

                <!--message-->
                <ScrollBox class="max-h-[20.375rem] overflow-y-scroll">
                    <MessageItem
                        v-if="searchResults.length > 0"
                        v-for="(message, index) in searchResults"
                        :message="message"
                        :key="index"
                        @click="props.handleGotoSearchedMessage(message.id)"
                    />

                    <NoMessage vertical v-else/>
                </ScrollBox>
            </div>
        </template>
    </Modal>
</template>
