export default [
    {
        path: '/quality/QualityStandard',
        name: 'QualityStandard',
        component: () => import('@/views/quality/QualityStandard.vue')
    },
    {
        path: '/quality/QualityList',
        name: 'QualityList',
        component: () => import('@/views/quality/QualityList.vue')
    },
    {
        path: '/quality/QualityResults',
        name: 'QualityResults',
        component: () => import('@/views/quality/QualityResults.vue')
    },
];
