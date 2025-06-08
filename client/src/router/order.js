export default [
    {
        path: '/orderForm/management',
        name: 'orderManagement',
        component: () => import('@/views/order/Management.vue')
    },
    {
        path: '/orderForm/list',
        name: 'orderList',
        component: () => import('@/views/order/List.vue')
    },
];
