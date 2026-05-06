<template>
  <div class="rewrite-page">
    <nav class="nav-bar">
      <button class="nav-back" @click="goBack">←</button>
      <h1 class="nav-title">文案改写</h1>
      <div class="nav-placeholder"></div>
    </nav>

    <section class="input-section">
      <textarea 
        v-model="inputText" 
        class="input-textarea" 
        placeholder="输入需要改写的文字..."
        maxlength="500"
      ></textarea>
      <div class="input-footer">
        <span class="input-count">{{ inputText.length }}/500</span>
        <button 
          v-if="inputText.trim()" 
          class="clear-btn" 
          @click="clearInput"
        >清空</button>
      </div>
    </section>

    <section class="params-section">
      <div class="param-item">
        <h3 class="param-label">目标风格</h3>
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
        <h3 class="param-label">目标长度</h3>
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
      <div class="param-item">
        <h3 class="param-label">输出选项</h3>
        <div class="option-chips">
          <button 
            class="option-chip"
            :class="{ active: includeOriginal }"
            @click="includeOriginal = !includeOriginal"
          >
            {{ includeOriginal ? '✓' : '' }} 包含原文
          </button>
        </div>
      </div>
    </section>

    <button 
      class="rewrite-btn" 
      :class="{ loading: isLoading, disabled: !inputText.trim() }" 
      @click="rewrite"
    >
      <span v-if="isLoading" class="btn-spinner"></span>
      {{ isLoading ? '改写中...' : '一键改写' }}
    </button>

    <section v-if="results.length > 0" class="results-section">
      <div class="results-header">
        <h3 class="results-title">改写结果</h3>
        <button class="refresh-btn" @click="rewrite" :disabled="isLoading">🔄</button>
      </div>
      <div class="results-list">
        <div 
          v-for="(result, index) in displayResults" 
          :key="index" 
          class="result-card"
          :class="{ original: result.isOriginal }"
        >
          <span v-if="result.isOriginal" class="original-badge">原文</span>
          <span class="result-text">{{ result.text }}</span>
          <div class="result-actions">
            <button 
              class="action-btn" 
              :class="{ favorited: storage.isFavorited(result.text) }"
              @click="toggleFavorite(result.text)"
            >{{ storage.isFavorited(result.text) ? '❤' : '🤍' }}</button>
            <button class="action-btn" @click="copyText(result.text)">📋</button>
          </div>
        </div>
      </div>
    </section>

    <section class="tips-section">
      <h3 class="tips-title">💡 改写技巧</h3>
      <div class="tips-list">
        <p class="tip-item">• 简洁的句子更容易获得好效果</p>
        <p class="tip-item">• 包含场景关键词会更精准</p>
        <p class="tip-item">• 避免使用过于复杂的句式</p>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { styles, lengths } from '@/data/constants'
import aiService from '@/utils/aiService'
import storage from '@/utils/storage'

const router = useRouter()

const inputText = ref('')
const selectedStyle = ref('simple')
const selectedLength = ref('short')
const results = ref<string[]>([])
const isLoading = ref(false)
const includeOriginal = ref(true)

const prefs = storage.getPreferences()
selectedStyle.value = prefs.defaultStyle
selectedLength.value = prefs.defaultLength

const displayResults = computed(() => {
  const items: { text: string; isOriginal: boolean }[] = []
  
  if (includeOriginal.value && inputText.value.trim()) {
    items.push({ text: inputText.value.trim(), isOriginal: true })
  }
  
  results.value.forEach(text => {
    items.push({ text, isOriginal: false })
  })
  
  return items
})

