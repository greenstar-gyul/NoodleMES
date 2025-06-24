export default [
    {
        path: '/mout/list',
        name: 'moutList',
        component: () => import('@/views/mout/MoutList.vue')
    },
        {
        path: '/mout/manage',
        name: 'moutManage',
        component: () => import('@/views/mout/MoutManage.vue')
    },
];
