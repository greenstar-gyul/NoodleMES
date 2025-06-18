export default [
    {
        path: '/equipment/eqinfo',
        name: 'eqinfo',
        component: () => import('@/views/equipment/EqInfo.vue')
    },
    {
        path: '/equipment/eqiilist/:eqiiCode?',
        name: 'eqiilist',
        component: () => import('@/views/equipment/EqInspecList.vue')
    },
    {
        path: '/equipment/iilist',
        name: 'iilist',
        component: () => import('@/views/equipment/EqIIList.vue')
    },
    {
        path: '/equipment/eqiires',
        name: 'eqiires',
        component: () => import('@/views/equipment/EqIIResultList.vue')
    },
    {
        path: '/equipment/eqiiresmg/:eq_ma_code?',
        name: 'eqiiresmg',
        component: () => import('@/views/equipment/EqInspecResultMgmt.vue')
    },
    {
        path: '/equipment/eqiiresmglist',
        name: 'eqiiresmglist',
        component: () => import('@/views/equipment/EqIRMgList.vue')
    }
];