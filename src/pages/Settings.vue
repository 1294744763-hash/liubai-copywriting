<template>
  <div class="settings-page">
    <header class="header">
      <h1 class="page-title">设置</h1>
    </header>

    <section class="stats-card">
      <div class="stats-grid">
        <div class="stat-item">
          <span class="stat-value">{{ stats.generateCount }}</span>
          <span class="stat-label">生成次数</span>
        </div>
        <div class="stat-item">
          <span class="stat-value">{{ stats.favoriteCount }}</span>
          <span class="stat-label">收藏数量</span>
        </div>
        <div class="stat-item">
          <span class="stat-value">{{ stats.copyCount }}</span>
          <span class="stat-label">复制次数</span>
        </div>
        <div class="stat-item">
          <span class="stat-value">{{ stats.rewriteCount }}</span>
          <span class="stat-label">改写次数</span>
        </div>
      </div>
    </section>

    <section class="settings-list">
      <button class="settings-item" @click="showStyleSelector">
        <span class="item-icon">🎨</span>
        <div class="item-content">
          <span class="item-title">默认风格</span>
          <span class="item-desc">{{ currentStyleName }}</span>
        </div>
        <span class="item-arrow">→</span>
      </button>

      <button class="settings-item" @click="showLengthSelector">
        <span class="item-icon">📏</span>
        <div class="item-content">
          <span class="item-title">默认长度</span>
          <span class="item-desc">{{ currentLengthName }}</span>
        </div>
        <span class="item-arrow">→</span>
      </button>

      <div class="settings-item">
        <span class="item-icon">📝</span>
        <div class="item-content">
          <span class="item-title">自动复制</span>
        </div>
        <label class="switch">
          <input 
            type="checkbox" 
            :checked="preferences.autoCopy" 
            @change="toggleAutoCopy"
          />
          <span class="slider"></span>
        </label>
      </div>

      <div class="settings-item">
        <span class="item-icon">🌙</span>
        <div class="item-content">
          <span class="item-title">深色模式</span>
        </div>
        <label class="switch">
          <input 
            type="checkbox" 
            :checked="preferences.theme === 'dark'" 
            @change="toggleTheme"
          />
          <span class="slider"></span>
        </label>
      </div>
    </section>

    <section class="about-section">
      <button class="settings-item" @click="showAbout">
        <span class="item-icon">ℹ️</span>
        <div class="item-content">
          <span class="item-title">关于我们</span>
          <span class="item-desc">版本 1.0.0</span>
        </div>
        <span class="item-arrow">→</span>
      </button>

      <button class="settings-item" @click="showFeedback">
        <span class="item-icon">💬</span>
        <div class="item-content">
          <span class="item-title">意见反馈</span>
        </div>
        <span class="item-arrow">→</span>
      </button>
    </section>

    <div v-if="showStyleModal" class="modal-mask" @click="closeStyleModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3 class="modal-title">选择默认风格</h3>
          <button class="modal-close" @click="closeStyleModal">✕</button>
        </div>
        <div class="modal-body">
          <button 
            v-for="style in styles" 
            :key="style.key" 
            class="modal-option"
            :class="{ active: preferences.defaultStyle === style.key }"
            @click="selectDefaultStyle(style.key)"
          >
            <span class="option-name">{{ style.name }}</span>
            <span class="option-desc">{{ style.description }}</span>
          </button>
        </div>
      </div>
    </div>

    <div v-if="showLengthModal" class="modal-mask" @click="closeLengthModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3 class="modal-title">选择默认长度</h3>
          <button class="modal-close" @click="closeLengthModal">✕</button>
        </div>
        <div class="modal-body">
          <button 
            v-for="len in lengths" 
            :key="len.key" 
            class="modal-option"
            :class="{ active: preferences.defaultLength === len.key }"
            @click="selectDefaultLength(len.key)"
          >
            <span class="option-name">{{ len.name }}</span>
            <span class="option-desc">{{ len.description }}</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { styles, lengths } from '@/data/constants'
import storage from '@/utils/storage'

const preferences = ref(storage.getPreferences())
const stats = ref(storage.getStats())
const showStyleModal = ref(false)
const showLengthModal = ref(false)

const currentStyleName = computed(() => {
  const style = styles.find((s: { key: string }) => s.key === preferences.value.defaultStyle)
  return style?.name || '简洁'
})

