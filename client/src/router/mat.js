export default [
    {
        path: '/mat/list',
        name: 'matList',
        component: () => import('@/views/mat/MatList.vue')
    },
        {
        path: '/mat/manage',
        name: 'matManage',
        component: () => import('@/views/mat/MatManage.vue')
    },
];
