<template>
  <div class="login-page">
    <header class="login-header">
      <h1 class="logo">留白</h1>
      <p class="slogan">少一点堆砌，多一些留白</p>
    </header>

    <section class="login-form">
      <div class="form-card">
        <div class="login-tabs">
          <button 
            class="login-tab"
            :class="{ active: loginType === 'account' }"
            @click="loginType = 'account'"
          >账号登录</button>
          <button 
            class="login-tab"
            :class="{ active: loginType === 'phone' }"
            @click="loginType = 'phone'"
          >手机号登录</button>
        </div>

        <div v-if="loginType === 'account'" class="form-body">
          <div class="form-group">
            <label class="form-label">账号</label>
            <input 
              v-model="account" 
              type="text" 
              class="form-input" 
              placeholder="邮箱或用户名"
              @keyup.enter="handleLogin"
            />
          </div>

          <div class="form-group">
            <label class="form-label">密码</label>
            <input 
              v-model="password" 
              :type="showPassword ? 'text' : 'password'" 
              class="form-input" 
              placeholder="请输入密码"
              @keyup.enter="handleLogin"
            />
            <button class="toggle-password" @click="showPassword = !showPassword">
              {{ showPassword ? '🙈' : '👁️' }}
            </button>
          </div>
        </div>

        <div v-else class="form-body">
          <div class="form-group">
            <label class="form-label">手机号</label>
            <input 
              v-model="phone" 
              type="tel" 
              class="form-input" 
              placeholder="请输入手机号"
              maxlength="11"
              @keyup.enter="handlePhoneLogin"
            />
          </div>

          <div class="form-group" v-if="phoneLoginMode === 'password'">
            <label class="form-label">密码</label>
            <input 
              v-model="phonePassword" 
              :type="showPhonePassword ? 'text' : 'password'" 
              class="form-input" 
              placeholder="请输入密码"
              @keyup.enter="handlePhoneLogin"
            />
            <button class="toggle-password" @click="showPhonePassword = !showPhonePassword">
              {{ showPhonePassword ? '🙈' : '👁️' }}
            </button>
          </div>

          <div class="form-group verify-group" v-else>
            <label class="form-label">验证码</label>
            <div class="verify-row">
              <input 
                v-model="verifyCode" 
                type="text" 
                class="form-input verify-input" 
                placeholder="请输入验证码"
                maxlength="6"
                @keyup.enter="handlePhoneLogin"
              />
              <button 
                class="verify-btn" 
                :class="{ disabled: !phone || verifyCountdown > 0 }"
                @click="sendVerifyCode"
              >
                {{ verifyCountdown > 0 ? `${verifyCountdown}s` : '获取验证码' }}
              </button>
            </div>
          </div>

          <div class="phone-mode-switch">
            <button 
              class="mode-switch-btn"
              :class="{ active: phoneLoginMode === 'password' }"
              @click="phoneLoginMode = 'password'"
            >密码登录</button>
            <button 
              class="mode-switch-btn"
              :class="{ active: phoneLoginMode === 'code' }"
              @click="phoneLoginMode = 'code'"
            >短信验证码</button>
          </div>
        </div>

        <button 
          class="login-btn" 
          :class="{ loading: isLoading, disabled: !isFormValid }"
          @click="loginType === 'account' ? handleLogin : handlePhoneLogin"
        >
          <span v-if="isLoading" class="btn-spinner"></span>
          {{ isLoading ? '登录中...' : '登录' }}
        </button>

        <div class="form-footer">
          <button class="link-btn" @click="goToRegister">还没有账号？去注册</button>
          <button class="link-btn" @click="showForgotPassword">忘记密码？</button>
        </div>
      </div>

      <div class="social-login">
        <div class="divider">
          <span class="divider-text">其他方式登录</span>
        </div>
        <div class="social-buttons">
          <button class="social-btn wechat" @click="loginWithWechat">
            <span class="social-icon">💬</span>
            <span class="social-text">微信登录</span>
          </button>
          <button class="social-btn phone" @click="loginType = 'phone'">
            <span class="social-icon">📱</span>
            <span class="social-text">手机号快捷登录</span>
          </button>
        </div>
      </div>
    </section>

    <div v-if="showForgotModal" class="modal-mask" @click="closeForgotModal">
      <div class="modal-content forgot-modal" @click.stop>
        <div class="modal-header">
          <h3 class="modal-title">找回密码</h3>
          <button class="modal-close" @click="closeForgotModal">✕</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label class="form-label">手机号</label>
            <input 
              v-model="forgotPhone" 
              type="tel" 
              class="form-input" 
              placeholder="请输入绑定的手机号"
              maxlength="11"
            />
          </div>
          <div class="form-group">
            <label class="form-label">验证码</label>
            <div class="verify-row">
              <input 
                v-model="forgotCode" 
                type="text" 
                class="form-input verify-input" 
                placeholder="请输入验证码"
                maxlength="6"
              />
              <button 
                class="verify-btn" 
                :class="{ disabled: !forgotPhone || forgotCountdown > 0 }"
                @click="sendForgotCode"
              >
                {{ forgotCountdown > 0 ? `${forgotCountdown}s` : '获取验证码' }}
              </button>
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">新密码</label>
            <input 
              v-model="newPassword" 
              :type="showNewPassword ? 'text' : 'password'" 
              class="form-input" 
              placeholder="请输入新密码（6-16位）"
            />
            <button class="toggle-password" @click="showNewPassword = !showNewPassword">
              {{ showNewPassword ? '🙈' : '👁️' }}
            </button>
          </div>
        </div>
        <div class="modal-footer">
          <button class="modal-btn cancel" @click="closeForgotModal">取消</button>
          <button class="modal-btn confirm" @click="resetPassword">确定</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import storage from '@/utils/storage'
