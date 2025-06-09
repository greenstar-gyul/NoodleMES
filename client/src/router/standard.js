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
];
