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
        meta: { icon: 'home', advanced: false },
        component: () => import('@/views/Home.vue'),
      },
      {
        path: 'record',
        name: 'Record',
        meta: { icon: 'record', advanced: false },
        component: () => import('@/views/PageRecord.vue'),
      },
      {
        path: 'transmit',
        name: 'Transmit',
        meta: { icon: 'radio-tower', advanced: false },
        component: () => import('@/views/PageTransmit.vue'),
      },
      {
        path: 'files',
        name: 'Files',
        meta: { icon: 'folder-multiple-outline', advanced: false },
        component: () => import('@/views/PageFiles.vue'),
      },
      {
        path: 'editor',
        name: 'Editor',
        meta: { icon: 'application-edit-outline', advanced: false },
        component: () => import('@/views/PageEditor.vue'),
      },
    ],
  },
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
})

export default router