const currentLengthName = computed(() => {
  const len = lengths.find((l: { key: string }) => l.key === preferences.value.defaultLength)
  return len?.name || '短句'
})

function toggleAutoCopy(e: Event) {
  const target = e.target as HTMLInputElement
  preferences.value.autoCopy = target.checked
  storage.savePreferences(preferences.value)
}

function toggleTheme(e: Event) {
  const target = e.target as HTMLInputElement
  preferences.value.theme = target.checked ? 'dark' : 'light'
  storage.savePreferences(preferences.value)
  showToast('设置已保存')
}

function showStyleSelector() {
  showStyleModal.value = true
}

function closeStyleModal() {
  showStyleModal.value = false
}

function selectDefaultStyle(key: string) {
  preferences.value.defaultStyle = key
  storage.savePreferences(preferences.value)
  showStyleModal.value = false
  showToast('设置已保存')
}

function showLengthSelector() {
  showLengthModal.value = true
}

function closeLengthModal() {
  showLengthModal.value = false
}

function selectDefaultLength(key: string) {
  preferences.value.defaultLength = key
  storage.savePreferences(preferences.value)
  showLengthModal.value = false
  showToast('设置已保存')
}

function showAbout() {
  alert('关于留白\n\n留白 - 极简文艺风朋友圈文案生成器\n\n拒绝网红烂大街土味文案和鸡汤矫情内容，专注于创作清冷、高级、有留白感的文案。\n\n版本：1.0.0')
}

function showFeedback() {
  alert('意见反馈\n\n感谢你的反馈！如有任何建议或问题，请发送邮件至 feedback@liubai.app')
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
</script>

<style lang="scss" scoped>
.settings-page {
  padding: 16px;
  padding-top: 40px;
}

.header {
  padding: 12px 0;
  margin-bottom: 10px;
}

.page-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-color);
  margin: 0;
}

.stats-card {
  background: linear-gradient(135deg, var(--primary-color), var(--primary-light));
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 16px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-value {
  font-size: 20px;
  font-weight: 700;
  color: #FFFFFF;
}

.stat-label {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.8);
  margin-top: 4px;
}

.settings-list {
  background: var(--card-color);
  border-radius: 10px;
  padding: 4px 0;
  margin-bottom: 12px;
}

.settings-item {
  display: flex;
  align-items: center;
  padding: 14px 16px;
  border-bottom: 1px solid var(--border-color);
  border: none;
  background: transparent;
  cursor: pointer;
  width: 100%;
}

.settings-item:last-child {
  border-bottom: none;
}

.item-icon {
  font-size: 18px;
  margin-right: 10px;
}

.item-content {
  flex: 1;
  text-align: left;
}

.item-title {
  font-size: 15px;
  color: var(--text-color);
  display: block;
}

.item-desc {
  font-size: 12px;
  color: var(--text-light);
  margin-top: 2px;
}

.item-arrow {
  font-size: 16px;
  color: var(--text-muted);
}

.about-section {
  background: var(--card-color);
  border-radius: 10px;
  padding: 4px 0;
}

.switch {
  position: relative;
  display: inline-block;
  width: 48px;
  height: 28px;
}

.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ccc;
  transition: 0.3s;
  border-radius: 14px;
}

.slider:before {
  position: absolute;
  content: "";
  height: 22px;
  width: 22px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  transition: 0.3s;
  border-radius: 50%;
}

input:checked + .slider {
  background-color: var(--primary-color);
}

input:checked + .slider:before {
  transform: translateX(20px);
}

.modal-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  width: 80%;
  max-width: 300px;
  background: var(--card-color);
  border-radius: 12px;
  overflow: hidden;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 16px;
  border-bottom: 1px solid var(--border-color);
}

.modal-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-color);
  margin: 0;
}

.modal-close {
  font-size: 16px;
  color: var(--text-light);
  border: none;
  background: transparent;
  cursor: pointer;
  padding: 4px 8px;
}

.modal-body {
  padding: 12px;
  max-height: 300px;
  overflow-y: auto;
}

.modal-option {
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 6px;
  background: var(--background-color);
  border: none;
  cursor: pointer;
  width: 100%;
  text-align: left;
}

.modal-option.active {
  background: rgba(139, 154, 143, 0.1);
  border: 1px solid var(--primary-color);
}

.option-name {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-color);
  display: block;
}

.option-desc {
  font-size: 12px;
  color: var(--text-light);
  margin-top: 4px;
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
