<template>
    <div>
        <Combobox
            v-model="selected"
            :nullable="props.nullable"
            v-slot="{ open }"
        >
            <div
                class="relative border-gray-400 bg-white dark:bg-dark-eval-1 dark:border-gray-600 rounded-md border-1"
            >
                <div
                    :class="[
                        'relative w-full cursor-default overflow-hidden border-gray-400 border rounded-md sm:text-sm',
                        'focus-within:border-gray-400 focus-within:ring focus-within:ring-abrash-blue focus-within:ring-offset-0 focus-within:ring-offset-white dark:border-gray-600  dark:text-gray-300 dark:focus-within:ring-offset-dark-eval-1',
                        insideClass,
                    ]"
                >

                    <ComboboxInput
                        aria-autocomplete="none"
                        autocomplete="off"
                        :disabled="props.disabled"
                        v-if="selected != null"
                        tabindex="0"
                        :class="[
                            props.inputClass,
                            'bg-transparent w-full border-none py-2 pl-3 pr-10 rtl:pr-3 rtl:pl-10  leading-6',
                            {
                                'text-gray-500':
                                    selected[props.optionsValueKey] == null,
                                'text-gray-900 dark:text-gray-200':
                                    selected[props.optionsValueKey] != null,
                            },
                            insideClass,
                        ]"
                        :displayValue="
                            (option) => option[props.optionsLabelKey]
                        "
                        @change="query = $event.target.value"
                        @focus="$event.target.select()"
                    />
                    <ComboboxInput
                        v-else
                        aria-autocomplete="none"
                        autocomplete="off"
                        tabindex="0"
                        :class="[
                            props.inputClass,
                            'bg-transparent w-full border-none py-2 pl-3 pr-10 rtl:pr-3 rtl:pl-10 text-xs leading-6 text-gray-500',
                            insideClass,
                        ]"
                        :displayValue="test"
                        @change="query = $event.target.value; props.searchWord = $event.target.value"
                        @focus="$event.target.select()"
                    />
                    <ComboboxButton
                        class="absolute inset-y-0 right-0 left-auto rtl:right-auto rtl:left-0 flex items-center pr-2 pl-0 rtl:pl-2 rtl:pr-0"
                    >
                        <ArrowDownFilledIcon
                            :class="[
                                'opacity-50 ml-2 mr-2 rtl:ml-2 rtl:mr-2 h-2.5 w-2.5 dark:hover:text-gray-100 hover:text-gray-900',
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
                            {{ 'هیچ موردی یافت نشد!' }}
                        </div>

                        <ComboboxOption
                            v-if="!disabled"
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
                                    'bg-abrash-blue text-white dark:text-white':
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
                                    {{ option[props.optionsLabelKey] }}
                                </span>
                                <span
                                    v-if="selected"
                                    class="absolute inset-y-0 left-0 right-auto rtl:right-0 rtl:left-auto flex items-center pl-3 pr-auto rtl:pr-3 rtl:pl-auto"
                                    :class="{
                                        'text-white': active,
                                        'text-abrash-blue': !active,
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
</template>

<script>
import { ref, watch, computed, inject } from "vue";
import {
    Combobox,
    ComboboxInput,
    ComboboxButton,
    ComboboxOptions,
    ComboboxOption,
    TransitionRoot,
} from "@headlessui/vue";
import { CheckIcon } from "@heroicons/vue/20/solid";
import { ArrowDownIcon, ArrowDownFilledIcon } from "@/Components/Icons/General";


export default {
    components: {
        Combobox,
        ComboboxInput,
        ComboboxButton,
        ComboboxOptions,
        ComboboxOption,
        TransitionRoot,
        CheckIcon,
        ArrowDownIcon, ArrowDownFilledIcon,
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
        typeable: {
            type: Boolean,
            default: true,
        },
        searchWord: {
            type: String,
            default: null,
        },
    },
    emits: ["change:selectedValue"],
    emits: ["update:searchWord"],


    setup(props, { emit, slots }) {

        const options = ref([]);
        const nullableText = ref(null);
        const mandetoryText = ref(null);
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
                        : 'انتخاب یکی از گزینه ها الزامی است!';
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
        const selected =
            props?.modelValue == null
                ? ref(options.value[0])
                : ref(options.value[options.value.findIndex(pt => pt[props.optionsValueKey] == props?.modelValue)]);

        watch(
            () => props.options,
            (newValue, oldValue) => {
                if (newValue != oldValue) {
                    setOptions();
                    if (oldValue.length == 0) {
                        selected.value = options.value[0];
                    }
                }
            }
        );

        watch(
            () => props.placeHolder,
            (newValue, oldValue) => {

                if (newValue != oldValue) {

                    setTexts(newValue);
                }
            }
        );

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
        let query = ref("");



        let filteredOptions = computed(() =>
            query.value == ""
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

        watch(selected, (newValue, oldValue) => {
            emit("change:selectedValue", newValue);
            //console.log(`newValue : `,newValue)
            if (newValue != null)
                //emit("update:modelValue", newValue[props.optionsValueKey]);
                emit("update:modelValue", newValue);
            else
                emit("update:modelValue", options.value[0]);
        });

        watch(query, (newValue, oldValue) => {

            emit("update:searchWord", newValue);

        });

        /*Get Error Status*/
        const errors = inject("errors", []);

        return {
            props,
            selected,
            query,
            filteredOptions,
            errors,
            mandetoryText,
            nullableText,
        };
    },
};
</script>
