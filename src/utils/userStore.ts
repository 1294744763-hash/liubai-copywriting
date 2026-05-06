interface UserData {
  id: string
  email: string
  phone: string
  username: string
  nickname: string
  password: string
  avatar: string
  createdAt: string
}

class UserStore {
  private readonly USERS_KEY = 'liubai_users'
  
  private getUsers(): UserData[] {
    try {
      const data = localStorage.getItem(this.USERS_KEY)
      return data ? JSON.parse(data) : this.getDefaultUsers()
    } catch {
      return this.getDefaultUsers()
    }
  }
  
  private saveUsers(users: UserData[]): void {
    localStorage.setItem(this.USERS_KEY, JSON.stringify(users))
  }
  
  private getDefaultUsers(): UserData[] {
    return [
      {
        id: '1',
        email: 'demo@liubai.app',
        phone: '13800138000',
        username: 'demo',
        nickname: '留白用户',
        password: 'demo123456',
        avatar: '',
        createdAt: '2024-01-01T00:00:00Z'
      }
    ]
  }
  
  checkUsernameExists(username: string): boolean {
    const users = this.getUsers()
    return users.some(u => u.username.toLowerCase() === username.toLowerCase())
  }
  
  checkEmailExists(email: string): boolean {
    const users = this.getUsers()
    return users.some(u => u.email.toLowerCase() === email.toLowerCase())
  }
  
  checkPhoneExists(phone: string): boolean {
    const users = this.getUsers()
    return users.some(u => u.phone === phone)
  }
  
  registerByEmail(email: string, username: string, nickname: string, password: string): UserData | null {
    if (this.checkEmailExists(email)) {
      return null
    }
    
    if (this.checkUsernameExists(username)) {
      return null
    }
    
    const newUser: UserData = {
      id: Date.now().toString(),
      email,
      phone: '',
      username,
      nickname: nickname || username,
      password: this.hashPassword(password),
      avatar: '',
      createdAt: new Date().toISOString()
    }
    
    const users = this.getUsers()
    users.push(newUser)
    this.saveUsers(users)
    
    return newUser
  }
  
  registerByPhone(phone: string, username: string, nickname: string, password: string): UserData | null {
    if (this.checkPhoneExists(phone)) {
      return null
    }
    
    if (this.checkUsernameExists(username)) {
      return null
    }
    
    const newUser: UserData = {
      id: Date.now().toString(),
      email: '',
      phone,
      username,
      nickname: nickname || username,
      password: this.hashPassword(password),
      avatar: '',
      createdAt: new Date().toISOString()
    }
    
    const users = this.getUsers()
    users.push(newUser)
    this.saveUsers(users)
    
    return newUser
  }
  
  loginByEmail(email: string, password: string): UserData | null {
    const users = this.getUsers()
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase())
    
    if (user && this.verifyPassword(password, user.password)) {
      return user
    }
    
    return null
  }
  
  loginByPhone(phone: string, password: string): UserData | null {
    const users = this.getUsers()
    const user = users.find(u => u.phone === phone)
    
    if (user && this.verifyPassword(password, user.password)) {
      return user
    }
    
    return null
  }
  
  loginByUsername(username: string, password: string): UserData | null {
    const users = this.getUsers()
    const user = users.find(u => u.username.toLowerCase() === username.toLowerCase())
    
    if (user && this.verifyPassword(password, user.password)) {
      return user
    }
    
    return null
  }
  
  loginByWechat(wechatId: string): UserData | null {
    const users = this.getUsers()
    const user = users.find(u => u.username === wechatId)
    
    if (!user) {
      const newUser: UserData = {
        id: Date.now().toString(),
        email: '',
        phone: '',
        username: wechatId,
        nickname: '微信用户',
        password: '',
        avatar: '',
        createdAt: new Date().toISOString()
      }
      users.push(newUser)
      this.saveUsers(users)
      return newUser
    }
    
    return user
  }
  
  resetPasswordByPhone(phone: string, newPassword: string): boolean {
    const users = this.getUsers()
    const index = users.findIndex(u => u.phone === phone)
    
    if (index === -1) {
      return false
    }
    
    users[index].password = this.hashPassword(newPassword)
    this.saveUsers(users)
    return true
  }
  
  bindPhone(userId: string, phone: string): boolean {
    const users = this.getUsers()
    const index = users.findIndex(u => u.id === userId)
    
    if (index === -1) {
      return false
    }
    
    if (this.checkPhoneExists(phone)) {
      return false
    }
    
    users[index].phone = phone
    this.saveUsers(users)
    return true
  }
  
  updateUser(user: UserData): boolean {
    const users = this.getUsers()
    const index = users.findIndex(u => u.id === user.id)
    
    if (index === -1) {
      return false
    }
    
    users[index] = user
    this.saveUsers(users)
    return true
  }
  
  getUserById(userId: string): UserData | null {
    const users = this.getUsers()
    return users.find(u => u.id === userId) || null
  }
  
  private hashPassword(password: string): string {
    let hash = 0
    for (let i = 0; i < password.length; i++) {
      const char = password.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash
    }
    return hash.toString(16)
  }
  
  private verifyPassword(inputPassword: string, storedHash: string): boolean {
    return this.hashPassword(inputPassword) === storedHash
  }
}

export default new UserStore()
