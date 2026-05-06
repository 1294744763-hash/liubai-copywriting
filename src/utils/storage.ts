class StorageService {
  private readonly FAVORITES_KEY = 'liubai_favorites'
  private readonly PREFERENCES_KEY = 'liubai_preferences'
  private readonly STATS_KEY = 'liubai_stats'

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

  clearAll(): void {
    localStorage.removeItem(this.FAVORITES_KEY)
    localStorage.removeItem(this.PREFERENCES_KEY)
    localStorage.removeItem(this.STATS_KEY)
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

export default new StorageService()
