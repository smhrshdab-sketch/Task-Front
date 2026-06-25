<script setup lang="ts">
    import { defineProps } from 'vue';
    // -----------------------
    const props = defineProps({
        links:{
            type:Array,
            default:[]
        },
        login:{
            type:Boolean,
            default:false
        },
        logo:{
            type:Object,
            visibile:{
                type:Boolean,
                default:true
            }
        }
    })
</script>
<template>    
    <div class="w-full h-4 flex flex-row p-3 bg-green-200 shadow-xl justify-between">
        <div v-if="props.logo.visibile" class="flex p-1 w-[10%]">
            <img src="" alt="">
        </div>
        <ul class="w-[70%] flex flex-row justify-around items-center">
            <li class="flex p-1 hover:bg-green-400" v-for="item in props.links">{{ item }}</li>
        </ul>
        <div v-if="props.login" class="w-1/4 flex flex-row justify-around items-center">
            <span class="">
                <img src="" alt="">
                <a href=""></a>
            </span>
            <span>
                <a href="">Logout</a>
            </span>
        </div>
        <div v-else class="w-[20%] flex flex-row justify-around items-center">
            <span class="">
                <img src="" alt="">
                <a href=""></a>
            </span>
            <span>
                <a href="">Login</a>
            </span>
        </div>
    </div>
</template>