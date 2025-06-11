export default [
    {
        path: '/test/dbtest1',
        name: 'dbtest1',
        component: () => import('@/views/dbtest/TestView.vue')
    },
    {
        path: '/test/dbtest2',
        name: 'dbtest2',
        component: () => import('@/views/dbtest/TestView copy.vue')
    },
];
