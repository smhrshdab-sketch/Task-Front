<script setup lang="ts">
import {ref, computed} from 'vue';

import {useAxios} from '@/Composables/useAxios';
import Attachment from "@/Components/Shared/modals/AttachmentsModal/Attachment.vue";
import Button from "@/Components/ui/inputs/Button.vue";
import LabeledTextInput from "@/Components/ui/inputs/LabeledTextInput.vue";
import TModal from "@/Components/Modal/TModal.vue";
import ScrollBox from "@/Components/ui/utils/ScrollBox.vue";
import { onMounted, onUnmounted } from 'vue';
import type {IAttachment} from "@/types";
import { usePage } from '@inertiajs/vue3';
import { CloudArrowUpIcon, PaperClipIcon } from '@heroicons/vue/24/solid';

const axios = useAxios();

const props = defineProps<{
    open: boolean;
    conversationId: number;
    closeModal: () => void;
    pushNewMessage: (message: object) => void;
}>();

const attachments = ref<IAttachment[]>([]); // Store attachments with the IAttachment interface
const uploadInProgress = ref('no'); // Optional message caption
const caption = ref(""); // Optional message caption

// Reference to the hidden file input
const fileInput = ref<HTMLInputElement | null>(null);


// Handle file input and add new files
const blockedExtensions = ['.exe', '.py', '.pl', '.rb', '.cgi', '.apk', '.ipa', '.so', '.sh','.bash', '.run', '.jar', '.xml', '.json',
    '.bat','.bin','.cmd','.com','.cpl','.db','.dll','.ex_','.gadget','.inf','.inf1','.ins','.inx','.isu','.job','.js','.jse','.lnk','.msc','.msh','.msi','.msp','.mst',
    '.ocx','.paf','.pif','.ps1','.reg','.rgs','.scr','.sct','.shb','.shs','.u3p','.vb','.vbe','.vbs','.vbscript','.ws','.wsf','.wsh'
];
const handleFileInput = (event) => {


    let invalidFiles = [];
    const validFiles = [...event.target.files].filter(file => {
        const ext = file.name.slice(file.name.lastIndexOf('.')).toLowerCase();  //get lowercase of format file

        if (blockedExtensions.includes(ext)) {  //if the format be in the forbiden formats, then
            invalidFiles.push(file.name);   // push this file in invalid file array. and return true!
            return false;
        }

        return true;
    });

      if (validFiles.length < [...event.target.files].length) { //This tell us if uploader, upload invalid upload, system stop process and warn him/her! not just remove invalid ones!

            alertModal.value = true;
            return;
        }


    const newFiles = validFiles.map((file) => ({


        id: Date.now() + Math.random(), // Generate a unique ID for each file
        type: file.type.startsWith('image') ? 'image' : (file.type.startsWith('video') ? 'video' : 'file'),
        name: file.name,
        size: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
        url: '', // file's URL will be update once it's uploaded
        file: file, // Store the File object for upload
        progress: 0,
        isUploaded: false,
    }));





    attachments.value = [...attachments.value, ...newFiles];
};

// Remove a file from the attachments list
const removeAttachment = (index: number) => {
    attachments.value.splice(index, 1);
};

// Method to trigger ugly hidden file input click
const triggerFileInput = () => {
    fileInput.value?.click();

};

// Method to handle sending files to backend
const sendAttachmentsAlongWithMessage = async () => {
    const formData = new FormData();

    // console.log("START");
    formData.append('content', caption.value); // Add caption to form data
    formData.append('type', 'attachments'); // Example: the type can vary

    attachments.value.forEach((attachment, index) => {
        // formData.append(`attachments[${index}][file]`, attachment.file); // Use attachment.file here
        formData.append(`attachments[${index}][type]`, attachment.type);
        formData.append(`attachments[${index}][name]`, attachment.name);
        formData.append(`attachments[${index}][size]`, attachment.size);
        formData.append(`attachments[${index}][url]`, attachment.url);
    });

    try {

        const response = await axios.post(`/conversations/${props.conversationId}/messages`, formData, {
            headers: {
                'X-Socket-ID': window.Echo.socketId(),
                'Content-Type': 'multipart/form-data' },
        });
        props.pushNewMessage(response.data);
        props.closeModal();
        attachments.value = []
        caption.value = ""
        // console.log(response.data);
    } catch (error) {
        // console.log(error);

        // alert(`please consider these: ${error}`)
    }
    // console.log("END");

};
function makeFileName() {
    var result           = '';
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < 30; i++ ) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    result += "_";
    result += usePage()?.props?.auth?.user?.id;
    return result;
}

