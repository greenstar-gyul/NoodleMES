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
    {
        path: '/performance/detail',
        name: 'performanceDetail',
        component: () => import('../views/performance/performanceDetail.vue')
    },
    {
        path: '/performance/list',
        name: 'performanceList',
        component: () => import('../views/performance/performanceList.vue')
    },
    
];
