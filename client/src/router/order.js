export default [
    {
        path: '/orderForm/management',
        name: 'orderManagement',
        component: () => import('@/views/order/order-form/Management.vue')
    },
    {
        path: '/orderForm/list',
        name: 'orderList',
        component: () => import('@/views/order/order-form/List.vue')
    },
    {
        path: '/releaseForm/management',
        name: 'releaseManagement',
        component: () => import('@/views/order/release-form/Management.vue')
    },
    {
        path: '/releaseForm/list',
        name: 'releaseList',
        component: () => import('@/views/order/release-form/List.vue')
    },
    {
        path: '/statistics/statis',
        name: 'statistics',
        component: () => import('@/views/order/statistics/Statistics.vue')
    },
];
