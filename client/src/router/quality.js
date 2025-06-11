export default [
    {
        path: '/quality/qualityInspection/QualityStandard',
        name: '품질기준정보',
        component: () => import('../views/quality/qualityInspection/QualityStandard.vue')
    },
    {
        path: '/quality/qualityInspection/QualityList',
        name: '품질검사목록',
        component: () => import('../views/quality/qualityInspection/QualityList.vue')
    },
    {
        path: '/quality/qualityInspection/QualityManage',
        name: '품질검사관리',
        component: () => import('../views/quality/qualityInspection/QualityManage.vue')
    },
    {
        path: '/quality/qualityResults/QualityResults',
        name: '품질검사결과',
        component: () => import('@/views/quality/qualityResults/QualityResults.vue')
    },
    {
        path: '/quality/qualityResults/QualityRList',
        name: '품질결과목록',
        component: () => import('@/views/quality/qualityResults/QualityRList.vue')
    },
    {
        path: '/quality/quality_end/QualityAS',
        name: '품질후속조치',
        component: () => import('@/views/quality/quality_end/QualityAS.vue')
    },
    {
        path: '/quality/quality_end/QualitySD',
        name: '품질통계',
        component: () => import('@/views/quality/quality_end/QualitySD.vue')
    },
];
