export default [
    {
        path: '/wko/manage',
        name: 'wkoManage',
        component: () => import('@/views/wko/WKOManage.vue')
    },
    {
        path: '/wko/list',
        name: 'wkoList',
        component: () => import('@/views/wko/WKOList.vue')
    },
    // {
    //     path: '/wko/list',
    //     name: 'wkoList',
    //     component: () => import('@/views/wko/WKOList.vue')
    // },
];
