import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import mrpRouter from './router/mrp';
import prodRouter from './router/production';
import eqRouter from './router/equipment';
import matRouter from './router/materials';
import qaRouter from './router/quality';
import stdRouter from './router/standard';
import ordRouter from './router/order';

import Aura from '@primeuix/themes/aura';
import PrimeVue from 'primevue/config';
import ConfirmationService from 'primevue/confirmationservice';
import ToastService from 'primevue/toastservice';

import '@/assets/styles.scss';

const app = createApp(App);

app.use(router);
app.use(mrpRouter);
app.use(prodRouter);
app.use(eqRouter);
app.use(matRouter);
app.use(qaRouter);
app.use(stdRouter);
app.use(ordRouter);

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

app.mount('#app');
