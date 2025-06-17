export default [
    {
        path: '/equipment/eqinfo',
        name: 'eqinfo',
        component: () => import('@/views/equipment/EqInfo.vue')
    },
    {
        // 🔥 eqii_code 파라미터 추가!
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
        path: '/equipment/eqiiresmg',
        name: 'eqiiresmg',
        component: () => import('@/views/equipment/EqInspecResultMgmt.vue')
    },
];