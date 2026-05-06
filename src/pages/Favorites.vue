<template>
  <div class="favorites-page">
    <header class="header">
      <h1 class="page-title">我的收藏</h1>
      <button 
        v-if="favorites.length > 0" 
        class="clear-btn" 
        @click="clearAll"
      >清空</button>
    </header>

    <section v-if="favorites.length > 0" class="favorites-list">
      <div 
        v-for="(item, index) in favorites" 
        :key="index" 
        class="favorite-card"
      >
        <span class="favorite-text">{{ item }}</span>
        <div class="card-actions">
          <button class="action-btn" @click="copyText(item)">📋</button>
          <button class="action-btn delete-btn" @click="remove(item)">🗑️</button>
        </div>
      </div>
    </section>

    <div v-else class="empty-state">
      <span class="empty-icon">🤍</span>
      <h2 class="empty-title">暂无收藏</h2>
      <p class="empty-desc">收藏喜欢的文案，方便随时查看</p>
      <button class="empty-action" @click="goToHome">
        <span class="action-text">去发现文案</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import storage from '@/utils/storage'

const router = useRouter()
const favorites = ref<string[]>([])

onMounted(() => {
  loadFavorites()
})

function loadFavorites() {
  favorites.value = storage.getFavorites()
}

function copyText(text: string) {
  navigator.clipboard.writeText(text).then(() => {
    storage.updateStats('copyCount')
    showToast('已复制')
  })
}

function remove(text: string) {
  if (confirm('确定要删除这条收藏吗？')) {
    storage.removeFavorite(text)
    loadFavorites()
    showToast('已删除')
  }
}

function clearAll() {
  if (confirm('确定要清空所有收藏吗？')) {
    favorites.value.forEach(item => storage.removeFavorite(item))
    loadFavorites()
    showToast('已清空')
  }
}

function showToast(message: string) {
  const toast = document.createElement('div')
  toast.className = 'toast'
  toast.textContent = message
  document.body.appendChild(toast)
  setTimeout(() => {
    toast.remove()
  }, 2000)
}

function goToHome() {
  router.push('/')
}
</script>

<style lang="scss" scoped>
.favorites-page {
  padding: 16px;
  padding-top: 40px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  margin-bottom: 10px;
}

.page-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-color);
  margin: 0;
}

.clear-btn {
  font-size: 13px;
  color: var(--text-light);
  border: none;
  background: transparent;
  cursor: pointer;
  padding: 4px 8px;
}

.favorites-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.favorite-card {
  background: var(--card-color);
  border-radius: 8px;
  padding: 14px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 1px 6px rgba(0, 0, 0, 0.04);
}

.favorite-text {
  font-size: 15px;
  color: var(--text-color);
  flex: 1;
  padding-right: 10px;
}

.card-actions {
  display: flex;
  gap: 12px;
}

.action-btn {
  font-size: 18px;
  padding: 4px;
  border: none;
  background: transparent;
  cursor: pointer;
}

.delete-btn {
  opacity: 0.6;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 0;
}

.empty-icon {
  font-size: 50px;
  margin-bottom: 16px;
}

.empty-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-color);
  margin: 0 0 6px;
}

.empty-desc {
  font-size: 13px;
  color: var(--text-light);
  margin: 0 0 20px;
}

.empty-action {
  background: rgba(139, 154, 143, 0.1);
  border-radius: 20px;
  padding: 12px 24px;
  border: none;
  cursor: pointer;
}

.action-text {
  font-size: 14px;
  color: var(--primary-color);
  font-weight: 500;
}

.toast {
  position: fixed;
  bottom: 80px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.7);
  color: #FFFFFF;
  padding: 10px 20px;
  border-radius: 20px;
  font-size: 13px;
  z-index: 1000;
}
</style>
