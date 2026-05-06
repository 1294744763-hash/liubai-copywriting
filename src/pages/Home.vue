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

    <section class="custom-section">
      <div class="custom-card">
        <div class="custom-input-wrapper">
          <input 
            v-model="customPrompt"
            type="text" 
            class="custom-input" 
            placeholder="自定义生成文案..."
            @keyup.enter="generateCustom"
          />
          <button class="custom-btn" @click="generateCustom">✨</button>
        </div>
      </div>
    </section>

    <section class="mode-tabs">
      <button 
        class="mode-tab" 
        :class="{ active: currentMode === 'scene' }"
        @click="currentMode = 'scene'"
      >场景模式</button>
      <button 
        class="mode-tab" 
        :class="{ active: currentMode === 'quick' }"
        @click="currentMode = 'quick'"
      >快捷生成</button>
    </section>

    <section v-if="currentMode === 'scene'" class="scene-section">
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

    <section v-else class="quick-section">
      <div class="quick-grid">
        <button 
          v-for="item in quickOptions" 
          :key="item.key" 
          class="quick-card"
          @click="generateQuick(item)"
        >
          <span class="quick-icon">{{ item.icon }}</span>
          <span class="quick-name">{{ item.name }}</span>
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
      <div v-if="isGenerating" class="loading-wrapper">
        <div class="loading-spinner"></div>
        <span class="loading-text">AI正在思考...</span>
      </div>
      <div v-else class="inspiration-list">
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
import { scenes, styles, lengths } from '@/data/constants'
import aiService from '@/utils/aiService'
import storage from '@/utils/storage'

const router = useRouter()

const selectedStyle = ref('simple')
const selectedLength = ref('short')
const currentMode = ref('scene')
const inspirations = ref<string[]>([])
const isGenerating = ref(false)
const customPrompt = ref('')

const quickOptions = [
  { key: 'morning', name: '早安', icon: '🌅' },
  { key: 'night', name: '晚安', icon: '🌙' },
  { key: 'love', name: '表白', icon: '💌' },
  { key: 'friend', name: '友情', icon: '👭' },
  { key: 'work', name: '工作', icon: '💼' },
  { key: 'nature', name: '自然', icon: '🌿' },
  { key: 'food', name: '美食', icon: '🍜' },
  { key: 'travel', name: '旅行', icon: '✈️' }
]

onMounted(() => {
  const prefs = storage.getPreferences()
  selectedStyle.value = prefs.defaultStyle
  selectedLength.value = prefs.defaultLength
  refreshInspirations()
})

async function refreshInspirations() {
  isGenerating.value = true
  try {
    const result = await aiService.generateCopywriting(
      'daily',
      selectedStyle.value,
      selectedLength.value,
      5
    )
    inspirations.value = result
  } catch (error) {
    console.error('生成失败:', error)
    inspirations.value = getRandomFallback()
  } finally {
    isGenerating.value = false
  }
}

async function generateCustom() {
  if (!customPrompt.value.trim()) {
    showToast('请输入内容')
    return
  }
  
  isGenerating.value = true
  try {
    const result = await aiService.customGenerate(
      `${customPrompt.value}。要求：清冷高级有留白感，拒绝鸡汤和土味。输出5条文案，每条单独一行，不加编号。`,
      5
    )
    inspirations.value = result
    customPrompt.value = ''
  } catch (error) {
    console.error('生成失败:', error)
    showToast('生成失败，请重试')
  } finally {
    isGenerating.value = false
  }
}

async function generateQuick(item: { key: string; name: string }) {
  isGenerating.value = true
  try {
    const result = await aiService.generateCopywriting(
      item.key,
      selectedStyle.value,
      selectedLength.value,
      5
    )
    inspirations.value = result
  } catch (error) {
    console.error('生成失败:', error)
    inspirations.value = getRandomFallback()
  } finally {
    isGenerating.value = false
  }
}

