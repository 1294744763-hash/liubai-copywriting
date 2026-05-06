import { createRouter, createWebHashHistory, RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/pages/Home.vue')
  },
  {
    path: '/scene/:sceneKey',
    name: 'SceneDetail',
    component: () => import('@/pages/SceneDetail.vue')
  },
  {
    path: '/image-match',
    name: 'ImageMatch',
    component: () => import('@/pages/ImageMatch.vue')
  },
  {
    path: '/rewrite',
    name: 'Rewrite',
    component: () => import('@/pages/Rewrite.vue')
  },
  {
    path: '/favorites',
    name: 'Favorites',
    component: () => import('@/pages/Favorites.vue')
  },
  {
    path: '/settings',
    name: 'Settings',
    component: () => import('@/pages/Settings.vue')
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router
