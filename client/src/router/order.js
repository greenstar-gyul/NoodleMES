import AppLayout from '@/layout/AppLayout.vue';
import { createRouter, createWebHistory } from 'vue-router';

const router = createRouter({
    history: createWebHistory(),
    routes: [
        {
            path: '/',
            component: AppLayout,
            children: [
                {
                    path: '/productions/product',
                    name: 'productions',
                    component: () => import('@/views/order/production/production.vue')
                },
            ]
        },
    ]
});

export default router;
