<template>
  <div class="register-page">
    <header class="register-header">
      <button class="nav-back" @click="goBack">←</button>
      <h1 class="nav-title">注册</h1>
      <div class="nav-placeholder"></div>
    </header>

    <section class="register-form">
      <div class="form-card">
        <div class="register-tabs">
          <button 
            class="register-tab"
            :class="{ active: registerType === 'email' }"
            @click="registerType = 'email'"
          >邮箱注册</button>
          <button 
            class="register-tab"
            :class="{ active: registerType === 'phone' }"
            @click="registerType = 'phone'"
          >手机号注册</button>
        </div>

        <div class="form-body">
          <div class="form-group">
            <label class="form-label">用户名</label>
            <input 
              v-model="username" 
              type="text" 
              class="form-input" 
              placeholder="请输入用户名（2-12位）"
              @blur="checkUsername"
            />
            <span v-if="usernameStatus" class="status-text" :class="usernameStatus">
              {{ usernameStatus === 'success' ? '✓ 用户名可用' : '✗ 用户名已存在' }}
            </span>
          </div>

          <div class="form-group">
            <label class="form-label">昵称</label>
            <input 
              v-model="nickname" 
              type="text" 
              class="form-input" 
              placeholder="请输入昵称（选填）"
            />
          </div>

          <div v-if="registerType === 'email'" class="form-group">
            <label class="form-label">邮箱</label>
            <input 
              v-model="email" 
              type="email" 
              class="form-input" 
              placeholder="请输入邮箱"
              @blur="checkEmail"
            />
            <span v-if="emailStatus" class="status-text" :class="emailStatus">
              {{ emailStatus === 'success' ? '✓ 邮箱可用' : '✗ 邮箱已注册' }}
            </span>
          </div>

          <div v-else class="form-group">
            <label class="form-label">手机号</label>
            <input 
              v-model="phone" 
              type="tel" 
              class="form-input" 
              placeholder="请输入手机号"
              maxlength="11"
              @blur="checkPhone"
            />
            <span v-if="phoneStatus" class="status-text" :class="phoneStatus">
              {{ phoneStatus === 'success' ? '✓ 手机号可用' : '✗ 手机号已注册' }}
            </span>
          </div>

          <div class="form-group">
            <label class="form-label">验证码</label>
            <div class="verify-row">
              <input 
                v-model="verifyCode" 
                type="text" 
                class="form-input verify-input" 
                placeholder="请输入验证码"
                maxlength="6"
              />
              <button 
                class="verify-btn" 
                :class="{ disabled: !canSendCode || verifyCountdown > 0 }"
                @click="sendVerifyCode"
              >
                {{ verifyCountdown > 0 ? `${verifyCountdown}s` : '获取验证码' }}
              </button>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">密码</label>
            <input 
              v-model="password" 
              :type="showPassword ? 'text' : 'password'" 
              class="form-input" 
              placeholder="请输入密码（6-16位）"
            />
            <button class="toggle-password" @click="showPassword = !showPassword">
              {{ showPassword ? '🙈' : '👁️' }}
            </button>
            <div v-if="password.length > 0" class="password-strength">
              <div class="strength-label">密码强度</div>
              <div class="strength-bars">
                <div 
                  class="strength-bar" 
                  :class="{ active: password.length >= 6 }"
                ></div>
                <div 
                  class="strength-bar" 
                  :class="{ active: password.length >= 10 }"
                ></div>
                <div 
                  class="strength-bar" 
                  :class="{ active: password.length >= 12 }"
                ></div>
              </div>
              <div class="strength-text">{{ passwordStrength }}</div>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">确认密码</label>
            <input 
              v-model="confirmPassword" 
              :type="showPassword ? 'text' : 'password'" 
              class="form-input" 
              placeholder="请再次输入密码"
            />
            <span v-if="confirmPassword && password !== confirmPassword" class="status-text error">
              ✗ 两次密码不一致
            </span>
          </div>
        </div>

        <div class="agree-checkbox">
          <input 
            type="checkbox" 
            id="agree" 
            v-model="agreed" 
          />
          <label for="agree" class="agree-label">
            我已阅读并同意
            <a href="#" class="agree-link">《用户协议》</a>
            和
            <a href="#" class="agree-link">《隐私政策》</a>
          </label>
        </div>

        <button 
          class="register-btn" 
          :class="{ loading: isLoading, disabled: !isFormValid }"
          @click="handleRegister"
        >
          <span v-if="isLoading" class="btn-spinner"></span>
          {{ isLoading ? '注册中...' : '注册' }}
        </button>
      </div>

      <button class="login-link" @click="goToLogin">
        已有账号？立即登录
      </button>

      <div class="social-register">
        <div class="divider">
          <span class="divider-text">其他方式注册</span>
        </div>
        <button class="social-btn wechat" @click="registerWithWechat">
          <span class="social-icon">💬</span>
          <span class="social-text">微信一键注册</span>
        </button>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import storage from '@/utils/storage'
import userStore from '@/utils/userStore'

const router = useRouter()

const registerType = ref('email')
const username = ref('')
const nickname = ref('')
const email = ref('')
const phone = ref('')
const verifyCode = ref('')
const password = ref('')
const confirmPassword = ref('')
const showPassword = ref(false)
const agreed = ref(false)
const isLoading = ref(false)
const verifyCountdown = ref(0)

const usernameStatus = ref('')
const emailStatus = ref('')
const phoneStatus = ref('')

const canSendCode = computed(() => {
  if (registerType.value === 'email') {
    return email.value.includes('@') && email.value.includes('.')
  } else {
    return phone.value.length === 11
  }
})

