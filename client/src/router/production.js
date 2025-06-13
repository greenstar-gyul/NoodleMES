export default [
    {
        path: '/productions/manage',
        name: 'productionManage',
        component: () => import('@/views/production/ProductionManage.vue')
    },
    {
        path: '/productions/list',
        name: 'productionList',
        component: () => import('@/views/production/ProductionList.vue')
    },
    
];
