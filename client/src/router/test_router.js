export default [
    {
        path: '/test/dbtest1',
        name: 'dbtest1',
        component: () => import('@/views/dbtest/TestView.vue')
    },



    {
        path: '/test/dbtestJy',
        name: 'dbtestJy',
        component: () => import('@/views/dbtest/TestViewJY.vue')
    },
];
