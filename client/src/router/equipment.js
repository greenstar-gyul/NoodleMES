export default [
    {
        path: '/equipment/eqinfo',
        name: 'eqinfo',
        component: () => import('@/views/equipment/EqInfo.vue')
    },
    {
        path: '/equipment/eqiilist',
        name: 'eqiilist',
        component: () => import('@/views/equipment/EqInspecList.vue')
    },
];
