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
        path: '/performance/list',
        name: 'performanceList',
        component: () => import('../views/performance/performanceList.vue')
    },
    {
        path: '/work/working',
        name: 'working',
        component: () => import('@/views/working/WorkProcess.vue')
    },
    {
        path: '/performance/detail/:prdr_code',
        name: 'PerformanceDetail',
        component: () => import('../views/performance/performanceDetail.vue')
    },
];
