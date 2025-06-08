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
                    path: '/mrp/manage',
                    name: 'mrpManage',
                    component: () => import('@/views/mrp/MRPManage.vue')
                },
            ]
        },
    ]
});

export default router;
