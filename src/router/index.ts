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
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/pages/Login.vue')
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('@/pages/Register.vue')
  },
  {
    path: '/profile',
    name: 'Profile',
    component: () => import('@/pages/Profile.vue')
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router
