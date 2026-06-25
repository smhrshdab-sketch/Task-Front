<script setup lang="ts">
import type {IConversation} from "@/types";
import {onMounted, Ref, ref} from "vue";

import {useAxios} from '@/Composables/useAxios';
const axios = useAxios();

import useStore from "@/store/store";

import {EllipsisVerticalIcon} from "@heroicons/vue/24/outline";
import {ArrowUturnLeftIcon, PlusCircleIcon, PlusIcon, XMarkIcon} from "@heroicons/vue/24/solid";
import ContactItem from "@/Components/Shared/blocks/ContactItem.vue";
import IconButton from "@/Components/ui/inputs/IconButton.vue";
import SearchInput from "@/Components/ui/inputs/SearchInput.vue";
import Dropdown from "@/Components/ui/navigation/Dropdown/Dropdown.vue";
import DropdownLink from "@/Components/ui/navigation/Dropdown/DropdownLink.vue";
import ScrollBox from "@/Components/ui/utils/ScrollBox.vue";
import Button from "@/Components/Button.vue";
import TModal from "@/Components/Modal/TModal.vue";
import { useForm } from "@inertiajs/vue3";
const props = defineProps<{
    closeModal: () => void;
    conversation: IConversation;
}>();

const store = useStore();
// html container of the contacts list
const contactContainer: Ref<HTMLElement | undefined> = ref();

// controls the states of contact dropdown menus
const dropdownMenuStates: Ref<boolean[] | undefined> = ref(
    props.conversation.contacts?.map(() => false),
);

// the position of the dropdown menu
const dropdownMenuPosition = ref(["top-6", "right-0"]);



const contacts = ref<IContactGroup[]>([]);
const chunkOffset = ref(1);
const chunkLimit = ref(10);
const loading = ref(false);
const noMoreContacts = ref(false);
// total number of contacts
const totalContacts = ref(10000);

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

// (event) close all dropdowns
const closeDropdowns = () => {
    dropdownMenuStates.value = props.conversation.contacts?.map(() => false);
};

// (event) open/close the dropdown menu
const handleToggleDropdown = (event: Event, contactIndex: number) => {
    if (contactContainer) {
        let buttonBottom = (
            event.currentTarget as HTMLElement
        ).getBoundingClientRect().bottom;
        let containerBottom = (
            contactContainer.value as HTMLElement
        ).getBoundingClientRect().bottom;

        if (buttonBottom >= containerBottom - 50) {
            dropdownMenuPosition.value = ["bottom-6", "-right-12"];
        } else {
            dropdownMenuPosition.value = ["top-6", "-right-12"];
        }
    }

    dropdownMenuStates.value = props.conversation.contacts?.map(
        (value, index) => {
            if (contactIndex === index) {
                return true;
            } else {
                return false;
            }
        },
    );
};

// (event) close doprdown menu when clicking outside
const handleClickOutside = (event: Event) => {
    let target = event.target as HTMLElement;

    if (
        target.parentElement &&
        !target.classList.contains("open-menu") &&
        !(target.parentElement as HTMLElement).classList.contains("open-menu")
    ) {
        closeDropdowns();
    }
};

// Method to remove a member
const removeMember = async (memberId) => {
    closeDropdowns();

    if (confirm("Are you sure you want to remove this member?")) {
        try {
            // Perform Axios DELETE request to remove the member
            const response = await axios.delete(route('conversations.group.removeMember', {
                conversation: props.conversation.id,
                user: memberId
            }));
        } catch (error) {
            // console.error('Error removing member:', error.response.data);
            // Optionally show an error message
        }
    }

};



const showModalAddMember = ref(false);

const addForm = useForm({});
const addMember = (contact) => {

    addForm.transform((data) => ({
            conversation : props.conversation.id,
            contact: contact.id,
        })).post(route('conversations.group.addMember', [props.conversation.id, contact.id]), {
            preserveState: false,
        onFinish: () => {

            showModalAddMember.value = false;
            // Reset the form after submission
            addForm.reset();
        }
    });

}