import userStore from '@/utils/userStore'

const router = useRouter()

const loginType = ref('account')
const phoneLoginMode = ref('password')

const account = ref('')
const password = ref('')
const phone = ref('')
const phonePassword = ref('')
const verifyCode = ref('')
const showPassword = ref(false)
const showPhonePassword = ref(false)
const isLoading = ref(false)
const verifyCountdown = ref(0)

const showForgotModal = ref(false)
const forgotPhone = ref('')
const forgotCode = ref('')
const newPassword = ref('')
const showNewPassword = ref(false)
const forgotCountdown = ref(0)

const isFormValid = computed(() => {
  if (loginType.value === 'account') {
    return account.value.trim() && password.value.length >= 6
  } else {
    if (phoneLoginMode.value === 'password') {
      return phone.value.length === 11 && phonePassword.value.length >= 6
    } else {
      return phone.value.length === 11 && verifyCode.value.length === 6
    }
  }
})

async function handleLogin() {
  if (!isFormValid.value) {
    showToast('请填写完整信息')
    return
  }
  
  isLoading.value = true
  
  try {
    await new Promise(resolve => setTimeout(resolve, 800))
    
    let user = null
    
    if (account.value.includes('@')) {
      user = userStore.loginByEmail(account.value, password.value)
    } else {
      user = userStore.loginByUsername(account.value, password.value)
    }
    
    if (user) {
      storage.saveUser({
        id: user.id,
        email: user.email,
        phone: user.phone,
        nickname: user.nickname,
        avatar: user.avatar,
        createdAt: user.createdAt
      })
      showToast('登录成功')
      
      setTimeout(() => {
        router.push('/')
      }, 1000)
    } else {
      showToast('账号或密码错误')
    }
  } catch (error) {
    console.error('登录失败:', error)
    showToast('登录失败，请重试')
  } finally {
    isLoading.value = false
  }
}

async function handlePhoneLogin() {
  if (!isFormValid.value) {
    showToast('请填写完整信息')
    return
  }
  
  isLoading.value = true
  
  try {
    await new Promise(resolve => setTimeout(resolve, 800))
    
    let user = null
    
    if (phoneLoginMode.value === 'password') {
      user = userStore.loginByPhone(phone.value, phonePassword.value)
    } else {
      user = userStore.loginByPhone(phone.value, verifyCode.value)
    }
    
    if (user) {
      storage.saveUser({
        id: user.id,
        email: user.email,
        phone: user.phone,
        nickname: user.nickname,
        avatar: user.avatar,
        createdAt: user.createdAt
      })
      showToast('登录成功')
      
      setTimeout(() => {
        router.push('/')
      }, 1000)
    } else {
      showToast(phoneLoginMode.value === 'password' ? '手机号或密码错误' : '手机号或验证码错误')
    }
  } catch (error) {
    console.error('登录失败:', error)
    showToast('登录失败，请重试')
  } finally {
    isLoading.value = false
  }
}

function sendVerifyCode() {
  if (!phone.value || phone.value.length !== 11) {
    showToast('请输入正确的手机号')
    return
  }
  
  verifyCountdown.value = 60
  showToast('验证码已发送')
  
  const timer = setInterval(() => {
    verifyCountdown.value--
    if (verifyCountdown.value <= 0) {
      clearInterval(timer)
    }
  }, 1000)
}

function goToRegister() {
  router.push('/register')
}

function showForgotPassword() {
  showForgotModal.value = true
}

function closeForgotModal() {
  showForgotModal.value = false
  forgotPhone.value = ''
  forgotCode.value = ''
  newPassword.value = ''
}

function sendForgotCode() {
  if (!forgotPhone.value || forgotPhone.value.length !== 11) {
    showToast('请输入正确的手机号')
    return
  }
  
  if (!userStore.checkPhoneExists(forgotPhone.value)) {
    showToast('该手机号未注册')
    return
  }
  
  forgotCountdown.value = 60
  showToast('验证码已发送')
  
  const timer = setInterval(() => {
    forgotCountdown.value--
    if (forgotCountdown.value <= 0) {
      clearInterval(timer)
    }
  }, 1000)
}

