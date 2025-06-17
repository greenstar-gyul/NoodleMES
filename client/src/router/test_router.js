export default [
    {
        path: '/test/dbtest1',
        name: 'dbtest1',
        component: () => import('@/views/testpage/TestView.vue')
    },
    {
        path: '/test/dbtestJy',
        name: 'dbtestJy',
        component: () => import('@/views/testpage/TestViewJY.vue')
    },
    {
        path: '/test/mrptest1',
        name: 'mrptest1',
        component: () => import('@/views/testpage/MRPTestView.vue')
    },
    {
        path: '/test/dbtest2',
        name: 'dbtest2',
        component: () => import('@/views/testpage/TestView copy.vue')
    },
    {
        path: '/test/websocktest1',
        name: 'websocktest1',
        component: () => import('@/views/testpage/WebSocketTest.vue')
    }
];
