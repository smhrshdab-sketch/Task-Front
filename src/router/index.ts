import { createRouter, createWebHistory } from 'vue-router'
import Dashboard from '@/views/Dashboard.vue'
//---------------------
import Login from '@/views/Login.vue'
import Register from '@/views/Register.vue'  
import Account from '@/views/Account.vue'

//--------------------
import DepartmentList from '@/views/department/DepartmentList.vue'
import DepartmentDetail from '@/views/department/DepartmentDetail.vue'
import DepartmentEdit from '@/views/department/DepartmentEdit.vue'
import DepartmentCreate from '@/views/department/DepartmentCreate.vue'
//--------------------
import RoleDetail from '@/views/role/RoleDetail.vue'
import RoleEdit from '@/views/role/RoleEdit.vue'
import RoleList from '@/views/role/RoleList.vue'
import CreateRole from '@/views/role/CreateRole.vue'

import MembershipDetail from '@/views/membership/MembershipDetail.vue'
import MembershipList from '@/views/membership/MembershipList.vue'
import MembershipEdit from '@/views/membership/MembershipEdit.vue'

import TaskList from '@/views/task/TaskList.vue'
import TaskCreate from '@/views/task/TaskCreate.vue'

import RecordShow from '@/views/record/RecordShow.vue'


const routes = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: Dashboard,
    meta: { requiresAuth: true }
  },
  // ------------------
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { guestOnly: true }  // Only guests can see login
  },
  {
    path: '/register',
    name: 'Register',
    component: Register,
    meta: { guestOnly: true }  // Only guests can see register
  },
  {
    path: '/account',
    name: 'Account',
    component: Account,
    meta: { requiresAuth: true }
  },
  {
    path: '/account/:id',
    name: 'AccountDetail',
    component: Account,
    meta: { requiresAuth: true }
  },
  //-------- Department ------------
  {
      path: '/department',
      name: 'DepartmentList',
      component: DepartmentList,
      meta: { requiresAuth: true }
  },
  {
      path: '/department/create',  // Create new department
      name: 'DepartmentCreate',
      component: DepartmentCreate,
      meta: { requiresAuth: true }
  },
  {
      path: '/department/:id',  // View department details
      name: 'DepartmentDetail',
      component: DepartmentDetail,
      meta: { requiresAuth: true }
  },
  {
      path: '/department/:id/edit',  // Edit department
      name: 'DepartmentEdit',
      component: DepartmentEdit,
      meta: { requiresAuth: true }
  },
  //------- Role ------------
   {
        path: '/roles',
        name: 'RoleList',
        component: RoleList,
        meta: { requiresAuth: true }
    },
    {
        path: '/roles/:id',
        name: 'RoleDetail',
        component: RoleDetail,  // READ ONLY
        meta: { requiresAuth: true }
    },
    {
        path: '/roles/:id/edit',
        name: 'RoleEdit',
        component: RoleEdit,    // EDITABLE
        meta: { requiresAuth: true }
    },
    {
        path: '/roles/create',
        name: 'RoleCreate',
        component: CreateRole,    // CreateABLE
        meta: { requiresAuth: true }
    },
    //-------------------
    {
        path: '/memberships',
        name: 'MembershipList',
        component: MembershipList,
        meta: { requiresAuth: true }
    },
    {
        path: '/membership/:id',
        name: 'MembershipDetail',
        component: MembershipDetail,  // READ ONLY
        meta: { requiresAuth: true }
    },
    {
        path: '/memberships/:id/edit',
        name: 'MembershipEdit',
        component: MembershipEdit,    // EDITABLE
        meta: { requiresAuth: true }
    },
     //-------------------
    {
        path: '/tasks',
        name: 'TaskList',
        component: TaskList,
        meta: { requiresAuth: true }
    },
    {
        path: '/task/create',
        name: 'TaskCreate',
        component: TaskCreate,
        meta: { requiresAuth: true }
    },
    //-------------------
    {
        path: '/records',
        name: 'RecordShow',
        component: RecordShow,
        meta: { requiresAuth: true }
    }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Navigation Guard - Improved version
router.beforeEach((to, from, next) => {
  const isLoggedIn = !!localStorage.getItem('access_token')
  
  // If route requires auth and user is not logged in
  if (to.meta.requiresAuth && !isLoggedIn) {
    next('/login')
  } 
  // If route is for guests only (login/register) and user is logged in
  else if (to.meta.guestOnly && isLoggedIn) {
    next('/dashboard')
  } 
  else {
    next()
  }
})

export default router