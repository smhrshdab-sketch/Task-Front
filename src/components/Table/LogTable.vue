<script setup lang="ts">
import { ref, computed } from 'vue'

// ===== Types =====
interface Log {
    id: number
    subject_type: string
    subject_id: number
    causer_id: number
    description: string
    event: string
    batch_id: string
    ip_address: string
    user_agent: string
    url: string
    method: string
    metadata: string
    created_at: string
    updated_at: string
    causer?: {
        id: number
        name: string
        email: string
        avatar_path?: string | null
    }
}

interface HeaderCell {
    key: string
    label: string
    visible: boolean
    width?: string
}

// ===== Props =====
const props = defineProps<{
    logs: Log[]
    loading?: boolean
}>()

// ===== Emits =====
const emit = defineEmits<{
    (e: 'view-detail', log: Log): void
}>()

// ===== Header Configuration =====
const headers = ref<HeaderCell[]>([
    { key: 'causer', label: 'User', visible: true },
    { key: 'event', label: 'Event', visible: true },
    { key: 'subject_type', label: 'Resource', visible: true },
    { key: 'description', label: 'Description', visible: true },
    { key: 'method', label: 'Method', visible: true },
    { key: 'ip_address', label: 'IP Address', visible: false },
    { key: 'url', label: 'URL', visible: false },
    { key: 'created_at', label: 'Date', visible: true }
])

// ===== Computed =====
const visibleHeaders = computed(() => {
    return headers.value.filter(h => h.visible)
})

// ===== Helper Functions =====
const getEventColor = (event: string): string => {
    const colors: Record<string, string> = {
        'created': 'bg-green-100 text-green-700',
        'updated': 'bg-blue-100 text-blue-700',
        'deleted': 'bg-red-100 text-red-700',
        'restored': 'bg-emerald-100 text-emerald-700',
        'login': 'bg-purple-100 text-purple-700',
        'logout': 'bg-gray-100 text-gray-700',
        'suspended': 'bg-yellow-100 text-yellow-700',
        'activated': 'bg-teal-100 text-teal-700'
    }
    return colors[event] || 'bg-gray-100 text-gray-700'
}

const getMethodColor = (method: string): string => {
    const colors: Record<string, string> = {
        'GET': 'bg-blue-100 text-blue-700',
        'POST': 'bg-green-100 text-green-700',
        'PUT': 'bg-yellow-100 text-yellow-700',
        'PATCH': 'bg-orange-100 text-orange-700',
        'DELETE': 'bg-red-100 text-red-700'
    }
    return colors[method] || 'bg-gray-100 text-gray-700'
}

const formatDate = (dateString: string): string => {
    if (!dateString) return '-'
    try {
        const date = new Date(dateString)
        return date.toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    } catch {
        return dateString
    }
}

const getResourceName = (subjectType: string): string => {
    if (!subjectType) return '-'
    const parts = subjectType.split('\\')
    return parts[parts.length - 1] || subjectType
}

const getInitials = (name: string): string => {
    if (!name) return '?'
    return name.charAt(0).toUpperCase()
}

const viewDetail = (log: Log) => {
    emit('view-detail', log)
}

// ===== Toggle Column Visibility =====
const toggleColumn = (key: string) => {
    const header = headers.value.find(h => h.key === key)
    if (header) {
        header.visible = !header.visible
    }
}
</script>

