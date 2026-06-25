<script setup lang="ts">
import type { IContact, IConversation } from "@/types";

import { router } from "@inertiajs/vue3";
import { computed, ref } from "vue";
import { usePage } from "@inertiajs/vue3";
import { getAvatar, getConversationMembersCount, getName, getOddContact } from "@/utils";

import {
    ArrowLeftOnRectangleIcon,
    AtSymbolIcon,
    BellIcon,
    NoSymbolIcon,
    PencilIcon,
    ShareIcon,
    StopIcon,
    TrashIcon,
    UserIcon,
} from "@heroicons/vue/24/outline";
import { ArrowUturnLeftIcon, XMarkIcon } from "@heroicons/vue/24/solid";
import IconAndText from "@/Components/Shared/blocks/IconAndText.vue";
import ImageViewer from "@/Components/Shared/modals/ConversationInfoModal/ConversationInfoTab/ImageViewer.vue";
import Button from "@/Components/ui/inputs/Button.vue";
import IconButton from "@/Components/ui/inputs/IconButton.vue";

import useStore from "@/store/store";
const store = useStore();

const props = defineProps<{
    conversation: IConversation;
    contact?: IContact;
    closeModal: () => void;
    changeStatus: (conversation: IConversation, changeStatusTo: string) => void;
}>();
const lastSeenStatus = ref(getOddContact(props.conversation)?.lastSeen);

const openImageViewer = ref(false);

const imageUrl = computed(() => {
    if (props.contact) {
        return props.contact.avatar;
    } else {
        return getAvatar(props.conversation);
    }
});

const currentOddContact = computed(() => {
    return getOddContact(props.conversation)
});

const exitGroup = (groupId: number) => {
    if (confirm("Are you sure you want to leave this group?")) {
        router.delete(route('conversations.group.exit', groupId), {
            onSuccess: (page) => {
                store.conversations = page.props.conversations;
            }
        });
    }
};
</script>

