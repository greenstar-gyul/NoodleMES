export default [
    {
        path: '/orderForm/management',
        name: 'orderManagement',
        component: () => import('@/views/order/order-form/OrderManage.vue')
    },
    {
        path: '/orderForm/list',
        name: 'orderList',
        component: () => import('@/views/order/order-form/OrderList.vue')
    },
    {
        path: '/releaseForm/management',
        name: 'releaseManagement',
        component: () => import('@/views/order/release-form/ReleaseManage.vue')
    },
    {
        path: '/releaseForm/list',
        name: 'releaseList',
        component: () => import('@/views/order/release-form/ReleaseList.vue')
    },
    {
        path: '/statistics/statis',
        name: 'statistics',
        component: () => import('@/views/order/statistics/Statistics.vue')
    },
];