function resetPassword() {
  if (!forgotPhone.value || !forgotCode.value || !newPassword.value) {
    showToast('请填写完整信息')
    return
  }
  
  if (newPassword.value.length < 6 || newPassword.value.length > 16) {
    showToast('密码长度为6-16位')
    return
  }
  
  const success = userStore.resetPasswordByPhone(forgotPhone.value, newPassword.value)
  
  if (success) {
    showToast('密码重置成功')
    closeForgotModal()
  } else {
    showToast('重置失败，请重试')
  }
}

function loginWithWechat() {
  isLoading.value = true
  
  setTimeout(() => {
    const wechatId = 'wx_' + Date.now().toString(36)
    const user = userStore.loginByWechat(wechatId)
    
    if (user) {
      storage.saveUser({
        id: user.id,
        email: user.email,
        phone: user.phone,
        nickname: user.nickname,
        avatar: user.avatar,
        createdAt: user.createdAt
      })
      showToast('微信登录成功')
      
      setTimeout(() => {
        router.push('/')
      }, 1000)
    }
    
    isLoading.value = false
  }, 1500)
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
.login-page {
  padding: 20px;
  padding-top: 60px;
  min-height: 100vh;
  box-sizing: border-box;
}

.login-header {
  text-align: center;
  padding: 30px 0 40px;
}

.logo {
  font-size: 40px;
  font-weight: 800;
  color: var(--primary-color);
  letter-spacing: 6px;
  margin: 0;
}

.slogan {
  font-size: 14px;
  color: var(--text-light);
  margin-top: 10px;
  letter-spacing: 2px;
}

.login-form {
  max-width: 320px;
  margin: 0 auto;
}

.form-card {
  background: var(--card-color);
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
}

.login-tabs {
  display: flex;
  border-bottom: 1px solid var(--border-color);
  margin-bottom: 20px;
}

.login-tab {
  flex: 1;
  padding: 10px 0;
  background: transparent;
  border: none;
  font-size: 14px;
  color: var(--text-light);
  cursor: pointer;
  position: relative;
}

.login-tab.active {
  color: var(--primary-color);
}

.login-tab.active::after {
  content: '';
  position: absolute;
  bottom: -1px;
  left: 50%;
  transform: translateX(-50%);
  width: 30px;
  height: 2px;
  background: var(--primary-color);
  border-radius: 1px;
}

.form-body {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.form-group {
  position: relative;
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
  transition: border-color 0.2s;
}

.form-input:focus {
  border-color: var(--primary-color);
}

.form-input::placeholder {
  color: var(--text-muted);
}

.toggle-password {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 18px;
  background: transparent;
  border: none;
  cursor: pointer;
}

.phone-mode-switch {
  display: flex;
  gap: 8px;
  margin-top: 8px;
}

.mode-switch-btn {
  flex: 1;
  padding: 8px;
  background: var(--background-color);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  font-size: 13px;
  color: var(--text-light);
  cursor: pointer;
  transition: all 0.2s;
}

.mode-switch-btn.active {
  background: var(--primary-color);
  border-color: var(--primary-color);
  color: #FFFFFF;
}

.verify-group {
  margin-bottom: 0;
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

.login-btn {
  width: 100%;
  background: linear-gradient(135deg, var(--primary-color), var(--primary-light));
  color: #FFFFFF;
  border-radius: 12px;
  padding: 14px 0;
  font-size: 15px;
  font-weight: 500;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-top: 10px;
  transition: opacity 0.2s;
}

.login-btn.loading {
  opacity: 0.7;
}

.login-btn.disabled {
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

.form-footer {
  display: flex;
  justify-content: space-between;
  margin-top: 20px;
}

.link-btn {
  font-size: 13px;
  color: var(--text-light);
  background: transparent;
  border: none;
  cursor: pointer;
}

.social-login {
  margin-top: 24px;
}

.divider {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
}

.divider::before,
.divider::after {
  content: '';
  flex: 1;
  height: 1px;
  background: var(--border-color);
}

.divider-text {
  padding: 0 12px;
  font-size: 12px;
  color: var(--text-muted);
}

.social-buttons {
  display: flex;
  gap: 12px;
}

.social-btn {
  flex: 1;
  padding: 12px;
  border: 1px solid var(--border-color);
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.social-btn.wechat {
  border-color: #07c160;
  background: rgba(7, 193, 96, 0.06);
}

.social-btn.wechat .social-text {
  color: #07c160;
}

.social-btn.phone {
  border-color: #1890ff;
  background: rgba(24, 144, 255, 0.06);
}

.social-btn.phone .social-text {
  color: #1890ff;
}

.social-icon {
  font-size: 20px;
}

.social-text {
  font-size: 12px;
  color: var(--text-light);
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

.modal-content.forgot-modal {
  max-width: 320px;
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