<template>
    <div>
        <div class="mb-6 px-5 flex justify-between items-center">
            <!--title-->
            <p class="heading-1 text-color" id="modal-title" tabindex="0">
                <span v-if="conversation.type === 'couple' || props.contact">مخاطب</span>
                <span v-else-if="conversation.type === 'group'">اطلاعات گروه</span>
                <span v-else-if="conversation.type === 'broadcast'">اطلاعات پخش پیام</span>
            </p>

            <!--close button-->
            <Button v-if="!props.contact" @click="props.closeModal" class="outlined-danger ghost-text py-2 px-4">
                <XMarkIcon
                    class="w-5 h-5 text-abrash-red" />
            </Button>

            <!--return button-->
            <IconButton v-else @click="
                $emit('active-page-change', {
                    tabName: 'اعضا',
                    animationName: 'slide-right',
                })
                " class="ic-btn-outlined-danger p-2">
                <ArrowUturnLeftIcon
                    class="w-5 h-5 text-black dark:text-white dark:opacity-100 group-focus:text-red-500 dark:group-focus:text-white group-hover:text-red-500 group-hover:opacity-100 dark:group-hover:text-white" />
            </IconButton>
        </div>

        <!--top-->
        <div class="w-full p-5 pb-6">
            <div class="flex">
                <!--avatar-->
                <div class="ml-5">
                    <button @click="openImageViewer = true" class="outline-none w-[2.375rem] h-[2.375rem]"
                        aria-label="view avatar">
                        <!-- <div
                            v-if="props.contact?.gender == 1"
                            :style="{ backgroundImage: `url(${`/assets/images/profile_man.png`})` }"
                            class="w-[2.25rem] h-[2.25rem] bg-cover bg-center rounded-full"
                        ></div> -->
                        <div
                            :style="{ backgroundImage: `url(${getAvatar(props.conversation)})` }"
                            class="w-[2.25rem] h-[2.25rem] bg-cover bg-center rounded-full"
                        ></div>
                    </button>
                </div>

                <!--name-->
                <div class="w-full flex justify-between">
                    <div>
                        <p class="heading-2 text-color mb-3 ml-5 text-start">
                            <span>
                                {{ getName(props.conversation) }}
                            </span>
                        </p>

                        <p class="body-2 text-color font-extralight text-start">
                            <!--last seen-->
                            <!--or number of group members-->
                            {{
                                conversation.type === "couple" || props.contact
                                    ? lastSeenStatus
                                    : `${getConversationMembersCount(conversation)} عضو`
                            }}
                        </p>
                    </div>

                    <IconButton title="edit group" v-if="['group', 'broadcast'].includes(conversation.type) && $page.props.auth.user?.cans?.chat_management"
                        class="ic-btn-ghost-primary w-7 h-7" @click="
                            $emit('active-page-change', {
                                tabName: 'edit-group',
                                animationName: 'slide-left',
                            })
                            ">
                        <PencilIcon class="w-5 h-5" />
                    </IconButton>
                </div>
            </div>
        </div>

        <!--middle-->
        <div class="w-full py-5 border-t border-gray-100 dark:border-gray-700">
            <!--(contact) email-->
            <!-- <div v-if="conversation.type === 'couple' || props.contact" class="flex px-5 pb-5 items-center">
                <IconAndText :icon="AtSymbolIcon" :title="currentOddContact?.email" />
            </div> -->

            <!--(group) members-->
            <div v-if="
                ['group', 'broadcast'].includes(conversation.type) && !props.contact
            " class="px-5 flex items-center pb-5">
                <IconAndText :icon="UserIcon" title="اعضاء" link chevron @click="
                    $emit('active-page-change', {
                        tabName: 'members',
                        animationName: 'slide-left',
                    })
                    " />
            </div>

            <!--(both) notifications-->
            <div v-if="$page.props.auth.user?.cans?.chat_management" class="px-5 flex items-center">
                <IconAndText :icon="BellIcon" title="اعلانات" switch />
            </div>

            <!--(both) shared media-->
            <div v-if="$page.props.auth.user?.cans?.chat_management" class="px-5 pt-5 flex items-center">
                <IconAndText :icon="ShareIcon" title="فایل های موجود" link chevron @click="
                    $emit('active-page-change', {
                        tabName: 'shared-media',
                        animationName: 'slide-right',
                    })
                    " />
            </div>
        </div>

        <!--bottom-->
        <div class="w-full border-t border-gray-100 dark:border-gray-700">
            <!--(contact) block contact-->
            <div v-if="(conversation.type === 'couple' || props.contact) && $page.props.auth.user?.cans?.chat_management" class="px-5 pt-5 group">

                <IconAndText v-if="currentOddContact?.isBlocked" @click="props.changeStatus(conversation, 'normal')"
                    :icon="StopIcon" title="رفع مسدودیت مخاطب" color="danger" link />
                <IconAndText v-else @click="props.changeStatus(conversation, 'block')" :icon="NoSymbolIcon"
                    title="مسدود کردن مخاطب" color="danger" link />
            </div>

            <!--(contact) delete contact-->
            <!-- <div v-if="conversation.type === 'couple' || props.contact" class="px-5 pt-5 group">
                <IconAndText :icon="TrashIcon" color="danger" title="delete contact" link />
            </div> -->

            <!--(group) exit group-->
            <!-- <div v-if="['group', 'broadcast'].includes(conversation.type) && !props.contact"
                class="px-5 pt-5 flex items-center group">
                <IconAndText :icon="ArrowLeftOnRectangleIcon" link title="exit group"
                    @click="exitGroup(conversation.id)" />
            </div> -->
        </div>

        <!--image viewer-->
        <ImageViewer :image-url="imageUrl" :open="openImageViewer" :close-image="() => (openImageViewer = false)" />
    </div>
</template>