const passwordStrength = computed(() => {
  const len = password.value.length
  if (len < 6) return ''
  if (len < 10) return '弱'
  if (len < 12) return '中'
  return '强'
})

const isFormValid = computed(() => {
  const validUsername = username.value.length >= 2 && username.value.length <= 12 && usernameStatus.value === 'success'
  const validEmail = registerType.value === 'email' ? email.value.includes('@') && email.value.includes('.') && emailStatus.value === 'success' : true
  const validPhone = registerType.value === 'phone' ? phone.value.length === 11 && phoneStatus.value === 'success' : true
  const validCode = verifyCode.value.length === 6
  const validPassword = password.value.length >= 6 && password.value.length <= 16
  const passwordMatch = password.value === confirmPassword.value
  
  return validUsername && validEmail && validPhone && validCode && validPassword && passwordMatch && agreed.value
})

function checkUsername() {
  if (!username.value) {
    usernameStatus.value = ''
    return
  }
  
  if (userStore.checkUsernameExists(username.value)) {
    usernameStatus.value = 'error'
  } else {
    usernameStatus.value = 'success'
  }
}

function checkEmail() {
  if (!email.value) {
    emailStatus.value = ''
    return
  }
  
  if (userStore.checkEmailExists(email.value)) {
    emailStatus.value = 'error'
  } else {
    emailStatus.value = 'success'
  }
}

function checkPhone() {
  if (!phone.value) {
    phoneStatus.value = ''
    return
  }
  
  if (userStore.checkPhoneExists(phone.value)) {
    phoneStatus.value = 'error'
  } else {
    phoneStatus.value = 'success'
  }
}

function sendVerifyCode() {
  if (!canSendCode.value) {
    showToast(registerType.value === 'email' ? '请输入正确的邮箱' : '请输入正确的手机号')
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

async function handleRegister() {
  if (!isFormValid.value) {
    showToast('请填写完整信息')
    return
  }
  
  isLoading.value = true
  
  try {
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    let user = null
    
    if (registerType.value === 'email') {
      user = userStore.registerByEmail(email.value, username.value, nickname.value || username.value, password.value)
    } else {
      user = userStore.registerByPhone(phone.value, username.value, nickname.value || username.value, password.value)
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
      showToast('注册成功')
      
      setTimeout(() => {
        router.push('/')
      }, 1000)
    } else {
      showToast('注册失败，请重试')
    }
  } catch (error) {
    console.error('注册失败:', error)
    showToast('注册失败，请重试')
  } finally {
    isLoading.value = false
  }
}

function registerWithWechat() {
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
      showToast('微信注册成功')
      
      setTimeout(() => {
        router.push('/')
      }, 1000)
    }
    
    isLoading.value = false
  }, 1500)
}

function goBack() {
  router.push('/login')
}

function goToLogin() {
  router.push('/login')
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
.register-page {
  padding: 20px;
  padding-top: 20px;
  min-height: 100vh;
  box-sizing: border-box;
}

.register-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 0;
  margin-bottom: 20px;
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

.register-form {
  max-width: 320px;
  margin: 0 auto;
}

.form-card {
  background: var(--card-color);
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
}

.register-tabs {
  display: flex;
  border-bottom: 1px solid var(--border-color);
  margin-bottom: 20px;
}

.register-tab {
  flex: 1;
  padding: 10px 0;
  background: transparent;
  border: none;
  font-size: 14px;
  color: var(--text-light);
  cursor: pointer;
  position: relative;
}

.register-tab.active {
  color: var(--primary-color);
}

.register-tab.active::after {
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
  gap: 16px;
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

.status-text {
  font-size: 12px;
  margin-top: 6px;
  display: block;
}

.status-text.success {
  color: #07c160;
}

.status-text.error {
  color: var(--error-color);
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

.password-strength {
  margin-top: 8px;
}

.strength-label {
  font-size: 12px;
  color: var(--text-muted);
  margin-bottom: 4px;
}

.strength-bars {
  display: flex;
  gap: 4px;
}

.strength-bar {
  flex: 1;
  height: 4px;
  background: var(--border-color);
  border-radius: 2px;
}

.strength-bar.active {
  background: var(--primary-color);
}

.strength-text {
  font-size: 12px;
  color: var(--text-light);
  margin-top: 4px;
}

.agree-checkbox {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  margin: 16px 0;
}

.agree-checkbox input {
  margin-top: 3px;
}

.agree-label {
  font-size: 12px;
  color: var(--text-light);
  line-height: 1.5;
}

.agree-link {
  color: var(--primary-color);
  text-decoration: none;
}

.register-btn {
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
  transition: opacity 0.2s;
}

.register-btn.loading {
  opacity: 0.7;
}

.register-btn.disabled {
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

.login-link {
  width: 100%;
  padding: 16px;
  margin-top: 16px;
  background: transparent;
  border: 1px solid var(--border-color);
  border-radius: 12px;
  font-size: 15px;
  color: var(--text-light);
  cursor: pointer;
  transition: all 0.2s;
}

.login-link:hover {
  border-color: var(--primary-color);
  color: var(--primary-color);
}

.social-register {
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

.social-btn {
  width: 100%;
  padding: 14px;
  border: 1px solid #07c160;
  background: rgba(7, 193, 96, 0.06);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  cursor: pointer;
}

.social-btn.wechat .social-text {
  color: #07c160;
}

.social-icon {
  font-size: 20px;
}

.social-text {
  font-size: 14px;
  color: var(--text-light);
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
