<template>
  <div class="scene-detail-page">
    <nav class="nav-bar">
      <button class="nav-back" @click="goBack">←</button>
      <h1 class="nav-title">{{ currentScene?.name || '文案' }}</h1>
      <div class="nav-placeholder"></div>
    </nav>

    <section class="params-section">
      <div class="param-row">
        <h3 class="param-label">风格</h3>
        <div class="param-chips">
          <button 
            v-for="style in styles" 
            :key="style.key" 
            class="param-chip"
            :class="{ active: selectedStyle === style.key }"
            @click="selectStyle(style.key)"
          >
            {{ style.name }}
          </button>
        </div>
      </div>
      <div class="param-row">
        <h3 class="param-label">长度</h3>
        <div class="length-chips">
          <button 
            v-for="len in lengths" 
            :key="len.key" 
            class="length-chip"
            :class="{ active: selectedLength === len.key }"
            @click="selectLength(len.key)"
          >
            {{ len.name }}
          </button>
        </div>
      </div>
    </section>

    <button 
      class="generate-btn" 
      :class="{ loading: isLoading }" 
      @click="generate"
    >
      {{ isLoading ? '生成中...' : '生成文案' }}
    </button>

    <section v-if="copywritings.length > 0" class="copywriting-list">
      <div 
        v-for="(item, index) in copywritings" 
        :key="index" 
        class="copywriting-card"
      >
        <span class="copywriting-text">{{ item }}</span>
        <div class="card-actions">
          <button 
            class="action-btn" 
            :class="{ favorited: storage.isFavorited(item) }"
            @click="toggleFavorite(item)"
          >{{ storage.isFavorited(item) ? '❤' : '🤍' }}</button>
          <button class="action-btn" @click="copyText(item)">📋</button>
        </div>
      </div>
    </section>

    <div v-else-if="!isLoading" class="empty-state">
      <span class="empty-icon">📝</span>
      <p class="empty-text">点击上方按钮生成文案</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { scenes, styles, lengths } from '@/data/constants'
import aiService from '@/utils/aiService'
import storage from '@/utils/storage'

const route = useRoute()
const router = useRouter()
const selectedStyle = ref('simple')
const selectedLength = ref('short')
const copywritings = ref<string[]>([])
const isLoading = ref(false)
const currentScene = ref<{ key: string; name: string; icon: string; description: string } | null>(null)

onMounted(() => {
  const sceneKey = route.params.sceneKey as string || 'daily'
  const foundScene = scenes.find((s: { key: string }) => s.key === sceneKey)
    currentScene.value = foundScene || null
  
  const prefs = storage.getPreferences()
  selectedStyle.value = prefs.defaultStyle
  selectedLength.value = prefs.defaultLength
  
  if (currentScene.value) {
    generate()
  }
})

async function generate() {
  if (!currentScene.value) return
  
  isLoading.value = true
  try {
    const result = await aiService.generateCopywriting(
      currentScene.value.key,
      selectedStyle.value,
      selectedLength.value,
      5
    )
    copywritings.value = result
    storage.updateStats('generateCount')
  } catch (error) {
    showToast('生成失败')
  } finally {
    isLoading.value = false
  }
}

function selectStyle(key: string) {
  selectedStyle.value = key
}

function selectLength(key: string) {
  selectedLength.value = key
}

function copyText(text: string) {
  navigator.clipboard.writeText(text).then(() => {
    storage.updateStats('copyCount')
    showToast('已复制')
  })
}

function toggleFavorite(text: string) {
  if (storage.isFavorited(text)) {
    storage.removeFavorite(text)
    showToast('已取消收藏')
  } else {
    storage.addFavorite(text)
    storage.updateStats('favoriteCount')
    showToast('已收藏')
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

function goBack() {
  router.push('/')
}
</script>

<style lang="scss" scoped>
.scene-detail-page {
  padding: 16px;
  padding-top: 20px;
}

.nav-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 0;
}

.nav-back {
  font-size: 20px;
  color: var(--text-color);
  padding: 4px 8px;
  border: none;
  background: transparent;
  cursor: pointer;
}

.nav-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-color);
  margin: 0;
}

.nav-placeholder {
  width: 30px;
}

.params-section {
  padding: 12px 0;
}

.param-row {
  margin-bottom: 10px;
}

.param-label {
  font-size: 13px;
  color: var(--text-light);
  margin-bottom: 8px;
}

.param-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.param-chip {
  padding: 8px 14px;
  background: var(--card-color);
  border-radius: 16px;
  font-size: 12px;
  color: var(--text-light);
  border: 1px solid transparent;
  cursor: pointer;
}

.param-chip.active {
  background: rgba(139, 154, 143, 0.1);
  color: var(--primary-color);
  border-color: var(--primary-color);
}

.length-chips {
  display: flex;
  gap: 10px;
}

.length-chip {
  flex: 1;
  padding: 10px 0;
  background: var(--card-color);
  border-radius: 8px;
  font-size: 13px;
  color: var(--text-light);
  text-align: center;
  border: 1px solid transparent;
  cursor: pointer;
}

.length-chip.active {
  background: rgba(139, 154, 143, 0.1);
  color: var(--primary-color);
  border-color: var(--primary-color);
}

.generate-btn {
  background: linear-gradient(135deg, var(--primary-color), var(--primary-light));
  color: #FFFFFF;
  border-radius: 20px;
  padding: 14px 0;
  font-size: 15px;
  font-weight: 500;
  text-align: center;
  margin: 10px 0;
  border: none;
  cursor: pointer;
  width: 100%;
}

.generate-btn.loading {
  opacity: 0.7;
}

.copywriting-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 10px 0;
}

.copywriting-card {
  background: var(--card-color);
  border-radius: 10px;
  padding: 14px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 1px 6px rgba(0, 0, 0, 0.04);
}

.copywriting-text {
  font-size: 15px;
  color: var(--text-color);
  flex: 1;
  padding-right: 10px;
  line-height: 1.6;
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

.action-btn.favorited {
  color: var(--error-color);
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 50px 0;
}

.empty-icon {
  font-size: 40px;
  margin-bottom: 12px;
}

.empty-text {
  font-size: 14px;
  color: var(--text-muted);
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
