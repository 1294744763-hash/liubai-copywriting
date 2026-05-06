<template>
  <div class="home-page">
    <header class="header">
      <h1 class="logo">留白</h1>
      <p class="slogan">少一点堆砌，多一些留白</p>
    </header>

    <section class="upload-card" @click="goToImageMatch">
      <div class="upload-icon-wrapper">
        <span class="upload-icon">📸</span>
      </div>
      <h3 class="upload-title">上传图片 · AI匹配文案</h3>
      <p class="upload-desc">智能分析场景，生成专属文案</p>
    </section>

    <section class="scene-section">
      <h2 class="section-title">场景</h2>
      <div class="scene-grid">
        <button 
          v-for="scene in scenes" 
          :key="scene.key" 
          class="scene-card"
          @click="goToScene(scene.key)"
        >
          <span class="scene-icon">{{ scene.icon }}</span>
          <span class="scene-name">{{ scene.name }}</span>
        </button>
      </div>
    </section>

    <section class="style-section">
      <h2 class="section-title">风格</h2>
      <div class="style-chips">
        <button 
          v-for="style in styles" 
          :key="style.key" 
          class="style-chip"
          :class="{ active: selectedStyle === style.key }"
          @click="selectStyle(style.key)"
        >
          {{ style.name }}
        </button>
      </div>
    </section>

    <section class="length-section">
      <h2 class="section-title">长度</h2>
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
    </section>

    <section class="inspiration-section">
      <div class="section-header">
        <h2 class="section-title">灵感文案池</h2>
        <button class="refresh-btn" @click="refreshInspirations">🔄</button>
      </div>
      <div class="inspiration-list">
        <div 
          v-for="(item, index) in inspirations" 
          :key="index" 
          class="inspiration-item"
          @click="copyText(item)"
        >
          <span class="inspiration-text">{{ item }}</span>
          <div class="item-actions">
            <button 
              class="action-btn" 
              :class="{ favorited: storage.isFavorited(item) }"
              @click.stop="toggleFavorite(item)"
            >{{ storage.isFavorited(item) ? '❤' : '🤍' }}</button>
            <button class="action-btn" @click.stop="copyText(item)">📋</button>
          </div>
        </div>
      </div>
    </section>

    <section class="rewrite-section">
      <div class="rewrite-card" @click="goToRewrite">
        <span class="rewrite-icon">✏️</span>
        <div class="rewrite-content">
          <h3 class="rewrite-title">文案改写</h3>
          <p class="rewrite-desc">普通文字一键高级改写</p>
        </div>
        <span class="rewrite-arrow">→</span>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { scenes, styles, lengths, placeholderCopywritings } from '@/data/constants'
import aiService from '@/utils/aiService'
import storage from '@/utils/storage'

const router = useRouter()

const selectedStyle = ref('simple')
const selectedLength = ref('short')
const inspirations = ref<string[]>([])

onMounted(() => {
  const prefs = storage.getPreferences()
  selectedStyle.value = prefs.defaultStyle
  selectedLength.value = prefs.defaultLength
  refreshInspirations()
})

async function refreshInspirations() {
  try {
    const result = await aiService.generateCopywriting(
      'daily',
      selectedStyle.value,
      selectedLength.value,
      5
    )
    inspirations.value = result
  } catch (error) {
    inspirations.value = placeholderCopywritings
  }
}

function selectStyle(key: string) {
  selectedStyle.value = key
  storage.savePreferences({
    ...storage.getPreferences(),
    defaultStyle: key
  })
  refreshInspirations()
}

function selectLength(key: string) {
  selectedLength.value = key
  storage.savePreferences({
    ...storage.getPreferences(),
    defaultLength: key
  })
  refreshInspirations()
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

function goToImageMatch() {
  router.push('/image-match')
}

function goToScene(sceneKey: string) {
  router.push(`/scene/${sceneKey}`)
}

function goToRewrite() {
  router.push('/rewrite')
}
</script>

<style lang="scss" scoped>
.home-page {
  padding: 20px;
  padding-top: 40px;
}

.header {
  text-align: center;
  padding: 20px 0 30px;
}

.logo {
  font-size: 36px;
  font-weight: 800;
  color: var(--primary-color);
  letter-spacing: 4px;
  margin: 0;
}

.slogan {
  font-size: 13px;
  color: var(--text-light);
  margin-top: 8px;
  letter-spacing: 1px;
}

.upload-card {
  background: linear-gradient(135deg, var(--primary-color), var(--primary-light));
  border-radius: 14px;
  padding: 24px 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 20px;
  box-shadow: 0 6px 20px rgba(139, 154, 143, 0.3);
  cursor: pointer;
}

.upload-icon-wrapper {
  width: 50px;
  height: 50px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 12px;
}

.upload-icon {
  font-size: 24px;
}

.upload-title {
  font-size: 16px;
  font-weight: 600;
  color: #FFFFFF;
  margin: 0 0 4px;
}

.upload-desc {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.8);
  margin: 0;
}

.scene-section,
.style-section,
.length-section,
.inspiration-section,
.rewrite-section {
  margin-bottom: 20px;
}

.section-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-color);
  margin-bottom: 10px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.refresh-btn {
  font-size: 14px;
  color: var(--text-light);
  border: none;
  background: transparent;
  cursor: pointer;
  padding: 4px 8px;
}

.scene-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
}

.scene-card {
  background: var(--card-color);
  border-radius: 10px;
  padding: 14px 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-shadow: 0 1px 6px rgba(0, 0, 0, 0.04);
  border: none;
  cursor: pointer;
  transition: transform 0.2s;
}

.scene-card:active {
  transform: scale(0.95);
}

.scene-icon {
  font-size: 20px;
  margin-bottom: 6px;
}

.scene-name {
  font-size: 11px;
  color: var(--text-color);
  text-align: center;
}

.style-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.style-chip {
  padding: 8px 14px;
  background: var(--card-color);
  border-radius: 16px;
  font-size: 12px;
  color: var(--text-light);
  border: 1px solid transparent;
  cursor: pointer;
  transition: all 0.2s;
}

.style-chip.active {
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
  transition: all 0.2s;
}

.length-chip.active {
  background: rgba(139, 154, 143, 0.1);
  color: var(--primary-color);
  border-color: var(--primary-color);
}

.inspiration-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.inspiration-item {
  background: var(--card-color);
  border-radius: 8px;
  padding: 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 1px 6px rgba(0, 0, 0, 0.04);
  cursor: pointer;
}

.inspiration-text {
  font-size: 14px;
  color: var(--text-color);
  flex: 1;
  padding-right: 10px;
}

.item-actions {
  display: flex;
  gap: 10px;
}

.action-btn {
  font-size: 16px;
  padding: 4px;
  border: none;
  background: transparent;
  cursor: pointer;
}

.action-btn.favorited {
  color: var(--error-color);
}

.rewrite-card {
  background: var(--card-color);
  border-radius: 10px;
  padding: 16px;
  display: flex;
  align-items: center;
  box-shadow: 0 1px 6px rgba(0, 0, 0, 0.04);
  cursor: pointer;
}

.rewrite-icon {
  font-size: 20px;
  margin-right: 12px;
}

.rewrite-content {
  flex: 1;
}

.rewrite-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-color);
  margin: 0;
}

.rewrite-desc {
  font-size: 12px;
  color: var(--text-light);
  margin: 2px 0 0;
}

.rewrite-arrow {
  font-size: 16px;
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
  animation: fadeIn 0.2s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateX(-50%) translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }
}
</style>
