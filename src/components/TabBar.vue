<template>
  <view class="tab-bar">
    <view 
      v-for="item in tabs" 
      :key="item.path" 
      class="tab-item"
      :class="{ active: currentPath === item.path }"
      @click="navigate(item.path)"
    >
      <text class="tab-icon">{{ item.icon }}</text>
      <text class="tab-text">{{ item.text }}</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

const tabs = [
  { path: '/', icon: '🏠', text: '首页' },
  { path: '/favorites', icon: '🤍', text: '收藏' },
  { path: '/settings', icon: '⚙️', text: '设置' }
]

const currentPath = computed(() => route.path)

function navigate(path: string) {
  if (path !== currentPath.value) {
    router.push(path)
  }
}
</script>

<style lang="scss" scoped>
.tab-bar {
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
  padding-bottom: env(safe-area-inset-bottom);
}

.tab-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
  height: 100%;
  transition: all 0.2s;
}

.tab-icon {
  font-size: 22px;
  margin-bottom: 4px;
}

.tab-text {
  font-size: 10px;
  color: var(--text-muted);
}

.tab-item.active .tab-text {
  color: var(--primary-color);
}
</style>
