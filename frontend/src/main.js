import { createApp } from 'vue'
import App from './App.vue'
import router from './router/index.js'
import './style.css'
import PrimeVue from 'primevue/config'
import ToastService from 'primevue/toastservice'
import Toast from 'primevue/toast'


const app = createApp(App)
app.use(PrimeVue)
app.use(ToastService)
app.component('Toast', Toast)
app.use(router)
app.mount('#app')
