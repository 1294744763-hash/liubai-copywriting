<template>
  <div class="chat-page">
    <nav class="nav-bar">
      <button class="nav-back" @click="goBack">←</button>
      <h1 class="nav-title">AI对话</h1>
      <button class="nav-clear" @click="clearChat" v-if="messages.length > 0">✕</button>
    </nav>

    <div class="chat-container">
      <div class="chat-messages" ref="messagesContainer">
        <div 
          v-for="(msg, index) in messages" 
          :key="index" 
          class="message-item"
          :class="{ 'is-ai': msg.isAI }"
        >
          <div class="message-avatar">
            {{ msg.isAI ? '🤖' : '👤' }}
          </div>
          <div class="message-content">
            <p class="message-text">{{ msg.content }}</p>
            <span class="message-time">{{ msg.time }}</span>
          </div>
        </div>

        <div v-if="isLoading" class="loading-indicator">
          <div class="typing-dots">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
      </div>

      <div class="chat-input-area">
        <textarea 
          v-model="inputText"
          class="chat-input"
          placeholder="输入你想说的话..."
          rows="2"
          @keydown.enter.exact.prevent="sendMessage"
        ></textarea>
        <button 
          class="send-btn" 
          :class="{ disabled: !inputText.trim() || isLoading }"
          @click="sendMessage"
        >
          发送
        </button>
      </div>
    </div>

    <div class="quick-prompts">
      <p class="prompts-title">快捷提问</p>
      <div class="prompts-list">
        <button 
          v-for="prompt in quickPrompts" 
          :key="prompt" 
          class="prompt-chip"
          @click="useQuickPrompt(prompt)"
        >
          {{ prompt }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick, onMounted } from 'vue'
import aiService from '@/utils/aiService'

interface Message {
  content: string
  isAI: boolean
  time: string
}

const messages = ref<Message[]>([])
const inputText = ref('')
const isLoading = ref(false)
const messagesContainer = ref<HTMLElement | null>(null)

const quickPrompts = [
  '帮我写一段朋友圈文案',
  '今天心情不太好，安慰一下我',
  '推荐一首适合雨天听的歌',
  '给我讲个冷笑话',
  '用三句话形容春天',
  '写一句关于时间的短句'
]

onMounted(() => {
  addWelcomeMessage()
})

function addWelcomeMessage() {
  messages.value.push({
    content: '你好！我是留白文案助手，很高兴为你服务。有什么我可以帮助你的吗？',
    isAI: true,
    time: getCurrentTime()
  })
}

function getCurrentTime(): string {
  const now = new Date()
  return `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`
}

async function sendMessage() {
  const text = inputText.value.trim()
  if (!text || isLoading.value) return

  messages.value.push({
    content: text,
    isAI: false,
    time: getCurrentTime()
  })
  inputText.value = ''
  isLoading.value = true

  scrollToBottom()

  try {
    const result = await aiService.customGenerate(text, 1)
    const aiResponse = result[0] || '抱歉，我不太明白你的意思。'
    
    messages.value.push({
      content: aiResponse,
      isAI: true,
      time: getCurrentTime()
    })
  } catch (error) {
    messages.value.push({
      content: '抱歉，网络有点问题，请稍后再试。',
      isAI: true,
      time: getCurrentTime()
    })
  } finally {
    isLoading.value = false
    scrollToBottom()
  }
}

function useQuickPrompt(prompt: string) {
  inputText.value = prompt
  sendMessage()
}

function scrollToBottom() {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    }
  })
}

function clearChat() {
  messages.value = []
  addWelcomeMessage()
}

function goBack() {
  window.location.hash = '/'
}
</script>

<style lang="scss" scoped>
.chat-page {
  min-height: 100vh;
  background: linear-gradient(180deg, #1a1a2e 0%, #16213e 100%);
  display: flex;
  flex-direction: column;
}

.nav-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  position: sticky;
  top: 0;
  z-index: 100;
}

.nav-back {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  border: none;
  color: #fff;
  font-size: 18px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.2);
  }
}

.nav-title {
  color: #fff;
  font-size: 18px;
  font-weight: 500;
}

.nav-clear {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  border: none;
  color: #fff;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(255, 50, 50, 0.3);
  }
}

.chat-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 20px;
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding-right: 8px;

  &::-webkit-scrollbar {
    width: 4px;
  }

  &::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.05);
    border-radius: 2px;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.2);
    border-radius: 2px;
  }
}

.message-item {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
  animation: fadeIn 0.3s ease;

  &.is-ai {
    flex-direction: row;

    .message-avatar {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }

    .message-content {
      background: rgba(102, 126, 234, 0.15);
      border: 1px solid rgba(102, 126, 234, 0.3);
    }
  }

  &:not(.is-ai) {
    flex-direction: row-reverse;

    .message-avatar {
      background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
    }

    .message-content {
      background: rgba(255, 255, 255, 0.1);
      border: 1px solid rgba(255, 255, 255, 0.15);
    }
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.message-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  flex-shrink: 0;
}

.message-content {
  max-width: 75%;
  padding: 12px 16px;
  border-radius: 16px;
  position: relative;

  &:not(:last-child) {
    border-bottom-left-radius: 4px;
  }

  &:last-child {
    border-bottom-right-radius: 4px;
  }
}

.message-text {
  color: #fff;
  font-size: 15px;
  line-height: 1.6;
  margin: 0;
  white-space: pre-wrap;
  word-break: break-word;
}

.message-time {
  display: block;
  font-size: 11px;
  color: rgba(255, 255, 255, 0.5);
  margin-top: 6px;
}

.loading-indicator {
  display: flex;
  justify-content: center;
  padding: 16px;
}

.typing-dots {
  display: flex;
  gap: 6px;

  span {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: rgba(102, 126, 234, 0.6);
    animation: typing 1.4s infinite ease-in-out;

    &:nth-child(1) { animation-delay: 0s; }
    &:nth-child(2) { animation-delay: 0.2s; }
    &:nth-child(3) { animation-delay: 0.4s; }
  }
}

@keyframes typing {
  0%, 80%, 100% {
    transform: scale(0.6);
    opacity: 0.5;
  }
  40% {
    transform: scale(1);
    opacity: 1;
  }
}

.chat-input-area {
  display: flex;
  gap: 12px;
  padding-top: 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.chat-input {
  flex: 1;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  color: #fff;
  font-size: 15px;
  resize: none;
  outline: none;
  transition: all 0.3s ease;

  &:focus {
    border-color: rgba(102, 126, 234, 0.5);
    background: rgba(255, 255, 255, 0.15);
  }

  &::placeholder {
    color: rgba(255, 255, 255, 0.4);
  }
}

.send-btn {
  padding: 12px 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  border-radius: 20px;
  color: #fff;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover:not(.disabled) {
    transform: translateY(-2px);
    box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
  }

  &.disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}

.quick-prompts {
  padding: 20px;
  padding-top: 0;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.prompts-title {
  color: rgba(255, 255, 255, 0.6);
  font-size: 13px;
  margin: 0 0 12px 0;
}

.prompts-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.prompt-chip {
  padding: 8px 16px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 20px;
  color: rgba(255, 255, 255, 0.8);
  font-size: 13px;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(102, 126, 234, 0.2);
    border-color: rgba(102, 126, 234, 0.4);
  }
}
</style>
