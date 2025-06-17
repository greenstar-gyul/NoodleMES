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
        path: '/work/:wko_code',
        name: 'working',
        component: () => import('@/views/working/WorkProcess.vue')
    },
    {
        path: '/work/detail/:wko_code/:eq_code',
        name: 'workingDetail',
        component: () => import('@/views/working/WorkDetail.vue')
    },
    {
        path: '/work/list',
        name: 'workingList',
        component: () => import('@/views/working/WorkList.vue')
    },
    {
        path: '/performance/detail/:prdr_code',
        name: 'PerformanceDetail',
        component: () => import('../views/performance/performanceDetail.vue')
    },
];
