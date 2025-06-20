import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';

import { createPersistedState } from 'pinia-plugin-persistedstate';
import router from './router';
import mrpRouter from './router/mrp';
import prodRouter from './router/production';
import eqRouter from './router/equipment';
import mprRouter from './router/mpr';
import minRouter from './router/min';
import mpoRouter from './router/mpo';
import qcrRouter from './router/quality';
import stdRouter from './router/standard';
import ordRouter from './router/order';
import wkoRouter from './router/wko';
import Aura from '@primeuix/themes/aura';
import PrimeVue from 'primevue/config';
import ConfirmationService from 'primevue/confirmationservice';
import ToastService from 'primevue/toastservice';

import '@/assets/styles.scss';

const pinia = createPinia();
pinia.use(createPersistedState()) // localStorage 기본 사용
const app = createApp(App);

app.use(router);
app.use(mrpRouter);
app.use(prodRouter);
app.use(eqRouter);

/* 자재 시작 */
app.use(mprRouter);
app.use(minRouter);
app.use(mpoRouter);
/* 자재 끝 */

app.use(qcrRouter);
app.use(stdRouter);
app.use(ordRouter);
app.use(wkoRouter);

app.use(PrimeVue, {
    theme: {
        preset: Aura,
        options: {
            darkModeSelector: '.app-dark'
        }
    }
});
app.use(ToastService);
app.use(ConfirmationService);

app.use(pinia);
app.mount('#app');
