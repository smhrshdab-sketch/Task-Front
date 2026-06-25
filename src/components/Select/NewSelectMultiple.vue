<template>
    <div class="border-none p-0">
        <Combobox
            v-model="selectedItems"
            :nullable="props.nullable"
            v-slot="{ open }"
            multiple
        >
            <div
                class="relative border-gray-300 dark:border-gray-600 rounded-md border-1"
            >
                <div
                    :class="[
                        '	relative w-full cursor-default overflow-hidden border-gray-300 rounded-md sm:text-sm',
                        'focus-within:border-gray-400 focus-within:ring focus-within:ring-abrash-blue focus-within:ring-offset-2 focus-within:ring-offset-white dark:border-gray-600 dark:bg-gray-900 dark:text-gray-300 dark:focus-within:ring-offset-dark-eval-1',
                        insideClass,
                    ]"
                >
                    <ComboboxInput
                        tabindex="0"
                        :class="[
                            props.inputClass,
                            'bg-transparent w-full border-none py-2 pl-3 pr-10 rtl:pr-3 rtl:pl-10 text-sm leading-6 text-gray-500',
                            insideClass,
                        ]"
                        :displayValue="
                            (option) => (countText + ' ' + (selectedItems.length))
                        "
                        @change="query = $event.target.value"
                        @focus="$event.target.select()"
                    />
                    <ComboboxButton
                        class="absolute inset-y-0 right-0 left-auto rtl:right-auto rtl:left-0 flex items-center pr-2 pl-0 rtl:pl-2 rtl:pr-0"
                    >
                        <ArrowDownIcon
                            :class="[
                                'opacity-50 ml-2 -mr-1 rtl:-ml-1 rtl:mr-2 h-4 w-4 dark:hover:text-gray-100 hover:text-gray-900',
                                open ? 'rotate-180' : '',
                            ]"
                            aria-hidden="true"
                        />
                    </ComboboxButton>
                </div>
                <TransitionRoot
                    leave="transition ease-in duration-100"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                    @after-leave="query = ''"
                >
                    <ComboboxOptions
                        class="absolute mt-1 max-h-60 w-full overflow-auto rounded-md dark:shadow-blakc bg-white dark:bg-gray-800 py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm z-10"
                    >
                        <div
                            v-if="filteredOptions.length === 0 && query !== ''"
                            class="relative cursor-default select-none py-2 px-4 text-gray-700"
                        >
                            {{ t("general.labels.nothing_found") }}
                        </div>

                        <ComboboxOption
                            v-for="option in filteredOptions"
                            :class="
                                option[props.optionsValueKey] == null
                                    ? 'opacity-50'
                                    : ''
                            "
                            :disabled="
                                option[props.optionsValueKey] == null &&
                                props.nullable == false
                            "
                            as="template"
                            :key="option[props.optionsValueKey]"
                            :value="option"
                            v-slot="{ selected, active }"
                        >
                            <li
                                class="relative cursor-default select-none py-2 pl-10 pr-4 rtl:pl-4 rtl:pr-10"
                                :class="{
                                    'bg-teal-600 text-white dark:text-gray-900':
                                        active,
                                    'text-gray-900 dark:text-white': !active,
                                }"
                            >
                                <span
                                    class="block truncate"
                                    :class="{
                                        'font-medium': selected,
                                        'font-normal': !selected,
                                    }"
                                >
                                    {{
                                     option[props.optionsLabelKey] 
                                    }}
                                </span>
                                <span
                                    v-if="selected && option[props.optionsValueKey] != null"
                                    class="absolute inset-y-0 left-0 right-auto rtl:right-0 rtl:left-auto flex items-center pl-3 pr-auto rtl:pr-3 rtl:pl-auto"
                                    :class="{
                                        'text-white': active,
                                        'text-teal-600': !active,
                                    }"
                                >
                                    <CheckIcon
                                        class="h-5 w-5"
                                        aria-hidden="true"
                                    />
                                </span>
                            </li>
                        </ComboboxOption>
                    </ComboboxOptions>
                </TransitionRoot>
            </div>
        </Combobox>
    </div>

    <template v-if="props.showBadge">
        <div class="w-full flex flex-col border border-dashed p-2 mt-4">
            <!-- <div class="flex flex-wrap space-x-2 justify-start items-center mt-2"> -->
                <div
                    class="flex flex-wrap space-x-2 w-full min-h-10 gap-1"
                >
                    <TBadge
                        v-for="(tag) in activeSetsList"
                        color="success"
                        design="filled"
                        class="rounded my-1 ml-0 mr-1 rtl:ml-1 rtl:mr-0 cursor-pointer"
                        @click="deleteTag(tag)"
                        :key="tag[props.optionsValueKey]"
                    >
                        {{ tag[props.optionsLabelKey] }} <XMarkIcon class="w-4 h-4 text-gray-500 hover:text-red-500 mx-1" />
                    </TBadge>
                </div>
                <div class="flex flex-wrap" v-if="false">
                    <TBadge
                        v-for="(tag) in passiveSetsList"
                        color="light"
                        design="filled"
                        class="rounded mb-2 mr-2 cursor-pointer"
                        @click="addTag(tag)"
                        :key="tag[props.optionsValueKey]"
                    >
                        {{ tag[props.optionsLabelKey] }}
                    </TBadge>
                </div>
            <!-- </div> -->
        </div>
    </template>
