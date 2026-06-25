<script setup lang="ts">
import { computed, reactive, watch} from 'vue'

// ===== Types =====
interface Entity {
    name: string
    label: string
    icon?: string
}

interface Action {
    key: string
    label: string
    icon?: string
}

type PermissionMap = Record<string, boolean>

// ===== Props =====
const props = defineProps<{
    entities: Entity[]
    actions: Action[]
    permissions: PermissionMap
    readOnly?: boolean
}>()

// ===== Emits =====
const emit = defineEmits<{
    (e: 'update:permissions', permissions: PermissionMap): void
    (e: 'change', entity: string, action: string, value: boolean): void
}>()

// ===== Local State (reactive copy of props) =====
const localPermissions = reactive<PermissionMap>({})

// Initialize local permissions from props
const initLocalPermissions = () => {
    Object.keys(localPermissions).forEach(key => {
        delete localPermissions[key]
    })
    Object.assign(localPermissions, props.permissions || {})
}

// Watch for prop changes (when parent loads new data)
watch(() => props.permissions, () => {
    initLocalPermissions()
}, { immediate: true, deep: true })

// ===== Helper Functions =====
const hasPermission = (entity: string, action: string): boolean => {
    const key = `${entity}_${action}`
    
    // Wildcard checks
    if (localPermissions['*'] === true) return true
    if (localPermissions[`${entity}_*`] === true) return true
    
    return localPermissions[key] === true
}

const isAllGranted = (entity: string): boolean => {
    return props.actions.every(action => hasPermission(entity, action.key))
}

// ===== Toggle Functions (updates local state AND emits) =====
const togglePermission = (entity: string, action: string) => {
    if (props.readOnly) return
    
    const key = `${entity}_${action}`
    const newValue = !hasPermission(entity, action)
    
    // Update local state immediately (UI updates right away!)
    localPermissions[key] = newValue
    
    // Emit to parent for persistence
    emit('update:permissions', { ...localPermissions })
    emit('change', entity, action, newValue)
}

const toggleAllForEntity = (entity: string) => {
    if (props.readOnly) return
    
    const newValue = !isAllGranted(entity)
    
    // Update local state immediately for all actions
    props.actions.forEach(action => {
        const key = `${entity}_${action.key}`
        localPermissions[key] = newValue
    })
    
    // Emit to parent
    emit('update:permissions', { ...localPermissions })
}

// ===== Computed for UI =====
const hasAnyAction = computed(() => props.actions && props.actions.length > 0)
const hasAnyEntity = computed(() => props.entities && props.entities.length > 0)

// Initialize on mount
initLocalPermissions()
</script>

<template>
    <div v-if="hasAnyEntity && hasAnyAction" class="overflow-x-auto">
        <table class="w-full border-collapse">
            <thead class="bg-gray-100">
                <tr>
                    <th class="px-4 py-3 text-left text-sm font-semibold text-gray-700 sticky left-0 bg-gray-100 z-10">
                        Entity
                    </th>
                    <th v-for="action in actions" 
                        :key="action.key"
                        class="px-4 py-3 text-center text-sm font-semibold text-gray-700"
                    >
                        <div class="flex flex-col items-center gap-1">
                            <span class="text-base">{{ action.icon }}</span>
                            <span>{{ action.label }}</span>
                        </div>
                    </th>
                    <th class="px-4 py-3 text-center text-sm font-semibold text-gray-700">
                        <div class="flex flex-col items-center gap-1">
                            <span>🎯</span>
                            <span>All</span>
                        </div>
                    </th>
                </tr>
            </thead>
            <tbody class="divide-y divide-gray-200">
                <tr v-for="entity in entities" 
                    :key="entity.name"
                    class="hover:bg-gray-50 transition-colors"
                >
                    <!-- Entity name column -->
                    <td class="px-4 py-3 sticky left-0 bg-white font-medium text-gray-800 z-10">
                        <div class="flex items-center gap-2">
                            <span class="text-xl">{{ entity.icon || '📁' }}</span>
                            <span>{{ entity.label }}</span>
                        </div>
                    </td>
                    
                    <!-- Permission cells -->
                    <td v-for="action in actions" 
                        :key="action.key"
                        class="px-4 py-3 text-center"
                    >
                        <button
                            v-if="!readOnly"
                            type="button"
                            @click="togglePermission(entity.name, action.key)"
                            class="w-full flex justify-center transition-transform hover:scale-110"
                            :title="hasPermission(entity.name, action.key) ? 'Click to revoke' : 'Click to grant'"
                        >
                            <div
                                :class="[
                                    'w-6 h-6 rounded-full transition-all duration-200 shadow-sm',
                                    hasPermission(entity.name, action.key)
                                        ? 'bg-green-500 hover:bg-green-600'
                                        : 'bg-red-500 hover:bg-red-600'
                                ]"
                            >
                                <div class="w-full h-full flex items-center justify-center text-white text-xs font-bold">
                                    {{ hasPermission(entity.name, action.key) ? '✓' : '✗' }}
                                </div>
                            </div>
                        </button>
                        <div v-else class="flex justify-center">
                            <div
                                :class="[
                                    'w-6 h-6 rounded-full',
                                    hasPermission(entity.name, action.key) ? 'bg-green-500' : 'bg-red-500'
                                ]"
                                :title="hasPermission(entity.name, action.key) ? 'Granted' : 'Denied'"
                            >
                                <div class="w-full h-full flex items-center justify-center text-white text-xs">
                                    {{ hasPermission(entity.name, action.key) ? '✓' : '✗' }}
                                </div>
                            </div>
                        </div>
                    </td>
                    
                    <!-- All actions column -->
                    <td class="px-4 py-3 text-center">
                        <button
                            v-if="!readOnly"
                            type="button"
                            @click="toggleAllForEntity(entity.name)"
                            class="px-2 py-1 text-xs rounded transition-colors"
                            :class="[
                                isAllGranted(entity.name)
                                    ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            ]"
                        >
                            {{ isAllGranted(entity.name) ? 'All ✓' : 'Select All' }}
                        </button>
                        <div v-else class="text-xs text-gray-400">
                            {{ isAllGranted(entity.name) ? 'All granted' : 'Partial' }}
                        </div>
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
    <div v-else class="p-4 text-center text-gray-500">
        No permission data available.
    </div>
</template>