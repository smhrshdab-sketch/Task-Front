<template>
    <div class="mt-2 p-4 overflow-visible bg-white rounded-md shadow-md dark:bg-dark-eval-1">

        <slot name="header"/>

        <div class="card-body"
            :class="[bodyClass]"
        >
            <slot />
        </div>
    </div>
</template>

<script setup>
    const props = defineProps({


        bodyClass : {
            type : String,
            default : null
        }
    })
</script>
