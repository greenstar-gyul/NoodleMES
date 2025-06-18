export default [
    {
        path: '/mpo/list',
        name: 'mpoList',
        component: () => import('@/views/mpo/MpoList.vue')
    },
        {
        path: '/mpo/manage',
        name: 'mpoManage',
        component: () => import('@/views/mpo/MpoManage.vue')
    },
];
