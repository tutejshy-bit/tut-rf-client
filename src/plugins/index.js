/**
 * plugins/index.js
 *
 * Automatically included in `./src/main.js`
 */

// Plugins
import PrimeVue from 'primevue/config';
import Aura from '@/presets/aura';
import router from '../router'
import { createPinia } from 'pinia';
import ToastService from 'primevue/toastservice';

export function registerPlugins(app) {
  app
    .use(PrimeVue, { theme: Aura })
    .use(router)
    .use(createPinia())
    .use(ToastService);
}
