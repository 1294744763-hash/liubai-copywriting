<template>
  <div class="app-container">
    <router-view></router-view>
    <nav class="bottom-nav" v-if="showNav">
      <button 
        v-for="item in navItems" 
        :key="item.path" 
        class="nav-item"
        :class="{ active: currentPath === item.path }"
        @click="navigateTo(item.path)"
      >
        <span class="nav-icon">{{ item.icon }}</span>
        <span class="nav-text">{{ item.text }}</span>
      </button>
    </nav>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import storage from '@/utils/storage'

const route = useRoute()
const router = useRouter()
const currentPath = ref('/')

const navItems = computed(() => {
  const baseItems = [
    { path: '/', icon: '🏠', text: '首页' },
    { path: '/favorites', icon: '🤍', text: '收藏' }
  ]
  
  if (storage.isLoggedIn()) {
    baseItems.push({ path: '/profile', icon: '👤', text: '我的' })
  } else {
    baseItems.push({ path: '/login', icon: '🔑', text: '登录' })
  }
  
  return baseItems
})

const showNav = computed(() => {
  const noNavPaths = ['/image-match', '/rewrite', '/login', '/register']
  return !noNavPaths.includes(currentPath.value)
})

onMounted(() => {
  currentPath.value = route.path
})

watch(() => route.path, (newPath) => {
  currentPath.value = newPath
}, { immediate: true })

function navigateTo(path: string) {
  if (currentPath.value !== path) {
    router.push(path)
  }
}
</script>

<style lang="scss" scoped>
.app-container {
  min-height: 100vh;
  background-color: var(--background-color);
  padding-bottom: 60px;
}

.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 60px;
  background: var(--card-color);
  display: flex;
  justify-content: space-around;
  align-items: center;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.05);
  z-index: 100;
}

.nav-item {
  flex: 1;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  border: none;
  background: transparent;
  cursor: pointer;
  transition: all 0.2s;
}

.nav-icon {
  font-size: 22px;
  margin-bottom: 4px;
}

.nav-text {
  font-size: 10px;
  color: var(--text-muted);
}

.nav-item.active .nav-text {
  color: var(--primary-color);
}
</style>
