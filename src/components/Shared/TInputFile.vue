<template>
    <div>
        <!--Preview-->
        <div
            v-if="files.length > 0 && preview && !multiple"
            :class="['flex justify-center items-center my-2 overflow-hidden',radiusStyle]"
        >
            <img v-if="files[0].type.split('/')[0] === 'image'" :class="['max-h-36 w-auto p-1 border',radiusStyle]"
                 :src="urlGenerator(files[0]) "/>
        </div>
        <!--Input-->

        <div :class="        [
            'flex border items-center overflow-hidden',
            'border-gray-400 rounded-md',
            'focus:border-gray-400 focus:ring focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-white',
            'dark:border-gray-600 dark:bg-dark-eval-1 dark:text-gray-300 dark:focus:ring-offset-dark-eval-1',
            { 'py-2' : files.length === 0 },
            radiusStyle,
        ]">
            <input ref="input" class="hidden" type="file" :accept="accept" :multiple="multiple" @change="updateFile"/>
            <!--Single File Title & Size-->
            <div v-if="!multiple && files.length > 0"
                 class="flex flex-wrap flex-grow overflow-hidden p-2 justify-between items-center">
                <!--File Title-->
                <div class="flex overflow-hidden whitespace-nowrap">
                    {{ files[0].name }}
                </div>
                <!--File Size-->
                <div class="flex overflow-hidden whitespace-nowrap">
                    Size: {{ sizeCalculator(files[0].size) }}
                </div>
            </div>
            <!--Multiple File-->
            <div v-else class="flex px-4 overflow-hidden whitespace-nowrap w-full">
                {{ files.length === 0 ? placeholder : files.length + ' فایل انتخاب شد!' }}
            </div>
            <!--Buttons-->
            <div class="bg-gray-400 rounded flex flex-grow-0 flex-shrink-0 items-center space-x-2">
                <button
                    v-if="files.length"
                    class="block text-primary input-clear-button"
                    type="button"
                    @click="clearFile"
                >
                  <svg class="input-clear-icon w-8 h-8" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
                <button
                    class="bg-primary form-control min-h-10 px-2 border-l outline-none focus:outline-none whitespace-nowrap"
                    type="button"
                    @click="input.click()"
                >
                    {{ browseLabel }}
                </button>
            </div>
        </div>
        <!--Multiple File Area-->
        <transition name="fade">
            <div v-if="files.length > 0 && multiple" :class="['flex flex-col border w-full p-4 mt-2',radiusStyle]">
                <transition-group name="fade" tag="div">
                    <div v-for="(item,index) in files"
                         :class="['flex flex-wrap justify-between items-center border p-2 w-full my-1',radiusStyle]"
                         :key="item.index">
                        <!--Left Area-->
                        <div class="flex justify-start items-center gap-4">
                            <!--File Preview-->
                            <div v-if="preview">
                                <img v-if="item.type.split('/')[0] === 'image'" :class="['h-14 w-14 p-1 border object-cover',radiusStyle]" :src="urlGenerator(item)"/>
                                <t-video-icon v-else-if="item.type.split('/')[0] === 'video'" :class="['w-14 h-14 p-3 border text-gray-600',radiusStyle]"/>
                                <t-audio-icon v-else-if="item.type.split('/')[0] === 'audio'" :class="['w-14 h-14 p-3 border text-gray-600',radiusStyle]"/>
                                <div v-else :class="['relative flex justify-center items-center w-14 h-14 border text-gray-600',radiusStyle]">

                                    <t-document-icon class="w-12 h-12"/>
                                    <span class="absolute flex pt-0.5 w-10 rounded-md items-center justify-center bg-gray-600 text-white top-5 text-sm font-semibold overflow-hidden">
                                       {{  upperCase(item.name) }}
                                   </span>
                                </div>
                            </div>
                            <!--File Name-->
                            <span class="font-semibold">
                            {{ item.name }}
                        </span>
                        </div>
                        <!--Right Area-->
                        <div class="flex justify-between items-center gap-4">
                            <!--File Size-->
                            <span>
                                <t-badge>
                                    {{  sizeCalculator(item.size) }}
                                </t-badge>
                            </span>
                            <!--Delete Button-->
                            <t-button type="button" color="red" @click.native="deleteFile(index)">
                                <t-trash-icon class="w-5 h-5"/>
                            </t-button>
                        </div>
                    </div>
                </transition-group>
            </div>
        </transition>

    </div>
</template>

<script>
import TButton from "@/Components/Button/TButton.vue";
import Button from "@/Components/Button.vue";
import TBadge from "@/Components/Badge/TBadge.vue";
import TXIcon from "@/Components/Icons/TXIcon.vue";
import TTrashIcon from "@/Components/Icons/TTrashIcon.vue";
import TPaperClipIcon from "@/Components/Icons/TPaperClipIcon.vue";
import TAudioIcon from "@/Components/Icons/TAudioIcon.vue";
import TVideoIcon from "@/Components/Icons/TVideoIcon.vue";
import TDocumentIcon from "@/Components/Icons/TDocumentIcon.vue";
import { ref, toRefs, onMounted, defineEmits } from "vue";


export default {
    name: "TInputFile",
    components: {TDocumentIcon, TVideoIcon, TAudioIcon, TPaperClipIcon, TBadge, TTrashIcon, TXIcon, Button, TButton},
    props: {
        modelValue: {
            type: [String, Date, Number, Object, Array, Boolean],
            default: null
        },
        value: {},
        multiple: {
            type: Boolean,
            default: false
        },
        browseLabel: {
            type: String,
            default: '...'
        },
        placeholder: {
            type: String,
            default: 'در صورت نیاز یک فایل پیوست کنید'
        },
        preview: {
            type: Boolean,
            default: false
        },
        accept: {
            type: String,
            default: null
        }
    },
    emits: ['update:modelValue'],
    setup(props, {emit, slots}) {

        const input = ref(null);
        const files = ref([]);

        const clearFile = () => {
            input.value = null
            files.value = []
            emit("update:modelValue", files.value);
        }

        const deleteFile = (index) => {
            files.value.splice(index, 1)
            input.value.files = null
            emit("update:modelValue", files.value);
        }

        const updateFile = () => {

            let x = 0;
            for (x = 0; x < input.value.files.length; x++) {
                input.value.files[x].index = x
                files.value.push(input.value.files[x])
            }
            emit("update:modelValue", files.value);
        }

        const sizeCalculator = (value) => {
            let sizes = ["Bytes", "KB", "MB", "GB", "TB"];
            if (value === 0) return "0 Byte";
            let i = parseInt(Math.floor(Math.log(value) / Math.log(1024)));
            return Math.round(value / Math.pow(1024, i), 2) + " " + sizes[i];
        }

        const urlGenerator = (value) => {
            return URL.createObjectURL(value)
        }

        const upperCase = (value) => {
            return value.toUpperCase().split('.')[value.toUpperCase().split('.').length-1]
        }

        return { input, files, updateFile, deleteFile, clearFile, sizeCalculator, urlGenerator, upperCase };
    }
}
</script>

<style scoped>
.fade-enter-active, .fade-leave-active {
    transition: all .4s ease;
}

.fade-enter-from, .fade-leave-to {
    opacity: 0;
    transform: translateY(30px);
    max-height: 0;
}

.fade-enter-to, .fade-leave-from {
    opacity: 1;
    transform: translateX(30px);
    max-height: 100%;
}
</style>
