class StorageService {
  private readonly FAVORITES_KEY = 'liubai_favorites'
  private readonly PREFERENCES_KEY = 'liubai_preferences'
  private readonly STATS_KEY = 'liubai_stats'
  private readonly API_KEY = 'liubai_api_key'
  private readonly API_PROVIDER = 'liubai_api_provider'
  private readonly USER_KEY = 'liubai_user'

  getFavorites(): string[] {
    try {
      const data = localStorage.getItem(this.FAVORITES_KEY)
      return data ? JSON.parse(data) : []
    } catch {
      return []
    }
  }

  addFavorite(text: string): void {
    const favorites = this.getFavorites()
    if (!favorites.includes(text)) {
      favorites.push(text)
      localStorage.setItem(this.FAVORITES_KEY, JSON.stringify(favorites))
    }
  }

  removeFavorite(text: string): void {
    const favorites = this.getFavorites()
    const filtered = favorites.filter((item: string) => item !== text)
    localStorage.setItem(this.FAVORITES_KEY, JSON.stringify(filtered))
  }

  isFavorited(text: string): boolean {
    return this.getFavorites().includes(text)
  }

  getPreferences(): Preferences {
    try {
      const data = localStorage.getItem(this.PREFERENCES_KEY)
      return data ? JSON.parse(data) : this.getDefaultPreferences()
    } catch {
      return this.getDefaultPreferences()
    }
  }

  savePreferences(prefs: Preferences): void {
    localStorage.setItem(this.PREFERENCES_KEY, JSON.stringify(prefs))
  }

  private getDefaultPreferences(): Preferences {
    return {
      defaultStyle: 'simple',
      defaultLength: 'short',
      autoCopy: false,
      theme: 'light'
    }
  }

  getStats(): Stats {
    try {
      const data = localStorage.getItem(this.STATS_KEY)
      return data ? JSON.parse(data) : this.getDefaultStats()
    } catch {
      return this.getDefaultStats()
    }
  }

  updateStats(type: keyof Stats): void {
    const stats = this.getStats()
    stats[type] = (stats[type] || 0) + 1
    localStorage.setItem(this.STATS_KEY, JSON.stringify(stats))
  }

  private getDefaultStats(): Stats {
    return {
      generateCount: 0,
      favoriteCount: 0,
      copyCount: 0,
      rewriteCount: 0
    }
  }

  getApiKey(): string | null {
    try {
      return localStorage.getItem(this.API_KEY)
    } catch {
      return null
    }
  }

  saveApiKey(key: string): void {
    localStorage.setItem(this.API_KEY, key)
  }

  removeApiKey(): void {
    localStorage.removeItem(this.API_KEY)
  }

  getApiProvider(): string | null {
    try {
      return localStorage.getItem(this.API_PROVIDER)
    } catch {
      return null
    }
  }

  saveApiProvider(provider: string): void {
    localStorage.setItem(this.API_PROVIDER, provider)
  }

  getUser(): User | null {
    try {
      const data = localStorage.getItem(this.USER_KEY)
      return data ? JSON.parse(data) : null
    } catch {
      return null
    }
  }

  saveUser(user: User): void {
    localStorage.setItem(this.USER_KEY, JSON.stringify(user))
  }

  clearUser(): void {
    localStorage.removeItem(this.USER_KEY)
  }

  isLoggedIn(): boolean {
    return !!this.getUser()
  }

  clearAll(): void {
    localStorage.removeItem(this.FAVORITES_KEY)
    localStorage.removeItem(this.PREFERENCES_KEY)
    localStorage.removeItem(this.STATS_KEY)
    localStorage.removeItem(this.API_KEY)
    localStorage.removeItem(this.API_PROVIDER)
    localStorage.removeItem(this.USER_KEY)
  }
}

interface Preferences {
  defaultStyle: string
  defaultLength: string
  autoCopy: boolean
  theme: string
}

interface Stats {
  generateCount: number
  favoriteCount: number
  copyCount: number
  rewriteCount: number
}

interface User {
  id: string
  email: string
  phone: string
  nickname: string
  avatar: string
  createdAt: string
}

export default new StorageService()
