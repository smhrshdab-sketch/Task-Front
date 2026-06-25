createApp(App).mount('#app')
import { createApp } from 'vue'
import App from './App.vue'
import './index.css'
// src/main.js
import router from './router'  // Add this line

const app = createApp(App)
app.use(router)  // Add this line
app.mount('#app')