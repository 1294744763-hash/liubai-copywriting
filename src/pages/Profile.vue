<template>
  <div class="profile-page">
    <header class="profile-header">
      <div class="header-bg"></div>
      <div class="profile-info">
        <div class="avatar-wrapper">
          <span class="avatar">{{ user.nickname?.charAt(0) || '用' }}</span>
        </div>
        <div class="user-info">
          <h2 class="user-name">{{ user.nickname || '用户' }}</h2>
          <p class="user-detail">{{ user.phone || user.email || '未绑定手机号' }}</p>
        </div>
        <button class="edit-btn" @click="goToEditProfile">✏️</button>
      </div>
    </header>

    <section class="stats-section">
      <div class="stats-card">
        <div class="stat-item">
          <span class="stat-value">{{ stats.generateCount }}</span>
          <span class="stat-label">生成次数</span>
        </div>
        <div class="stat-divider"></div>
        <div class="stat-item">
          <span class="stat-value">{{ stats.favoriteCount }}</span>
          <span class="stat-label">收藏数量</span>
        </div>
        <div class="stat-divider"></div>
        <div class="stat-item">
          <span class="stat-value">{{ stats.copyCount }}</span>
          <span class="stat-label">复制次数</span>
        </div>
      </div>
    </section>

    <section class="menu-section">
      <div class="menu-group">
        <button class="menu-item" @click="goToFavorites">
          <span class="menu-icon">❤️</span>
          <span class="menu-text">我的收藏</span>
          <span class="menu-arrow">→</span>
        </button>
        <button class="menu-item" @click="goToHistory">
          <span class="menu-icon">📜</span>
          <span class="menu-text">生成历史</span>
          <span class="menu-arrow">→</span>
        </button>
        <button class="menu-item" @click="goToSettings">
          <span class="menu-icon">⚙️</span>
          <span class="menu-text">设置</span>
          <span class="menu-arrow">→</span>
        </button>
      </div>

      <div class="menu-group">
        <button class="menu-item" @click="showBindPhone" v-if="!user.phone">
          <span class="menu-icon">📱</span>
          <span class="menu-text">绑定手机号</span>
          <span class="menu-arrow">→</span>
        </button>
        <button class="menu-item" @click="showModifyPhone" v-else>
          <span class="menu-icon">📱</span>
          <span class="menu-text">更换手机号</span>
          <span class="menu-arrow">→</span>
        </button>
        <button class="menu-item" @click="showFeedback">
          <span class="menu-icon">💬</span>
          <span class="menu-text">意见反馈</span>
          <span class="menu-arrow">→</span>
        </button>
        <button class="menu-item" @click="showAbout">
          <span class="menu-icon">ℹ️</span>
          <span class="menu-text">关于我们</span>
          <span class="menu-arrow">→</span>
        </button>
      </div>

      <button class="logout-btn" @click="handleLogout">
        <span class="logout-icon">🚪</span>
        <span class="logout-text">退出登录</span>
      </button>
    </section>

    <div v-if="showBindModal" class="modal-mask" @click="closeBindModal">
      <div class="modal-content bind-modal" @click.stop>
        <div class="modal-header">
          <h3 class="modal-title">{{ user.phone ? '更换手机号' : '绑定手机号' }}</h3>
          <button class="modal-close" @click="closeBindModal">✕</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label class="form-label">{{ user.phone ? '原手机号' : '手机号' }}</label>
            <input 
              v-model="bindPhone" 
              type="tel" 
              class="form-input" 
              :placeholder="`请输入${user.phone ? '原' : ''}手机号`"
              maxlength="11"
              :disabled="!!user.phone"
            />
            <span v-if="user.phone" class="phone-hint">{{ user.phone }}</span>
          </div>
          <div class="form-group" v-if="!user.phone">
            <label class="form-label">验证码</label>
            <div class="verify-row">
              <input 
                v-model="bindCode" 
                type="text" 
                class="form-input verify-input" 
                placeholder="请输入验证码"
                maxlength="6"
              />
              <button 
                class="verify-btn" 
                :class="{ disabled: !canSendBindCode || bindCountdown > 0 }"
                @click="sendBindCode"
              >
                {{ bindCountdown > 0 ? `${bindCountdown}s` : '获取验证码' }}
              </button>
            </div>
          </div>
          <div class="form-group" v-if="user.phone">
            <label class="form-label">新手机号</label>
            <input 
              v-model="newPhone" 
              type="tel" 
              class="form-input" 
              placeholder="请输入新手机号"
              maxlength="11"
            />
          </div>
          <div class="form-group" v-if="user.phone">
            <label class="form-label">验证码</label>
            <div class="verify-row">
              <input 
                v-model="newPhoneCode" 
                type="text" 
                class="form-input verify-input" 
                placeholder="请输入验证码"
                maxlength="6"
              />
              <button 
                class="verify-btn" 
                :class="{ disabled: !canSendNewPhoneCode || newPhoneCountdown > 0 }"
                @click="sendNewPhoneCode"
              >
                {{ newPhoneCountdown > 0 ? `${newPhoneCountdown}s` : '获取验证码' }}
              </button>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="modal-btn cancel" @click="closeBindModal">取消</button>
          <button class="modal-btn confirm" @click="handleBindPhone">确定</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import storage from '@/utils/storage'