const getChunkSize = (fileSize) => {
  if (fileSize < 100 * 1024 * 1024) return 2 * 1024 * 1024;       // 2MB
  if (fileSize < 500 * 1024 * 1024) return 5 * 1024 * 1024;       // 5MB
  if (fileSize < 2 * 1024 * 1024 * 1024) return 10 * 1024 * 1024; // 10MB
  return 20 * 1024 * 1024;                                        // 20MB+
};


const uploadAttachments = async () => {
    uploadInProgress.value = 'processing';

    for (let i = 0; i < attachments.value.length; i++) {
        if (attachments.value[i].isUploaded) continue; // Skip already uploaded files

        if (uploadInProgress.value == 'no') break;
        // const formData = new FormData();
        // formData.append('file', attachments.value[i].file);
        // formData.append('type', attachments.value[i].type);
        // formData.append('name', attachments.value[i].name);
        // formData.append('size', attachments.value[i].size);


        var fileNameId = makeFileName();

        var chunk_size = getChunkSize(attachments.value[i].file?.size);
        try {


            var totalChunks = Math.ceil(attachments.value[i].file.size / chunk_size);

            for (let index = 0; index < totalChunks; index++) {
                const start = index * chunk_size;
                const end = Math.min(attachments.value[i].file.size, start + chunk_size);
                const chunk = attachments.value[i].file.slice(start, end);

                const formData = new FormData();
                // formData.append('file', attachments.value[i].file);
                formData.append('type', attachments.value[i].type);
                formData.append('name', fileNameId + attachments.value[i].name.split('.').pop());
                formData.append('size', attachments.value[i].size);
                formData.append('extension', attachments.value[i].name.split('.').pop());
                formData.append('chunk', chunk);
                formData.append('file_name', fileNameId);
                formData.append('chunk_index', index);
                formData.append('total_chunks', totalChunks);


                const response = await axios.post(`/conversations/${props.conversationId}/upload-files`, formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                    // Progress event for individual file upload
                    onUploadProgress: (progressEvent) => {
                    },
                });

                // console.log(response);
                attachments.value[i].progress = Math.round(((index+1)*100)/totalChunks); // Update progress for each file

                if (response.data.status == 1) {

                    attachments.value[i].url = response.data.url
                    attachments.value[i].isUploaded = true;

                }


            }






            // const response = await axios.post(`/conversations/${props.conversationId}/upload-files`, formData, {
            //     headers: {
            //         'Content-Type': 'multipart/form-data',
            //     },
            //     // Progress event for individual file upload
            //     onUploadProgress: (progressEvent) => {
            //         attachments.value[i].progress = Math.round((progressEvent.loaded * 100) / progressEvent.total); // Update progress for each file
            //     },
            // });



        } catch (error) {
            // console.error('Error uploading file:', error);
            attachments.value[i].progress = 'failed';
            // console.log("E");

        }
    }
    setTimeout(() => {

        sendAttachmentsAlongWithMessage();

    }, 50);

    uploadInProgress.value = 'no';
};

const allFilesUploaded = computed(() => {
    return attachments.value.every(attachment => attachment.isUploaded);
});

const alertModal = ref(false);




const events = ['dragenter', 'dragover', 'dragleave', 'drop'];


onMounted(() => {
    events.forEach(event => {
        document.body.addEventListener(event, (e)=>e.preventDefault());
    });
});
onUnmounted(() => {
    events.forEach(event => {
        document.body.addEventListener(event, (e)=>e.preventDefault());
    });
});


