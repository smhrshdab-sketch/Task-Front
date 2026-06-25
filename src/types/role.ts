// src/types/role.ts

export interface Permission {
    [key: string]: boolean
}

export interface Role {
    id: number
    title: string
    slug: string
    parent_id: number | null
    permissions: Permission | string
    created_at: string
    updated_at: string
}

export interface RoleFormData {
    title: string
    slug: string
    parent_id: number | null
}

// Permission helper functions
export const hasPermission = (role: Role, entity: string, action: string): boolean => {
    const permissions = typeof role.permissions === 'string' 
        ? JSON.parse(role.permissions) 
        : role.permissions
    
    // Check wildcard first
    if (permissions['*'] === true) return true
    if (permissions['*'] === false) return false
    
    const key = `${entity}_${action}`
    return permissions[key] === true
}

export const setPermission = (role: Role, entity: string, action: string, value: boolean): Role => {
    const permissions = typeof role.permissions === 'string' 
        ? JSON.parse(role.permissions) 
        : { ...role.permissions }
    
    const key = `${entity}_${action}`
    permissions[key] = value
    
    return {
        ...role,
        permissions
    }
}

export const getPermissionMatrix = (role: Role): Record<string, Record<string, boolean>> => {
    const permissions = typeof role.permissions === 'string' 
        ? JSON.parse(role.permissions) 
        : role.permissions
    
    const matrix: Record<string, Record<string, boolean>> = {}
    
    for (const [key, value] of Object.entries(permissions)) {
        if (key === '*') continue
        
        const [entity, action] = key.split('_')
        if (!matrix[entity]) matrix[entity] = {}
        matrix[entity][action] = value as boolean
    }
    
    return matrix
}