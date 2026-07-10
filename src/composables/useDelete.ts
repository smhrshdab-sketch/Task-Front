import { ref } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

interface DeleteOptions {
    resource: string  // 'departments', 'memberships', 'accounts'
    confirmMessage?: string
    successMessage?: string
    redirectAfterDelete?: string
    onSuccess?: () => void
}

export function useDelete(options: DeleteOptions) {
    const isDeleting = ref(false)
    const error = ref<string | null>(null)
    const router = useRouter()
    
    const API_URL = import.meta.env.VITE_API_URL
    
    const deleteItem = async (id: number) => {
        // Confirmation dialog
        const message = options.confirmMessage || `Are you sure you want to delete this ${options.resource.slice(0, -1)}?`
        
        if (!confirm(message)) {
            return false
        }
        
        isDeleting.value = true
        error.value = null
        
        try {
            const token = localStorage.getItem('access_token')
            if (!token) {
                router.push('/login')
                return false
            }
            console.log(`options.resource: ${options.resource} and id: `,id)
            await axios.delete(`${API_URL}/${options.resource}/${id}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'X-Department-Id': localStorage.getItem('X-Department-Id') || '1'
                }
            })
            
            // Show success message
            const successMsg = options.successMessage || `${options.resource.slice(0, -1)} deleted successfully`
            alert(successMsg) // Or use a toast notification
            
            // Call custom success handler
            if (options.onSuccess) {
                options.onSuccess()
                
            }
            
            // Redirect if specified
            if (options.redirectAfterDelete) {
                router.push(options.redirectAfterDelete)
            }
            
            return true
            
        } catch (err: any) {
            console.error('Delete failed:', err)
            error.value = err.response?.data?.message || `Failed to delete ${options.resource.slice(0, -1)}`
            alert(error.value)
            return false
            
        } finally {
            isDeleting.value = false
        }
    }
    
    return {
        deleteItem,
        isDeleting,
        error
    }
}