import userStore from '@/utils/userStore'

const router = useRouter()

const user = ref({
  id: '',
  email: '',
  phone: '',
  nickname: '',
  avatar: '',
  createdAt: ''
})

const stats = ref({
  generateCount: 0,
  favoriteCount: 0,
  copyCount: 0,
  rewriteCount: 0
})

const showBindModal = ref(false)
const bindPhone = ref('')
const bindCode = ref('')
const newPhone = ref('')
const newPhoneCode = ref('')
const bindCountdown = ref(0)
const newPhoneCountdown = ref(0)

const canSendBindCode = ref(false)
const canSendNewPhoneCode = ref(false)

onMounted(() => {
  const storedUser = storage.getUser()
  if (storedUser) {
    user.value = storedUser
    bindPhone.value = storedUser.phone || ''
    
    const fullUser = userStore.getUserById(storedUser.id)
    if (fullUser) {
      user.value.phone = fullUser.phone
      bindPhone.value = fullUser.phone
    }
  }
  stats.value = storage.getStats()
})

function goToEditProfile() {
  showToast('功能开发中')
}

function goToFavorites() {
  router.push('/favorites')
}

function goToHistory() {
  showToast('功能开发中')
}

function goToSettings() {
  router.push('/settings')
}

function showBindPhone() {
  showBindModal.value = true
}

function showModifyPhone() {
  showBindModal.value = true
}

function closeBindModal() {
  showBindModal.value = false
  bindPhone.value = user.value.phone || ''
  bindCode.value = ''
  newPhone.value = ''
  newPhoneCode.value = ''
}

function sendBindCode() {
  if (!bindPhone.value || bindPhone.value.length !== 11) {
    showToast('请输入正确的手机号')
    return
  }
  
  bindCountdown.value = 60
  showToast('验证码已发送')
  
  const timer = setInterval(() => {
    bindCountdown.value--
    if (bindCountdown.value <= 0) {
      clearInterval(timer)
    }
  }, 1000)
}

function sendNewPhoneCode() {
  if (!newPhone.value || newPhone.value.length !== 11) {
    showToast('请输入正确的新手机号')
    return
  }
  
  newPhoneCountdown.value = 60
  showToast('验证码已发送')
  
  const timer = setInterval(() => {
    newPhoneCountdown.value--
    if (newPhoneCountdown.value <= 0) {
      clearInterval(timer)
    }
  }, 1000)
}

function handleBindPhone() {
  if (!user.value.phone) {
    if (!bindPhone.value || bindPhone.value.length !== 11) {
      showToast('请输入正确的手机号')
      return
    }
    
    if (!bindCode.value || bindCode.value.length !== 6) {
      showToast('请输入正确的验证码')
      return
    }
    
    const success = userStore.bindPhone(user.value.id, bindPhone.value)
    
    if (success) {
      user.value.phone = bindPhone.value
      storage.saveUser(user.value)
      showToast('绑定成功')
      closeBindModal()
    } else {
      showToast('绑定失败，该手机号已被绑定')
    }
  } else {
    if (!newPhone.value || newPhone.value.length !== 11) {
      showToast('请输入正确的新手机号')
      return
    }
    
    if (!newPhoneCode.value || newPhoneCode.value.length !== 6) {
      showToast('请输入正确的验证码')
      return
    }
    
    const success = userStore.bindPhone(user.value.id, newPhone.value)
    
    if (success) {
      user.value.phone = newPhone.value
      storage.saveUser(user.value)
      showToast('更换成功')
      closeBindModal()
    } else {
      showToast('更换失败，该手机号已被绑定')
    }
  }
}

function showFeedback() {
  alert('意见反馈\n\n感谢你的反馈！如有任何建议或问题，请发送邮件至 feedback@liubai.app')
}

function showAbout() {
  alert('关于留白\n\n留白 - 极简文艺风朋友圈文案生成器\n\n拒绝网红烂大街土味文案和鸡汤矫情内容，专注于创作清冷、高级、有留白感的文案。\n\n版本：1.0.0')
}

