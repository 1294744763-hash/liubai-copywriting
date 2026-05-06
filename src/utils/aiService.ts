class AIService {
  private apiKey: string = ''
  private baseUrl: string = 'https://api.openai.com/v1/chat/completions'

  constructor() {
    this.apiKey = (import.meta.env.VUE_APP_AI_API_KEY as string) || ''
  }

  async generateCopywriting(scene: string, style: string, length: string, count: number = 5): Promise<string[]> {
    const prompt = this.buildPrompt(scene, style, length, count)
    
    try {
      // 如果没有配置API Key，使用本地预设文案
      if (!this.apiKey) {
        return this.getFallbackCopywritings(scene, style, length)
      }

      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-4',
          messages: [
            { role: 'system', content: '你是一位极简文艺风格的文案大师，擅长创作有质感的文案。' },
            { role: 'user', content: prompt }
          ],
          max_tokens: 500,
          temperature: 0.7
        })
      })

      const data = await response.json()
      const content = data.choices?.[0]?.message?.content
      if (!content) throw new Error('API返回异常')
      return content.split('\n').filter((item: string) => item.trim()).slice(0, count)
    } catch (error) {
      console.error('AI请求失败:', error)
      return this.getFallbackCopywritings(scene, style, length)
    }
  }

  async rewriteText(text: string, style: string, length: string): Promise<string[]> {
    const prompt = `请将以下文字改写成${style}风格，${length}长度：\n\n原文：${text}\n\n要求：保持原意，提升文案质感，清冷高级有留白感，拒绝鸡汤和土味。输出3-5条改写结果，每条单独一行。`

    try {
      if (!this.apiKey) {
        return [`${text}（保持原文）`]
      }

      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-4',
          messages: [
            { role: 'system', content: '你是一位极简文艺风格的文案大师。' },
            { role: 'user', content: prompt }
          ],
          max_tokens: 500,
          temperature: 0.7
        })
      })

      const data = await response.json()
      const content = data.choices?.[0]?.message?.content
      if (!content) throw new Error('API返回异常')
      return content.split('\n').filter((item: string) => item.trim()).slice(0, 5)
    } catch (error) {
      console.error('AI请求失败:', error)
      return [`${text}（改写失败，显示原文）`]
    }
  }

  private buildPrompt(scene: string, style: string, length: string, count: number): string {
    return `请为我生成${count}条${scene}场景的文案，要求${style}风格，${length}长度。调性：清冷、高级、有留白感，拒绝鸡汤和土味。直接输出${count}条文案，每条单独一行。`
  }

  private getFallbackCopywritings(scene: string, style: string, length: string): string[] {
    const fallback: Record<string, string[]> = {
      'daily': ['阳光落在窗台', '风是甜的', '把日子过成诗', '岁月漫长', '人间值得', '时光温柔', '日子慢慢', '微风正好'],
      'travel': ['方向盘在手', '风在身后', '路在前方', '远方不远', '一路向前', '在路上', '自由驰骋', '风景在路上'],
      'night': ['晚风踩着云朵', '月亮在说晚安', '夜色漫过窗台', '星星掉进海里', '夜晚温柔', '月光洒落', '夜色撩人', '星空璀璨'],
      'food': ['食物是生活的标点', '烟火气里的温暖', '每一餐都值得', '好好吃饭', '味蕾的旅行', '美味时光', '人间烟火', '舌尖上的温柔'],
      'alone': ['与自己和解', '独处是浪漫', '内心的平静', '与灵魂对话', '一个人也很好', '安静时光', '自我对话', '独处的美好'],
      'birthday': ['新的一岁', '与光同行', '成长快乐', '生日快乐', '新的起点', '岁月如歌', '生日快乐', '美好新章'],
      'holiday': ['人间烟火处', '年味正浓时', '节日快乐', '团圆时光', '美好的日子', '节日氛围', '欢聚时刻', '美好时光']
    }
    
    const sceneData = fallback[scene] || fallback['daily']
    
    // 根据长度返回不同数量的文案
    if (length === 'short') {
      return sceneData.slice(0, 5).map(s => s.slice(0, 15))
    } else if (length === 'medium') {
      return sceneData.slice(0, 5)
    } else {
      return sceneData.slice(0, 5).map(s => s + '，值得被记住')
    }
  }
}

export default new AIService()
