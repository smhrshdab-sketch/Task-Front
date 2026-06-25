<script setup lang="ts">
    import {ref} from 'vue'
//==================
    interface DataCell{
        label:string
        type:string
        style:string
        index:number
        visibiliy:boolean
        value:string
    }
    interface ActionCell{
        label:string
        value:string
        index:number
        visibiliy:boolean
        icon:string | null
        link:string | null
        subTable:boolean        
    }
    interface Log {
        id: number
        subject_type: string
        subject_id:number
        causer_id:number
        description: string
        event: string 
        batch_id :string
        ip_address:string
        user_agent:string
        url:string
        method:string
        metadata:string
        created_at: string
        updated_at: string
    }
//=======================
//=================
    const props = defineProps<{
        headerData:DataCell[]
        actionData:ActionCell[]
        content:Log[]
    }>()
</script>
<template>
    <table class="w-full border-collapse">
            <thead class="bg-gray-100">
                <tr>
                    <th v-for="data in headerData" 
                        :key="data.index"
                        class="px-4 py-3 text-center text-sm font-semibold text-gray-700"
                    >
                        <div 
                            class="flex items-center p-1"
                            v-if="data.visibiliy"
                        >
                            <span>{{ data.label }}</span>
                        </div>
                    </th>
                    <th v-for="action in actionData" 
                        :key="action.index"
                        class="px-4 py-3 text-center text-sm font-semibold text-gray-700"
                    >
                        <div 
                            class="flex items-center p-1"
                            v-if="action.visibiliy"
                        >
                            <span>{{ action.label }}</span>
                        </div>
                    </th>
                </tr>
           </thead>
           <tbody class="divide-y divide-gray-200">
                <tr v-for="log in content" 
                        :key="log.id"
                        class="hover:bg-gray-50 transition-colors"
                >
                    <td class="px-4 py-3 bg-white font-medium text-gray-800 z-10">
                        <div class="flex items-center p-2">
                            <span>{{ log.causer_id }}</span>
                        </div>
                    </td>
                    <td class="px-4 py-3 bg-white font-medium text-gray-800 z-10">
                        <div class="flex items-center p-2">
                            <span>{{ log.subject_type }}</span>
                        </div>
                    </td>
                    <td class="px-4 py-3 bg-white font-medium text-gray-800 z-10">
                        <div class="flex items-center p-2">
                            <span>{{ log.subject_id }}</span>
                        </div>
                    </td>
                    <td class="px-4 py-3 bg-white font-medium text-gray-800 z-10">
                        <div class="flex items-center p-2">
                            <span>{{ log.subject_type }}</span>
                        </div>
                    </td>
                </tr>
           </tbody>
    </table>
</template>