function getRandomFallback(): string[] {
  const allCopywritings = [
    '阳光落在窗台，刚好',
    '风是甜的，你也是',
    '把日子过成诗',
    '日落跌进星河里',
    '岁月漫长，值得等待',
    '晚风踩着云朵',
    '月亮在说晚安',
    '夜色漫过窗台',
    '星星掉进海里',
    '夜晚温柔得不像话',
    '时光慢慢走',
    '生活自有诗意',
    '安静也是一种力量',
    '与自己和解',
    '独处是浪漫的开始',
    '阳光正好，微风不燥',
    '日子慢慢，温柔以待',
    '时光不语，静待花开',
    '岁月静好，现世安稳',
    '心若向阳，无畏悲伤',
    '静水流深，沧笙踏歌',
    '清风徐来，水波不兴',
    '月光洒落肩头',
    '星光点缀夜空',
    '灯火阑珊处',
    '静待黎明',
    '岁月如歌',
    '往事随风',
    '心有所向',
    '行有所止',
    '言有尽而意无穷',
    '此时无声胜有声',
    '留白处自有深意',
    '于无声处听惊雷',
    '万籁俱寂，心有回响',
    '沉默是最好的表达',
    '极简中见繁华',
    '少即是多',
    '刹那即永恒',
    '瞬间即永远',
    '时光碎片',
    '记忆拼图',
    '光影交织',
    '虚实之间',
    '朦胧之美',
    '含蓄之韵',
    '婉约之风',
    '淡雅之致',
    '清新脱俗',
    '遗世独立',
    '卓尔不群',
    '自成一格',
    '独树一帜',
    '别具匠心',
    '匠心独运',
    '妙手偶得',
    '浑然天成',
    '水到渠成',
    '顺其自然',
    '随遇而安',
    '知足常乐',
    '宁静致远',
    '淡泊明志',
    '宁静祥和',
    '岁月安然',
    '人间值得',
    '未来可期',
    '来日方长',
    '平安喜乐',
    '顺遂无忧',
    '喜乐安康',
    '乘风破浪',
    '披荆斩棘',
    '勇往直前',
    '砥砺前行',
    '风雨兼程',
    '不负韶华'
  ]
  const shuffled = allCopywritings.sort(() => Math.random() - 0.5)
  return shuffled.slice(0, 5)
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
  margin-bottom: 16px;
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

.custom-section {
  margin-bottom: 16px;
}

.custom-card {
  background: var(--card-color);
  border-radius: 12px;
  padding: 12px;
  box-shadow: 0 1px 6px rgba(0, 0, 0, 0.04);
}

.custom-input-wrapper {
  display: flex;
  gap: 10px;
}

.custom-input {
  flex: 1;
  padding: 10px 14px;
  background: var(--bg-color);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  font-size: 14px;
  color: var(--text-color);
  outline: none;
  transition: border-color 0.2s;
}

.custom-input:focus {
  border-color: var(--primary-color);
}

.custom-input::placeholder {
  color: var(--text-muted);
}

.custom-btn {
  padding: 10px 16px;
  background: var(--primary-color);
  border: none;
  border-radius: 8px;
  font-size: 18px;
  cursor: pointer;
  color: #FFFFFF;
}

.mode-tabs {
  display: flex;
  gap: 10px;
  margin-bottom: 16px;
}

.mode-tab {
  flex: 1;
  padding: 10px 0;
  background: var(--card-color);
  border: 1px solid transparent;
  border-radius: 8px;
  font-size: 14px;
  color: var(--text-light);
  cursor: pointer;
  transition: all 0.2s;
}

.mode-tab.active {
  background: rgba(139, 154, 143, 0.1);
  color: var(--primary-color);
  border-color: var(--primary-color);
}

.scene-section,
.style-section,
.length-section,
.inspiration-section,
.rewrite-section,
.quick-section {
  margin-bottom: 16px;
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

.quick-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
}

.quick-card {
  background: var(--card-color);
  border-radius: 10px;
  padding: 14px 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-shadow: 0 1px 6px rgba(0, 0, 0, 0.04);
  border: none;
  cursor: pointer;
  transition: all 0.2s;
}

.quick-card:active {
  transform: scale(0.95);
}

.quick-icon {
  font-size: 20px;
  margin-bottom: 6px;
}

.quick-name {
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

.loading-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 30px 0;
}

.loading-spinner {
  width: 30px;
  height: 30px;
  border: 3px solid var(--border-color);
  border-top-color: var(--primary-color);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.loading-text {
  font-size: 13px;
  color: var(--text-light);
  margin-top: 10px;
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
  line-height: 1.5;
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
