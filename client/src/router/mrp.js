export default [
    {
        path: '/mrp/manage',
        name: 'mrpManage',
        component: () => import('@/views/mrp/MRPManage.vue')
    },
    {
        path: '/wko/manage',
        name: 'wkoManage',
        component: () => import('@/views/wko/WKOManage.vue')
    },
];