function handleLogout() {
  if (confirm('确定要退出登录吗？')) {
    storage.clearUser()
    showToast('已退出登录')
    setTimeout(() => {
      router.push('/login')
    }, 1000)
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
</script>

<style lang="scss" scoped>
.profile-page {
  min-height: 100vh;
  background: var(--background-color);
}

.profile-header {
  position: relative;
  padding: 40px 20px 30px;
}

.header-bg {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 180px;
  background: linear-gradient(135deg, var(--primary-color), var(--primary-light));
  border-radius: 0 0 30px 30px;
}

.profile-info {
  position: relative;
  display: flex;
  align-items: center;
  gap: 16px;
}

.avatar-wrapper {
  width: 70px;
  height: 70px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 3px solid #FFFFFF;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.avatar {
  font-size: 28px;
  font-weight: 600;
  color: #FFFFFF;
}

.user-info {
  flex: 1;
}

.user-name {
  font-size: 20px;
  font-weight: 600;
  color: #FFFFFF;
  margin: 0;
}

.user-detail {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.8);
  margin: 4px 0 0;
}

.edit-btn {
  padding: 8px 12px;
  background: rgba(255, 255, 255, 0.2);
  border: none;
  border-radius: 8px;
  font-size: 18px;
  cursor: pointer;
}

.stats-section {
  padding: 0 20px;
  margin-top: -20px;
}

.stats-card {
  background: var(--card-color);
  border-radius: 14px;
  padding: 20px;
  display: flex;
  align-items: center;
  justify-content: space-around;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-value {
  font-size: 22px;
  font-weight: 700;
  color: var(--text-color);
}

.stat-label {
  font-size: 12px;
  color: var(--text-light);
  margin-top: 4px;
}

.stat-divider {
  width: 1px;
  height: 40px;
  background: var(--border-color);
}

.menu-section {
  padding: 20px;
}

.menu-group {
  background: var(--card-color);
  border-radius: 12px;
  margin-bottom: 12px;
  overflow: hidden;
}

.menu-item {
  width: 100%;
  display: flex;
  align-items: center;
  padding: 16px;
  background: transparent;
  border: none;
  border-bottom: 1px solid var(--border-color);
  cursor: pointer;
  transition: background 0.2s;
}

.menu-item:last-child {
  border-bottom: none;
}

.menu-item:active {
  background: var(--background-color);
}

.menu-icon {
  font-size: 18px;
  margin-right: 12px;
}

.menu-text {
  flex: 1;
  font-size: 15px;
  color: var(--text-color);
  text-align: left;
}

.menu-arrow {
  font-size: 16px;
  color: var(--text-muted);
}

.logout-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 16px;
  background: var(--card-color);
  border: none;
  border-radius: 12px;
  cursor: pointer;
  margin-top: 20px;
  transition: all 0.2s;
}

.logout-btn:active {
  background: var(--border-color);
}

.logout-icon {
  font-size: 18px;
}

.logout-text {
  font-size: 15px;
  color: var(--error-color);
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
  max-width: 320px;
  background: var(--card-color);
  border-radius: 12px;
  overflow: hidden;
}

.modal-content.bind-modal {
  max-width: 340px;
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
  padding: 16px;
}

.form-group {
  position: relative;
  margin-bottom: 16px;
}

.form-label {
  font-size: 13px;
  color: var(--text-light);
  margin-bottom: 8px;
  display: block;
}

.form-input {
  width: 100%;
  padding: 14px;
  background: var(--background-color);
  border: 1px solid var(--border-color);
  border-radius: 10px;
  font-size: 15px;
  color: var(--text-color);
  outline: none;
  box-sizing: border-box;
}

.form-input:focus {
  border-color: var(--primary-color);
}

.form-input:disabled {
  background: var(--border-color);
  color: var(--text-muted);
}

.phone-hint {
  position: absolute;
  right: 14px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 14px;
  color: var(--text-light);
}

.verify-row {
  display: flex;
  gap: 10px;
}

.verify-input {
  flex: 1;
}

.verify-btn {
  padding: 14px 16px;
  background: var(--primary-color);
  color: #FFFFFF;
  border: none;
  border-radius: 10px;
  font-size: 13px;
  cursor: pointer;
  white-space: nowrap;
}

.verify-btn.disabled {
  background: var(--border-color);
  cursor: not-allowed;
}

.modal-footer {
  display: flex;
  gap: 10px;
  padding: 12px 16px;
  border-top: 1px solid var(--border-color);
}

.modal-btn {
  flex: 1;
  padding: 10px 0;
  border-radius: 8px;
  font-size: 14px;
  border: none;
  cursor: pointer;
}

.modal-btn.cancel {
  background: var(--border-color);
  color: var(--text-light);
}

.modal-btn.confirm {
  background: var(--primary-color);
  color: #FFFFFF;
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
