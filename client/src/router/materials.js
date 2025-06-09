export default [
    {
        path: '/material/list',
        name: 'matList',
        component: () => import('@/views/material/List.vue')
    },
        {
        path: '/material/manage',
        name: 'matManage',
        component: () => import('@/views/material/Manage.vue')
    },
];
