export default [
    {
        path: '/min/list',
        name: 'minList',
        component: () => import('@/views/min/MinList.vue')
    },
        {
        path: '/min/manage',
        name: 'minManage',
        component: () => import('@/views/min/MinManage.vue')
    },
];