async function rewrite() {
  if (!inputText.value.trim()) {
    showToast('请输入要改写的文字')
    return
  }

  isLoading.value = true
  try {
    const result = await aiService.rewriteText(
      inputText.value.trim(),
      selectedStyle.value,
      selectedLength.value
    )
    results.value = result.filter(r => r.trim() && !r.includes('保持原文') && !r.includes('改写失败'))
    if (results.value.length === 0) {
      results.value = generateFallbackResults(inputText.value.trim())
    }
    storage.updateStats('rewriteCount')
  } catch (error) {
    console.error('改写失败:', error)
    results.value = generateFallbackResults(inputText.value.trim())
    showToast('AI服务暂时不可用，显示推荐文案')
  } finally {
    isLoading.value = false
  }
}

function generateFallbackResults(original: string): string[] {
  const transformations = [
    `${original}，刚刚好`,
    `在${original}的日子里`,
    `${original}，是生活的礼物`,
    `关于${original}，有话说`,
    `${original}时，想起一些事`
  ]
  return transformations
}

function selectStyle(key: string) {
  selectedStyle.value = key
}

function selectLength(key: string) {
  selectedLength.value = key
}

function clearInput() {
  inputText.value = ''
  results.value = []
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
.rewrite-page {
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

.input-section {
  background: var(--card-color);
  border-radius: 10px;
  padding: 12px;
  margin: 12px 0;
}

.input-textarea {
  width: 100%;
  min-height: 100px;
  font-size: 15px;
  color: var(--text-color);
  line-height: 1.6;
  border: none;
  resize: none;
  outline: none;
  font-family: inherit;
  background: transparent;
}

.input-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 8px;
}

.input-count {
  font-size: 12px;
  color: var(--text-muted);
}

.clear-btn {
  font-size: 12px;
  color: var(--text-light);
  padding: 4px 8px;
  border: none;
  background: transparent;
  cursor: pointer;
}

.params-section {
  padding: 12px 0;
}

.param-item {
  margin-bottom: 16px;
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
  transition: all 0.2s;
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
  transition: all 0.2s;
}

.length-chip.active {
  background: rgba(139, 154, 143, 0.1);
  color: var(--primary-color);
  border-color: var(--primary-color);
}

.option-chips {
  display: flex;
  gap: 8px;
}

.option-chip {
  padding: 8px 14px;
  background: var(--card-color);
  border-radius: 16px;
  font-size: 12px;
  color: var(--text-light);
  border: 1px solid transparent;
  cursor: pointer;
  transition: all 0.2s;
}

.option-chip.active {
  background: rgba(139, 154, 143, 0.1);
  color: var(--primary-color);
  border-color: var(--primary-color);
}

.rewrite-btn {
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
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: opacity 0.2s;
}

.rewrite-btn.loading {
  opacity: 0.7;
}

.rewrite-btn.disabled {
  background: var(--border-color);
  cursor: not-allowed;
}

.btn-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: #FFFFFF;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.results-section {
  padding: 12px 0;
}

.results-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.results-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-color);
  margin: 0;
}

.refresh-btn {
  font-size: 14px;
  color: var(--text-light);
  border: none;
  background: transparent;
  cursor: pointer;
  padding: 4px 8px;
}

.refresh-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
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
  align-items: center;
  box-shadow: 0 1px 6px rgba(0, 0, 0, 0.04);
  position: relative;
}

.result-card.original {
  background: rgba(139, 154, 143, 0.06);
  border-left: 3px solid var(--primary-color);
}

.original-badge {
  font-size: 10px;
  color: var(--primary-color);
  background: rgba(139, 154, 143, 0.1);
  padding: 2px 6px;
  border-radius: 4px;
  margin-right: 10px;
}

.result-text {
  font-size: 15px;
  color: var(--text-color);
  flex: 1;
  padding-right: 10px;
  line-height: 1.5;
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

.tips-section {
  background: rgba(139, 154, 143, 0.06);
  border-radius: 8px;
  padding: 12px;
  margin-top: 20px;
}

.tips-title {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-color);
  margin-bottom: 8px;
}

.tips-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.tip-item {
  font-size: 12px;
  color: var(--text-light);
  line-height: 1.6;
  margin: 0;
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