<template>
    <div class="w-full">
        <!-- Loading State -->
        <div v-if="loading" class="text-center py-12">
            <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
            <p class="mt-4 text-gray-600">Loading audit logs...</p>
        </div>

        <!-- Empty State -->
        <div v-else-if="!logs || logs.length === 0" class="text-center py-12 bg-white rounded-xl shadow-sm">
            <span class="text-4xl block mb-4">📋</span>
            <p class="text-gray-500 text-lg">No audit logs found</p>
            <p class="text-gray-400 text-sm mt-2">Activities will appear here as users interact with the system</p>
        </div>

        <!-- Table -->
        <div v-else class="bg-white rounded-xl shadow-sm overflow-hidden">
            <!-- Column Toggle Toolbar -->
            <div class="p-3 border-b border-gray-100 flex flex-wrap gap-2 bg-gray-50">
                <span class="text-sm text-gray-500 font-medium mr-2">Show columns:</span>
                <button
                    v-for="header in headers"
                    :key="header.key"
                    @click="toggleColumn(header.key)"
                    class="px-2 py-1 text-xs rounded transition-colors"
                    :class="header.visible 
                        ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200' 
                        : 'bg-gray-200 text-gray-500 hover:bg-gray-300'"
                >
                    {{ header.label }}
                </button>
            </div>

            <!-- Table -->
            <div class="overflow-x-auto">
                <table class="w-full border-collapse">
                    <!-- Header -->
                    <thead class="bg-gray-100">
                        <tr>
                            <th 
                                v-for="header in visibleHeaders"
                                :key="header.key"
                                class="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-b"
                            >
                                {{ header.label }}
                            </th>
                            <th class="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-b">
                                Actions
                            </th>
                        </tr>
                    </thead>

                    <!-- Body -->
                    <tbody class="divide-y divide-gray-100">
                        <tr 
                            v-for="log in logs" 
                            :key="log.id"
                            class="hover:bg-gray-50 transition-colors cursor-pointer"
                            @click="viewDetail(log)"
                        >
                            <!-- User Column -->
                            <td v-if="visibleHeaders.some(h => h.key === 'causer')" class="px-4 py-3">
                                <div class="flex items-center gap-3">
                                    <div class="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 font-semibold text-sm">
                                        {{ getInitials(log.causer?.name || 'S') }}
                                    </div>
                                    <div>
                                        <div class="font-medium text-gray-800 text-sm">
                                            {{ log.causer?.name || 'System' }}
                                        </div>
                                        <div class="text-xs text-gray-400">
                                            {{ log.causer?.email || 'system@local' }}
                                        </div>
                                    </div>
                                </div>
                            </td>

                            <!-- Event Column -->
                            <td v-if="visibleHeaders.some(h => h.key === 'event')" class="px-4 py-3">
                                <span :class="['px-2.5 py-1 rounded-full text-xs font-medium', getEventColor(log.event)]">
                                    {{ log.event }}
                                </span>
                            </td>

                            <!-- Resource Column -->
                            <td v-if="visibleHeaders.some(h => h.key === 'subject_type')" class="px-4 py-3">
                                <div class="text-sm text-gray-800 font-medium">
                                    {{ getResourceName(log.subject_type) }}
                                </div>
                                <div class="text-xs text-gray-400">
                                    ID: {{ log.subject_id || '-' }}
                                </div>
                            </td>

                            <!-- Description Column -->
                            <td v-if="visibleHeaders.some(h => h.key === 'description')" class="px-4 py-3">
                                <div class="text-sm text-gray-700 max-w-xs truncate" :title="log.description">
                                    {{ log.description || '-' }}
                                </div>
                                <span :class="['px-1.5 py-0.5 text-xs rounded', getMethodColor(log.method)]">
                                    {{ log.method }}
                                </span>
                            </td>

                            <!-- Method Column -->
                            <td v-if="visibleHeaders.some(h => h.key === 'method')" class="px-4 py-3">
                                <span :class="['px-2 py-1 rounded text-xs font-medium', getMethodColor(log.method)]">
                                    {{ log.method }}
                                </span>
                            </td>

                            <!-- IP Address Column -->
                            <td v-if="visibleHeaders.some(h => h.key === 'ip_address')" class="px-4 py-3">
                                <code class="text-xs font-mono text-gray-600 bg-gray-100 px-2 py-1 rounded">
                                    {{ log.ip_address || '-' }}
                                </code>
                            </td>

                            <!-- URL Column -->
                            <td v-if="visibleHeaders.some(h => h.key === 'url')" class="px-4 py-3">
                                <div class="text-sm text-gray-600 max-w-xs truncate" :title="log.url">
                                    {{ log.url || '-' }}
                                </div>
                            </td>

                            <!-- Date Column -->
                            <td v-if="visibleHeaders.some(h => h.key === 'created_at')" class="px-4 py-3">
                                <div class="text-sm text-gray-600">
                                    {{ formatDate(log.created_at) }}
                                </div>
                            </td>

                            <!-- Actions Column -->
                            <td class="px-4 py-3">
                                <button
                                    @click.stop="viewDetail(log)"
                                    class="text-emerald-600 hover:text-emerald-800 font-medium text-sm transition-colors"
                                >
                                    View Details →
                                </button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <!-- Footer with count -->
            <div class="px-4 py-3 border-t border-gray-100 bg-gray-50 text-sm text-gray-500">
                Showing {{ logs.length }} log{{ logs.length > 1 ? 's' : '' }}
            </div>
        </div>
    </div>
</template>

<style scoped>
tr {
    cursor: pointer;
}
tr:hover {
    background-color: #f9fafb;
}
</style>