function handleDrop(event : DragEvent) {

    try {

        let invalidFiles = [];
        const validFiles = [...event.dataTransfer.files].filter(file => {
            const ext = file.name.slice(file.name.lastIndexOf('.')).toLowerCase();

            if (blockedExtensions.includes(ext)) {
                invalidFiles.push(file.name);
                return false;
            }

            return true;
        });

          if (validFiles.length < [...event.dataTransfer.files].length) {

                alertModal.value = true;
                return;
            }


        const newFiles = validFiles.map((file) => ({


            id: Date.now() + Math.random(), // Generate a unique ID for each file
            type: file.type.startsWith('image') ? 'image' : (file.type.startsWith('video') ? 'video' : 'file'),
            name: file.name,
            size: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
            url: '', // file's URL will be update once it's uploaded
            file: file, // Store the File object for upload
            progress: 0,
            isUploaded: false,
        }));





        attachments.value = [...attachments.value, ...newFiles];
    } catch (error) {

        console.log("Error handling file drop:", error);
    }




}

const stopUpload = () =>{


    uploadInProgress.value = 'no';
    props.closeModal();
    //  = true;
}
const dragIn = ref(false);
</script>

<template>
    <TModal :open="props.open" :close-modal="props.closeModal">
        <template v-slot:content>
            <div class="w-full h-[70%] bg-white dark:bg-gray-800 rounded p-5">

                <div class="grid grid-cols-1 lg:grid-cols-4 w-full h-full">

                    <div class="w-full h-100">

                        <label v-bind="$attrs" @drop.prevent="handleDrop"
                            :class="{'animate-pulse' : dragIn}"
                            class="flex flex-col h-[100%] items-center justify-center gap-5 transition-all ease-in-out duration-300 border-2 border-dashed bg-gray-300 dark:bg-gray-500 rounded  border-gray-300 dark:borde-gray-0500 px-5 py-12">
                            <input type="file" ref="fileInput" @change="handleFileInput"  class=" top-0 left-0 hidden" />
                            <CloudArrowUpIcon class="w-8 text-gray-500 dark:text-white " />
                            <span class="text-gray-500 dark:text-white">فایل خود را اینجا رها کنید</span>
                            <span class="text-gray-500 dark:text-white">یا</span>
                            <Button
                                @click="triggerFileInput"
                                class="ghost-text bg-gray-400 dark:bg-gray-700"> انتخاب فایل
                            </Button>
                        </label>
                    </div>


                    <div class="grid grid-cols-1 col-span-3">
                        <fieldset class="w-full mx-3  gap-3 border border-dashed border-gray-300 p-3 mt-4">

                            <legend class="text-sm">
                                <span class="flex flex-row  justify-start gap-2">
                                    <PaperClipIcon class="text-abrash-blue w-5" />
                                    <span>فایل های پیوست شده</span>
                                </span>
                            </legend>

                            <ScrollBox class="h-full"  style="visibility: visible !important">

                                <div class="grid grid-cols-3 gap-3">

                                    <Attachment
                                        v-for="(attachment, index) in attachments"
                                        :attachment="attachment"
                                        :key="index"
                                        @remove="removeAttachment(index)"
                                    />

                                </div>
                                <span v-if="!attachments.length" class="text-abrash-red">
                                    هیچ فایلی انتخاب نشده است
                                </span>
                            </ScrollBox>

                        </fieldset>

                        <div class="flex w-full px-5 justify-end items-end">


                                <Button
                                    class="ghost-primary ghost-text mr-4"
                                    @click="stopUpload"
                                >
                                    انصراف
                                </Button>

                                <!-- Upload Files Button: Only show if there are unuploaded files -->
                                <Button
                                    v-if="!allFilesUploaded && (uploadInProgress == 'no')"
                                    @click="uploadAttachments"
                                    class="contained-primary contained-text"> ارسال
                                </Button>
                                <Button
                                    v-if="!allFilesUploaded && (uploadInProgress == 'processing')"
                                    disabled
                                    class="contained-primary contained-text"> درحال ارسال ...
                                </Button>

                        </div>

                    </div>

                </div>




            </div>
        </template>
    </TModal>

        <TModal :open="alertModal">
        <template v-slot:content>
            <div class="w-[25rem] bg-white dark:bg-gray-800 rounded py-6 flex flex-col justify-center items-center">

                <span class="text-abrash-red font-bold">
                    فرمت فایل انتخاب شده مجاز نمی باشد
                </span>

                <Button
                    class="ghost-text  mt-5 bg-gray-500  w-[150px] text-white"
                    @click="alertModal = false"
                >
                    متوجه شدم
                </Button>
            </div>
        </template>
    </TModal>
</template>
