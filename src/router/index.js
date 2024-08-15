// Composables
import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    component: () => import('@/layouts/main/Main.vue'),
    children: [
      {
        path: 'home',
        name: 'Home',
        meta: { icon: 'home' },
        component: () => import('@/views/Home.vue'),
      },
      {
        path: 'record',
        name: 'Record',
        meta: { icon: 'record' },
        component: () => import('@/views/PageRecord.vue'),
      },
      {
        path: 'transmit',
        name: 'Transmit',
        meta: { icon: 'radio-tower' },
        component: () => import('@/views/PageTransmit.vue'),
      },
      {
        path: 'files',
        name: 'Files',
        meta: { icon: 'folder-multiple-outline' },
        component: () => import('@/views/PageFiles.vue'),
      },
    ],
  },
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
})

export default router
