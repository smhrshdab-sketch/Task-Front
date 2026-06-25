<script setup lang="ts">


import ContactsTab from "@/Components/Shared/modals/ComposeModal/ContactsTab.vue";
import GroupTab from "@/Components/Shared/modals/ComposeModal/GroupTab/GroupTab.vue";
import Button from "@/Components/ui/inputs/Button.vue";
import FadeTransition from "@/Components/ui/transitions/FadeTransition.vue";
import Modal from "@/Components/ui/utils/Modal.vue";
import Tabs from "@/Components/ui/navigation/Tabs/Tabs.vue";
import Tab from "@/Components/ui/navigation/Tabs/Tab.vue";
import {ref, onMounted, onUnmounted, watch, computed} from "vue";

import {

    XMarkIcon,
} from '@heroicons/vue/24/outline'

const props = defineProps<{
  open: boolean;
  closeModal: () => void;
}>();

// the p element containing the modal title
const modalTitle: Ref<HTMLElement | null> = ref(null);

// the name of the selected tab
const activeTabName = ref("group");

// (event) switch between the contacts and group tabs
const handleSwitchTab = (tabName: string) => {
  activeTabName.value = tabName;
};

// the active tab contacts or group.
const activeTab = computed(() => {
  if (activeTabName.value === "contacts") {
    return ContactsTab;
  } else {
    return GroupTab;
  }
});





</script>

<template>
  <Modal :open="props.open" :close-modal="props.closeModal">
    <template v-slot:content>
      <div class="w-[18.75rem] bg-white dark:bg-gray-800 rounded pt-6">
        <!--header-->
        <div class="flex justify-between items-center mb-6 px-5">
          <p
            id="modal-title"
            class="heading-1 text-color"
            ref="modalTitle"
            tabindex="0"
          >
            ایجاد گروه
          </p>

          <Button
            @click="props.closeModal"
            class="outlined-danger ghost-text py-2 px-4"
          >
            <XMarkIcon class="w-5 h-5 text-abrash-red" />
          </Button>
        </div>

        <!--tabs-->
        <div class="px-5 pb-5">
          <Tabs>
            <!-- <Tab
              @click="handleSwitchTab('contacts')"
              name="Contact"
              :active="activeTabName === 'contacts'"
            /> -->
            <!-- <Tab
              @click="handleSwitchTab('group')"
              name="Group"
              :active="activeTabName === 'group'"
            /> -->
          </Tabs>
        </div>

        <!--ActiveTab-->
        <FadeTransition>
          <component
              :is="activeTab"
              :close-modal="props.closeModal"
          />
        </FadeTransition>
      </div>
    </template>
  </Modal>
</template>
