<template>
    <span class="border flex flex-row gap-2 w-max items-center m-1 p-1 border-abrash-red hover:border-red-500 rounded-md text-sm font-semibold text-gray-600 dark:text-gray-200">
        <XMarkIcon class="w-4 h-4 cursor-pointer hover:text-red-500 border-l border-gray-300 dark:border-gray-600"/>
        <span class="text-xs text-abrash-blue">
           {{ title }}
           <span class="mx-1">:</span>
           {{ the_value }}
        </span>
    </span>
</template>

<script>
    import { XMarkIcon } from "@heroicons/vue/20/solid";

    export default {
        components: {
            XMarkIcon,
        },
        props: {
            title  : String,
            the_key: String,
            the_value: String,
        },

    }
</script>