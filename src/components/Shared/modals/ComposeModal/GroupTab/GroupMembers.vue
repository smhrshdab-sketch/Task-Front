<script setup lang="ts">
import type { Ref } from "vue";
import type { IContact } from "@/types";

import useStore from "@/store/store";

import Circle2Lines from "@/Components/states/loading-states/Circle2Lines.vue";
import SearchInput from "@/Components/ui/inputs/SearchInput.vue";
import ContactItem from "@/Components/Shared/blocks/ContactItem.vue";
import Button from "@/Components/ui/inputs/Button.vue";
import Checkbox from "@/Components/ui/inputs/Checkbox.vue";
import ScrollBox from "@/Components/ui/utils/ScrollBox.vue";
import {ref, onMounted, onUnmounted, watch, computed} from "vue";

const store = useStore();

// a list of contacts selected to make a call
const selectedContacts: Ref<IContact[]> = ref([]);

const contacts = ref<IContactGroup[]>([]);
const chunkOffset = ref(1);
const chunkLimit = ref(10);
const loading = ref(false);
const noMoreContacts = ref(false);

const totalContacts = ref(10000);

// checks whether a contact is selected or not
const isContactSelected = (contact: IContact) => {
    return Boolean(selectedContacts.value.find((item) => item.id === contact.id));
};

// (event) change the value of selected contacts
const handleSelectedContactsChange = (contact: IContact) => {
    let contactIndex = selectedContacts.value.findIndex((item) => item.id === contact.id);
    if (contactIndex !== -1) {
        selectedContacts.value.splice(contactIndex, 1);
    } else {
        selectedContacts.value.push(contact);
    }
};

// Emit selected contacts on finish
const emit = defineEmits(['active-page-change']);
const handleFinish = () => {
    if (selectedContacts.value.length === 0) {
        alert('حداقل یک شخص باید انتخاب شود');
        return;
    }

    emit('active-page-change', {
        tabName: 'finish',
        animationName: 'slide-left',
        data: {
            selectedContacts: selectedContacts.value.map(contact => contact.id)
        }
    });
};

const searchText: Ref<string> = ref("");

watch(searchText, (newValue, oldValue) => {

    const response = axios.post(route('fetch.contacts.search'), {
        'searchText' : newValue,
    }).then((response) => {
        contacts.value = response.data.contacts;
        chunkOffset.value = 1;
        setTimeout(() => {
            loading.value = false;
        }, 20);

    }).catch((error) => {
        console.log(error);
    });


});
const loadMoreContacts = () => {


    chunkOffset.value = chunkOffset.value + 10;


    loading.value = true;


    if (chunkOffset.value > totalContacts.value) {
        loading.value = false;
        noMoreContacts.value = true;
        return;

    }

    const response = axios.post(route('fetch.contacts'), {
        'chunkOffset' : chunkOffset.value,
        'chunkLimit'  : chunkLimit.value,
    }).then((response) => {

        totalContacts.value = response.data.total;
        contacts.value = [...contacts.value, ...response.data.contacts];
        // console.log('Contacts new fetched:', contacts.value);
        setTimeout(() => {
            loading.value = false;
        }, 20);

    }).catch((error) => {
        console.log(error);
    });

};

onMounted(() => {

    loading.value = true;

    const response = axios.post(route('fetch.contacts'), {
        'chunkOffset' : chunkOffset.value,
        'chunkLimit'  : chunkLimit.value,

    }).then((response) => {

        contacts.value = [...response.data.contacts];

        setTimeout(() => {
            loading.value = false;
        }, 20);
    }).catch((error) => {
        console.log(error);
    });


});

</script>

<template>
    <div>
        <!--search-->
        <div class="mx-5 mt-3 mb-5">
            <SearchInput v-model="searchText" />
        </div>

        <!--contacts-->
        <ScrollBox class="overflow-y-scroll max-h-[12.5rem] mb-5">
            <ContactItem
                v-if="store.user"
                v-for="(contact, index) in contacts"
                @click="handleSelectedContactsChange(contact)"
                :contact="contact"
                :active="isContactSelected(contact)"
                :key="index"
            >
                <template v-slot:checkbox>
                    <Checkbox :value="isContactSelected(contact)" />
                </template>
            </ContactItem>
            <div v-if="!noMoreContacts" class="block w-full mt-3 p-2 border rounded-md bg-gray-100 dark:bg-gray-700 cursor-pointer" @click="loadMoreContacts()">
                <span
                    v-if="!loading"
                    class="w-full flex items-center justify-center text-lg"
                >
                ...

                </span>

                <Spinner  v-else class="w-3 h-3"/>



            </div>

        </ScrollBox>

        <div class="flex justify-between px-2 pb-6">
            <!-- <div class="grow"></div> -->
            <!--previous button-->
            <Button
                @click="
          $emit('active-page-change', {
            tabName: 'group-info',
            animationName: 'slide-right',
          })
        "
                class="ghost-primary ghost-text mr-4"
            >
                <p class="body-5">مرحله قبل</p>
            </Button>

            <!--finish button-->
            <Button
                @click="handleFinish"
                class="contained-primary contained-text"
            >ایجاد گروه</Button>
        </div>
    </div>
</template>
