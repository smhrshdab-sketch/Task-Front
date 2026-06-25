<script setup lang="ts">
import useStore from "@/store/store";

import NoContacts from "@/Components/states/empty-states/NoContacts.vue";
import Circle2Lines from "@/Components/states/loading-states/Circle2Lines.vue";
import SearchInput from "@/Components/ui/inputs/SearchInput.vue";
import ContactItem from "@/Components/Shared/blocks/ContactItem.vue";
import ScrollBox from "@/Components/ui/utils/ScrollBox.vue";
import { IContact } from "@/types";
import { router } from "@inertiajs/vue3";

import {useAxios} from '@/Composables/useAxios';
const axios = useAxios();


const store = useStore();

const props = defineProps<{
    closeModal: () => void;
}>();

const goToPage = async (contact) => {
    try {


        // Send a request to create or retrieve the conversation between the current user and the selected contact
        const response = await axios.post(route('conversations.store'), {
            type: 'couple',
            contact_id: contact.id
        });

        // console.log(response);

        // After successfully creating or retrieving the conversation, navigate to the conversation route
        const newConversationId = response.data.id;

        store.activeSidebarComponent = 'couples'
        router.visit(route('conversations.couple.show', {conversation: newConversationId}), {preserveState: false})

    } catch (error) {
        // console.error('Error starting conversation:', error)
    }
}



</script>

<template>
  <div class="pb-6">
    <!--search-->
    <div class="mx-5 mb-5">
      <SearchInput />
    </div>

    <!--contacts-->
    <ScrollBox class="overflow-y-scroll max-h-[12.5rem]">
      <Circle2Lines
        v-if="store.status === 'loading' || store.delayLoading"
        v-for="item in 3"
      />

      <ContactItem
        v-else-if="
          store.status === 'success' &&
          !store.delayLoading &&
          store.user &&
          store.user.contacts.length > 0
        "
        v-for="(contact, index) in store.user.contacts"
        :key="index"
        :contact="contact"

        @contactSelected="goToPage"
      >
      </ContactItem>

      <NoContacts vertical v-else />
    </ScrollBox>
  </div>
</template>
