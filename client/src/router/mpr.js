export default [
    {
        path: '/mpr/list',
        name: 'mprList',
        component: () => import('@/views/mpr/MprList.vue')
    },
        {
        path: '/mpr/manage',
        name: 'mprManage',
        component: () => import('@/views/mpr/MprManage.vue')
    },
];