</template>

<script>
import { ref, watch, computed, inject, reactive } from "vue";
import {
    Combobox,
    ComboboxInput,
    ComboboxButton,
    ComboboxOptions,
    ComboboxOption,
    TransitionRoot,
} from "@headlessui/vue";
import { CheckIcon } from "@heroicons/vue/20/solid";
import { ArrowDownIcon } from "@/Components/Icons/General";
//import { pageDirection } from "@/Composables";

import { XMarkIcon } from "@heroicons/vue/20/solid/index";
import TBadge from "@/Components/Badge/TBadge.vue";


export default {
    components: {
        Combobox,
        ComboboxInput,
        ComboboxButton,
        ComboboxOptions,
        ComboboxOption,
        TransitionRoot,
        CheckIcon,
        ArrowDownIcon,

        XMarkIcon,
        TBadge,
    },
    props: {
        modelValue: {
            type: [String, Date, Number, Object, Array, Boolean],
            default: null,
        },
        options: {
            type: [Object, Array],
            default() {
                return [];
            },
        },
        optionsLabelKey: {
            type: String,
            default: "title",
        },
        optionsValueKey: {
            type: String,
            default: "id",
        },
        inputClass: {
            type: String,
            default: null,
        },
        placeHolder: {
            type: String,
            default: null,
        },
        disabled: {
            type: Boolean,
            default: false,
        },
        readOnly: {
            type: Boolean,
            default: false,
        },
        nullable: {
            type: Boolean,
            default: false,
        },
        nullableText: {
            type: String,
            default: null,
        },
        mandetoryText: {
            type: String,
            default: null,
        },
        insideClass: {
            type: String,
            default: null,
        },
        showBadge: {
            type: Boolean,
            default: false,
        }
    },
    emits: ["update:modelValue"],
    setup(props, { emit, slots }) {

        const options = ref([]);
        const nullableText = ref(null);
        const mandetoryText = ref(null);
        const countText     = ref('تعداد انتخاب شده');
        //console.log(`optionse : `,props.options)
        function setTexts(text) {
            if (props.nullableText == null) {
                nullableText.value =
                    text != null
                        ? text
                        : 'یک گزینه انتخاب نمایید';
            } else {
                nullableText.value = text != null ? text : props.nullableText;
            }

            if (props.mandetoryText == null) {
                mandetoryText.value =
                    text != null
                        ? text
                        : 'انتخاب یکی از گزینه ها الزامی است';
            } else {
                mandetoryText.value = text != null ? text : props.mandetoryText;
            }

        }
        setTexts(props.placeHolder);

        function setOptions() {
            if (props.nullable) {
                options.value = [
                    {
                        [props.optionsValueKey]: null,
                        [props.optionsLabelKey]: nullableText.value,
                    },
                    ...props.options,
                ];
            } else {
                options.value = [
                    {
                        [props.optionsValueKey]: null,
                        [props.optionsLabelKey]: mandetoryText.value,
                    },
                    ...props.options,
                ];
            }
        }
        setOptions();

        // select init option
        const selectedItems = ref([]);

watch(
    () => props.options,
    () => initSelected(),
    { immediate: true }
);

watch(
    () => props.modelValue,
    () => initSelected(),
    { immediate: true }
);

function initSelected() {
    if (!Array.isArray(props.modelValue) || props.modelValue.length === 0) {
        selectedItems.value = [];
        return;
    }

    selectedItems.value = props.options.filter(opt =>
        props.modelValue.some(sel => sel.id === opt.id)
    );

    // also update active/passive lists
    // console.log(`activeSetsList : `, activeSetsList)
    // console.log(`passiveSetsList : `, passiveSetsList)
    // console.log(`selectedItems : `, selectedItems)
    if(activeSetsList){
        activeSetsList.splice(0, activeSetsList.length, ...selectedItems.value);
    }    
    if(passiveSetsList){
            passiveSetsList.splice(
            0,
            passiveSetsList.length,
            ...props.options.filter(opt => !selectedItems.value.includes(opt))
        );
    }
}



        function updateSelected()
        {
            selectedItems.value 
                = [options.value[0]].concat(
                    options.value.filter((option) => {
                        return (
                            activeSetsList.findIndex(pt => pt.id === option[props.optionsValueKey]) != -1
                        );
                    })
                );
            
            emit("update:modelValue", selectedItems.value);
        }

        // watch(
        //     () => props.modelValue,
        //     (newValue, oldValue) => {
        //         console.log(newValue);
        //         updateSelected();
        //     }
        // );
       watch(selectedItems, (val, oldVal) => {
            if (JSON.stringify(val) !== JSON.stringify(oldVal)) {
                emit("update:modelValue", val);
            }
        });


        let query = ref("");

        let filteredOptions = computed(() =>
            query.value === ""
                ? options.value
                : options.value.filter((option) =>
                      option[props.optionsLabelKey]
                          .toLowerCase()
                          .replace(/\s+/g, "")
                          .includes(
                              query.value.toLowerCase().replace(/\s+/g, "")
                          )
                  )
        );

        // watch(selectedItems, (newValue, oldValue) => {
        //     if(newValue != oldValue)
        //     {
        //         emit("update:modelValue", newValue);
        //     }
                
        // });


        /*Get Error Status*/
        const errors = inject("errors", []);


        var activeSetsList = reactive([])
        var passiveSetsList = reactive([...props.options])

        const addTag = (tag) => {
            activeSetsList.push(tag)
            passiveSetsList.splice(passiveSetsList.findIndex(pt => pt.id === tag.id), 1)
            emit('adding',activeSetsList)
        }

        const deleteTag = (tag) => {
            passiveSetsList.push(tag)
            activeSetsList.splice(activeSetsList.findIndex(pt => pt.id === tag.id), 1);

            updateSelected();
        }

        watch(selectedItems, (newValue, oldValue) => {
            if(newValue != oldValue)
            {
                // افزودن انهایی که انتخاب شده
                newValue.forEach((data) => {
                    if(data.id != null)
                    {
                        if(activeSetsList.findIndex(pt => pt.id === data.id) == -1)
                        {
                            passiveSetsList.forEach((pl) => {
                                if(pl.id == data.id)
                                    addTag(pl);
                            });
                        }
                    }
                });

                // حذف انهایی که از انتخاب در امده
                activeSetsList.forEach((al) => {
                    if(newValue.findIndex(pt => pt.id === al.id) == -1)
                    {
                        deleteTag(al);
                    }
                });

            }
        });

        return {
            props,

            selectedItems,
            query,
            filteredOptions,
            errors,
            mandetoryText,
            nullableText,
            countText,

            activeSetsList,
            passiveSetsList,
            addTag,
            deleteTag
        };
    },
};
</script>
