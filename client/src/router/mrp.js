export default [
    {
        path: '/mrp/manage',
        name: 'mrpManage',
        component: () => import('@/views/mrp/MRPManage.vue')
    },
    {
        path: '/mrp/list',
        name: 'mrpList',
        component: () => import('@/views/mrp/MRPList.vue')
    },
];
