export default [
    {
        path: '/standard/bom',
        name: 'stdBom',
        component: () => import('@/views/standard/bom.vue')
    },
    {
        path: '/standard/eqspectype',
        name: 'stdEqspectype',
        component: () => import('@/views/standard/EquipInspectionType.vue')
    },
    {
        path: '/standard/line',
        name: 'stdLine',
        component: () => import('@/views/standard/Line.vue')
    },
    {
        path: '/standard/proc',
        name: 'stdProc',
        component: () => import('@/views/standard/process.vue')
    },
];
