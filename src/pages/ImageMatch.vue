<template>
  <div class="image-match-page">
    <nav class="nav-bar">
      <button class="nav-back" @click="goBack">←</button>
      <h1 class="nav-title">图片匹配文案</h1>
      <div class="nav-placeholder"></div>
    </nav>

    <section class="upload-area" @click="uploadImage">
      <div v-if="!imagePath" class="upload-placeholder">
        <span class="upload-icon">📷</span>
        <p class="upload-hint">点击上传图片</p>
        <p class="upload-tip">支持JPG、PNG格式</p>
      </div>
      <img v-else :src="imagePath" class="uploaded-image" />
    </section>

    <section class="params-section">
      <div class="param-item">
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
      <div class="param-item">
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
      :class="{ loading: isLoading, disabled: !imagePath }" 
      @click="generate"
    >
      {{ isLoading ? 'AI分析中...' : '生成文案' }}
    </button>

    <section v-if="results.length > 0" class="results-section">
      <h3 class="results-title">为你匹配的文案</h3>
      <div class="results-list">
        <div 
          v-for="(result, index) in results" 
          :key="index" 
          class="result-card"
        >
          <span class="result-text">{{ result }}</span>
          <div class="result-actions">
            <button 
              class="action-btn" 
              :class="{ favorited: storage.isFavorited(result) }"
              @click="toggleFavorite(result)"
            >{{ storage.isFavorited(result) ? '❤' : '🤍' }}</button>
            <button class="action-btn" @click="copyText(result)">📋</button>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { styles, lengths } from '@/data/constants'
import aiService from '@/utils/aiService'
import storage from '@/utils/storage'

const selectedStyle = ref('simple')
const selectedLength = ref('short')
const imagePath = ref('')
const results = ref<string[]>([])
const isLoading = ref(false)

const prefs = storage.getPreferences()
selectedStyle.value = prefs.defaultStyle
selectedLength.value = prefs.defaultLength

function uploadImage() {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = 'image/jpeg,image/png'
  input.onchange = (e) => {
    const file = (e.target as HTMLInputElement).files?.[0]
    if (file) {
      imagePath.value = URL.createObjectURL(file)
      results.value = []
    }
  }
  input.click()
}

async function generate() {
  if (!imagePath.value) {
    showToast('请先上传图片')
    return
  }

  isLoading.value = true
  try {
    const scene = await analyzeImage(imagePath.value)
    const result = await aiService.generateCopywriting(
      scene,
      selectedStyle.value,
      selectedLength.value,
      5
    )
    results.value = result
    storage.updateStats('generateCount')
  } catch (error) {
    showToast('生成失败')
  } finally {
    isLoading.value = false
  }
}

async function analyzeImage(path: string): Promise<string> {
  const scenes = ['daily', 'travel', 'night', 'food', 'alone']
  return scenes[Math.floor(Math.random() * scenes.length)]
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
  window.location.hash = '/'
}
</script>

<style lang="scss" scoped>
.image-match-page {
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

.upload-area {
  width: 100%;
  height: 200px;
  background: var(--card-color);
  border-radius: 12px;
  border: 2px dashed var(--border-color);
  margin: 12px 0;
  overflow: hidden;
  cursor: pointer;
}

.upload-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.upload-icon {
  font-size: 40px;
  margin-bottom: 10px;
}

.upload-hint {
  font-size: 15px;
  color: var(--text-color);
  margin: 0 0 4px;
}

.upload-tip {
  font-size: 12px;
  color: var(--text-muted);
  margin: 0;
}

.uploaded-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.params-section {
  padding: 12px 0;
}

.param-item {
  margin-bottom: 12px;
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

.generate-btn.disabled {
  background: var(--border-color);
}

.results-section {
  padding: 12px 0;
}

.results-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-color);
  margin-bottom: 10px;
}

.results-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.result-card {
  background: var(--card-color);
  border-radius: 10px;
  padding: 14px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 1px 6px rgba(0, 0, 0, 0.04);
}

.result-text {
  font-size: 15px;
  color: var(--text-color);
  flex: 1;
  padding-right: 10px;
}

.result-actions {
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
