// Components
import App from './App.vue'

// Composables
import { createApp } from 'vue'

// Plugins
import { registerPlugins } from '@/plugins'
import EIcon from '@/components/EIcon.vue'
import 'primevue/resources/themes/aura-light-green/theme.css'
import './styles/style.css'
import Toast from 'primevue/toast';
import '@/utils/logger/logger'
import Tooltip from 'primevue/tooltip';
import StyleClass from 'primevue/styleclass';

const app = createApp(App)
app.component('e-icon', EIcon);
app.component('Toast', Toast);
app.directive('tooltip', Tooltip);
app.directive('styleclass', StyleClass);
registerPlugins(app)

app.mount('#app')
