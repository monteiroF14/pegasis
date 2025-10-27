import { createWebHistory, createRouter } from 'vue-router'

import Test from './components/Test.vue'
import HelloWorld from './components/HelloWorld.vue'

const routes = [
  { path: '/', component: HelloWorld },
  { path: '/test', component: Test },
]

export const router = createRouter({
  history: createWebHistory(),
  routes,
})
