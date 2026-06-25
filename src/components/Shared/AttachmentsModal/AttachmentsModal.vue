<script setup lang="ts">
import {ref, computed,defineEmits} from 'vue';
import {useAxios} from '@/Composables/useAxios.ts';
import axios from 'axios'
import Attachment from "@/Components/Shared/AttachmentsModal/Attachment.vue";
import Button from '@/Components/Button.vue'
import Modal from "@/Components/ui/utils/Modal.vue";
import ScrollBox from "@/Components/ui/utils/ScrollBox.vue";
import { onMounted, onUnmounted } from 'vue';
import type {IAttachment} from "@/types.ts";
import { usePage } from '@inertiajs/vue3';
import { CloudArrowUpIcon, PaperClipIcon } from '@heroicons/vue/24/solid';


const props = defineProps<{
    open: boolean;
    documentId: number;
    closeModal: () => void;
    //pushNewMessage: (message: object) => void;
}>();
const emit = defineEmits(['fileInfo'])
//console.log(`Hello from Attachment`);
const attachments = ref<IAttachment[]>([]); // Store attachments with the IAttachment interface
const uploadInProgress = ref('no'); // Optional message caption
const caption = ref(""); // Optional message caption
const original_file_name = ref<string>();
const original_file_extension = ref<string>();

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

            alerModal.value = true;
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
        if (attachments.value[i].isUploaded) continue;

        const file = attachments.value[i].file;
        const fileNameId = makeFileName(); // unique ID for this file
        const ext = file.name.split('.').pop().toLowerCase();

        const chunkSize = getChunkSize(file.size);
        const totalChunks = Math.ceil(file.size / chunkSize);
        original_file_name.value = file.name;
        original_file_extension.value = ext;
        for (let index = 0; index < totalChunks; index++) {
            const start = index * chunkSize;
            const end = Math.min(file.size, start + chunkSize);
            const chunk = file.slice(start, end);

            const formData = new FormData();
            formData.append('chunk', chunk);
            formData.append('file_name', fileNameId);
            formData.append('name', `${fileNameId}.${ext}`);
            formData.append('original_name', file.name);
            formData.append('extension', ext);
            formData.append('chunk_index', index);
            formData.append('total_chunks', totalChunks);
            console.log(`Route : `,route('document.attach.add', props.documentId));
            const response = await axios.post(
                route('document.attach.add'),
                formData,
                { headers: { "Content-Type": "multipart/form-data" } }
            );
            //console.log('Attac response :',response)
            // Update progress
            attachments.value[i].progress = Math.round(((index + 1) / totalChunks) * 100);

            // ONLY on last chunk
            if (response.data.status === 1 && index === totalChunks - 1) {
                attachments.value[i].isUploaded = true;

                // Save the returned cached_key to localStorage
                let cachedFiles = JSON.parse(localStorage.getItem('cached_files') || '[]');
                cachedFiles.push(response.data.cached_key);
                localStorage.setItem('cached_files', JSON.stringify(cachedFiles));

                // Optionally store key on the attachment object for UI display
                attachments.value[i].cachedKey = response.data.cached_key;
            }
            //if()
        }
        console.log(`Attachment name : ${original_file_name.value}.`,ext)
        emit("fileInfo",original_file_name.value,original_file_extension.value);
    }

    uploadInProgress.value = 'no';    
    props.closeModal();
};





const allFilesUploaded = computed(() => {
    return attachments.value.every(attachment => attachment.isUploaded);
});

const alerModal = ref(false);




const events = ['dragenter', 'dragover', 'dragleave', 'drop'];


onMounted(() => {
    events.forEach(event => {
        document.body.addEventListener(event, (e)=>e.preventDefault());
    });
});
onUnmounted(() => {
    events.forEach(event => {
        document.body.removeEventListener(event, (e)=>e.preventDefault());
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

                alerModal.value = true;
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
    <Modal :open="props.open" :close-modal="props.closeModal">
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
    </Modal>

        <Modal :open="alerModal">
        <template v-slot:content>
            <div class="w-[25rem] bg-white dark:bg-gray-800 rounded py-6 flex flex-col justify-center items-center">

                <span class="text-abrash-red font-bold">
                    فرمت فایل انتخاب شده مجاز نمی باشد
                </span>

                <Button
                    class="ghost-text  mt-5 bg-gray-500  w-[150px] text-white"
                    @click="alerModal = false"
                >
                    متوجه شدم
                </Button>
            </div>
        </template>
    </Modal>
</template>
