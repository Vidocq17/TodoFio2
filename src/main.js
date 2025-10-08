import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import './assets/main.css'

import 'vue3-toastify/dist/index.css'
import Vue3Toastify from 'vue3-toastify'

const app = createApp(App)

app.use(Vue3Toastify, {
  autoClose: 3000,
  position: 'top-right',
  theme: 'light',
})

app.use(createPinia())
app.mount('#app')
