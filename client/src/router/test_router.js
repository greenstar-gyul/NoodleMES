export default [
    {
        path: '/test/dbtest1',
        name: 'dbtest1',
        component: () => import('@/views/dbtest/TestView.vue')
    },
    {
        path: '/test/mrptest1',
        name: 'mrptest1',
        component: () => import('@/views/dbtest/MRPTestView.vue')
    },
    {
        path: '/test/dbtest2',
        name: 'dbtest2',
        component: () => import('@/views/dbtest/TestView copy.vue')
    },
];