</script>

<template>
    <div>
        <!--header-->
        <div class="flex justify-between items-center mb-6 px-5">
            <p id="modal-title" class="heading-1 text-color">اعضاء</p>

            <!--return button-->
            <IconButton
                    @click="props.closeModal"
                    class="ic-btn-outlined-danger p-2"
                >
                    <XMarkIcon class="w-5 h-5"/>
                </IconButton>
        </div>

        <!--search-->
        <!-- <div class="mb-5 mx-5">
            <SearchInput/>
        </div> -->

        <!--contacts-->
        <div ref="contactContainer">
            <ScrollBox class="max-h-[14.5rem] overflow-y-scroll">
                <ContactItem
                    variant="card"
                    class=" !cursor-auto border-b"
                    v-for="(contact, index) in props.conversation.contacts"
                    :contact="contact"
                    :key="index"
                >
                    {{ props.conversation }}
                    <template
                        v-slot:tag
                        v-if="(props.conversation.admins as number[]).includes(contact.id)"
                    >
                        <div class="ml-3">
                            <p class="body-4 text-indigo-400">admin</p>
                        </div>
                    </template>

                    <template #menu>
                        <div v-if="$page.props.auth.user?.cans?.chat_management">
                            <!--dropdown menu button-->
                            <IconButton
                                title="menu"
                                @click="(event) => handleToggleDropdown(event, index)"
                                class="open-menu w-6 h-6"
                            >
                                <EllipsisVerticalIcon class="open-menu h-5 w-5" tabindex="0"/>
                            </IconButton>

                            <!--dropdown menu-->
                            <Dropdown

                                :close-dropdown="closeDropdowns"
                                :handle-click-outside="handleClickOutside"
                                :show="(dropdownMenuStates as boolean[])[index]"
                                :position="dropdownMenuPosition"
                            >
                                <button
                                    class="dropdown-link dropdown-link-primary"
                                    aria-label="give admin permissions"
                                    role="menuitem"
                                >
                                    ارتقاء به ادمین
                                </button>
                                <button
                                    class="dropdown-link dropdown-link-primary"
                                    aria-label="remove admin permissions"
                                    role="menuitem"
                                >
                                    عزل به عضو عادی
                                </button>
                                <button
                                    class="dropdown-link dropdown-link-danger"
                                    aria-label="remove contacts"
                                    role="menuitem"
                                    @click="removeMember(contact.id)"
                                >
                                    حذف از گروه
                                </button>

                            </Dropdown>
                        </div>
                    </template>
                </ContactItem>
            </ScrollBox>
        </div>

        <div v-if="$page.props.auth.user?.cans?.chat_management" class="w-full">
            <Button
                @click="showModalAddMember = true"
                class="flex gap-3 items-center justify-center py-3 mx-8"
            >
                <span>افزودن</span>
                <PlusIcon class="w-4" />
            </Button>
        </div>
    </div>

    <TModal
            class="z-150"
            v-model="showModalAddMember"
            :radius="3"
            design="elegant"
            color="black"
            title="افزودن عضو"
            :closeButton="true"
            esc
        >
            <template #content>

                <div ref="contactContainer">
                    <ScrollBox class="max-h-[14.5rem] overflow-y-scroll">
                        <ContactItem
                            variant="card"
                            @contact-selected="
                    (contact) =>
                    $emit('active-page-change', {
                        tabName: 'conversation-info',
                        animationName: 'slide-left',
                        contact: contact,
                    })
                "
                            v-for="(contact, index) in contacts"
                            :contact="contact"
                            :key="index"
                        >
                            <template #menu>
                                <div>
                                    <!--dropdown menu button-->
                                    <IconButton
                                        title="افزودن"
                                        @click="addMember(contact)"
                                        class="open-menu w-6 h-6"
                                    >
                                        <PlusCircleIcon class="open-menu h-6 w-6" tabindex="0"/>
                                    </IconButton>


                                </div>
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
                </div>

            </template>
        </TModal>
</template>
