<script>
import { ref, watch } from "vue";
import {
    Listbox,
    ListboxLabel,
    ListboxButton,
    ListboxOptions,
    ListboxOption,
} from "@headlessui/vue";
import { ArrowDownIcon } from "@/Components/Icons/General";
import { CheckIcon } from '@heroicons/vue/20/solid';

export default {
    components: {
        Listbox,
        ListboxLabel,
        ListboxButton,
        ListboxOptions,
        ListboxOption,
        ArrowDownIcon,
        CheckIcon,
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
        disabled: {
            type: Boolean,
            default: false,
        },
        insideClass: {
            type: String,
            default: null,
        },
    },
    emits: ["update:modelValue"],
    setup(props, { emit, slots }) {

        const options = ref(props.options);

        // select init option
        const selected =
            props.modelValue == null
                ? ref(options.value[0])
                : ref(
                      options.value.filter((option) => {
                          return (
                              option[props.optionsValueKey] == props.modelValue
                          );
                      })[0]
                  );

        function selectThis(selectedOption) {
            options.value.forEach((data) => {
                if (
                    data[props.optionsValueKey] ==
                    selectedOption[props.optionsValueKey]
                ) {
                    selected.value = data;
                }
            });
        }

        watch(
            () => props.modelValue,
            (newValue, oldValue) => {
                if (newValue != oldValue) {
                    if (newValue == null) {
                        selected.value = options.value[0];
                    }
                }
            }
        );

        watch(selected, (newValue, oldValue) => {
            emit("update:modelValue", newValue[props.optionsValueKey]);
        });

        return {
            props,
            selected,
            selectThis,
        };
    },
};
</script>
<template>
    <div class="">
        <Listbox v-model="selected" v-slot="{ open }">
            <div
                class="relative border-gray-300 dark:border-gray-600 rounded-md border-1"
            >
                <ListboxButton
                    :class="[
                        'flex flex-row :flex-row-reverse justify-between border !p-3 cursor-pointer align-middle items-center relative w-full  overflow-hidden border-gray-300 rounded-md sm:text-base dark:text-white bg-opacity-90 px-2 py-2 font-medium',
                        'focus-within:border-gray-400 focus-within:ring focus-within:ring-abrash-blue focus-within:ring-offset-2 focus-within:ring-offset-white dark:border-gray-600 dark:bg-gray-900 dark:text-gray-300 dark:focus-within:ring-offset-dark-eval-1',
                        insideClass,
                    ]"
                >
                    {{ selected[props.optionsLabelKey] }}
                    <ArrowDownIcon
                        :class="[
                            'opacity-50 ml-2 -mr-1 rtl:-ml-1 rtl:mr-2 h-4 w-4 dark:hover:text-gray-100 hover:text-gray-900',
                            open ? 'rotate-180' : '',
                        ]"
                        aria-hidden="true"
                    />
                </ListboxButton>

                    <ListboxOptions
                        class="absolute mt-1 w-full border overflow-auto rounded-md dark:shadow-blakc bg-white dark:bg-gray-800 py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm z-10"
                    >
                        <ListboxOption
                            v-slot="{ active, selected }"
                            v-for="option in props.options"
                            :key="option[props.optionsValueKey]"
                            :value="option"
                            as="template"
                        >
                            <li
                                class="relative cursor-default select-none py-2 pl-10 pr-4 rtl:pl-4 rtl:pr-10"
                                :class="{
                                    'bg-abrash-blue text-white dark:text-gray-900': active,
                                    'text-gray-900 dark:text-white': !active,
                                }"
                            >
                                <span
                                    class="block truncate"
                                    :class="{ 'font-medium': selected, 'font-normal': !selected }"
                                >
                                    {{ option[props.optionsLabelKey] }}
                                </span>
                                <span
                                    v-if="selected"
                                    class="absolute inset-y-0 left-0 right-auto rtl:right-0 rtl:left-auto flex items-center pl-3 pr-auto rtl:pr-3 rtl:pl-auto"
                                    :class="{ 'text-white': active, 'text-teal-600': !active }"
                                >
                                    <CheckIcon class="h-5 w-5" aria-hidden="true" />
                                </span>
                            </li>

                        </ListboxOption>
                    </ListboxOptions>

                </div>
        </Listbox>
    </div>
</template>