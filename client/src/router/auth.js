export default [
    {
        path: '/auth/login',
        name: 'login',
        component: () => import('@/views/auth/Login.vue')
    },
    {
        path: '/auth/access',
        name: 'accessDenied',
        component: () => import('@/views/auth/Access.vue')
    },
    {
        path: '/auth/error',
        name: 'error',
        component: () => import('@/views/auth/Error.vue')
    },
];