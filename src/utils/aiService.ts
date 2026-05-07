class AIService {
  private apiKey: string = ''
  private provider: string = 'doubao'

  constructor() {
    const storedKey = localStorage.getItem('liubai_api_key')
    const storedProvider = localStorage.getItem('liubai_api_provider')
    
    this.apiKey = storedKey || (import.meta.env.VITE_AI_API_KEY as string) || ''
    this.provider = storedProvider || (import.meta.env.VITE_AI_PROVIDER as string) || 'doubao'
    
    console.log('AI Service initialized:', {
      hasApiKey: this.hasApiKey(),
      provider: this.provider,
      apiKeyPrefix: this.apiKey ? this.apiKey.substring(0, 10) + '...' : 'none'
    })
  }

  hasApiKey(): boolean {
    return !!this.apiKey && this.apiKey !== 'your-api-key-here' && this.apiKey.length > 10
  }

  async generateCopywriting(scene: string, style: string, length: string, count: number = 5): Promise<string[]> {
    const prompt = this.buildPrompt(scene, style, length, count)
    return this.requestAI(prompt, count)
  }

  async customGenerate(prompt: string, count: number = 5): Promise<string[]> {
    return this.requestAI(prompt, count)
  }

  async rewriteText(text: string, style: string, length: string): Promise<string[]> {
    const lengthDesc = this.getLengthDescription(length)
    const prompt = `请将以下文字改写成${style}风格：\n\n原文：${text}\n\n要求：保持原意，${lengthDesc}，清冷高级有留白感，拒绝鸡汤和土味。输出5条改写结果，每条单独一行，不加编号。`
    return this.requestAI(prompt, 5)
  }

  async analyzeImage(imageUrl: string): Promise<string> {
    if (!this.hasApiKey()) {
      console.warn('未配置API密钥，使用随机场景')
      return this.getRandomScene()
    }

    try {
      const response = await fetch('https://ark.cn-beijing.volces.com/api/v3/responses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: 'doubao-seed-1-8-251228',
          input: [
            {
              role: 'user',
              content: [
                {
                  type: 'input_image',
                  image_url: imageUrl
                },
                {
                  type: 'input_text',
                  text: '请分析这张图片，判断它最适合以下哪个场景：日常随拍、自驾旅行、夜景晚风、美食探店、独处心情、生日、节假日、早安、表白、友情、工作、自然。只返回场景名称，不要其他解释。'
                }
              ]
            }
          ]
        })
      })

      const data = await response.json()
      const scene = data.output?.content?.[0]?.text || data.choices?.[0]?.message?.content || ''
      
      return this.matchScene(scene)
    } catch (error) {
      console.error('图片分析失败:', error)
      return this.getRandomScene()
    }
  }

  private matchScene(sceneText: string): string {
    const sceneMap: Record<string, string> = {
      '日常': 'daily',
      '随拍': 'daily',
      '旅行': 'travel',
      '自驾': 'travel',
      '夜景': 'night',
      '晚风': 'night',
      '美食': 'food',
      '探店': 'food',
      '独处': 'alone',
      '心情': 'alone',
      '生日': 'birthday',
      '节日': 'holiday',
      '早安': 'morning',
      '表白': 'love',
      '友情': 'friend',
      '工作': 'work',
      '自然': 'nature'
    }

    for (const [key, value] of Object.entries(sceneMap)) {
      if (sceneText.includes(key)) {
        return value
      }
    }

    return this.getRandomScene()
  }

  private getRandomScene(): string {
    const scenes = ['daily', 'travel', 'night', 'food', 'alone']
    return scenes[Math.floor(Math.random() * scenes.length)]
  }

  private getLengthDescription(length: string): string {
    switch (length) {
      case 'short': return '字数控制在10-25字左右'
      case 'medium': return '字数控制在26-40字左右'
      case 'long': return '字数控制在40字以上'
      default: return '字数适中'
    }
  }

  private async requestAI(prompt: string, count: number): Promise<string[]> {
    if (!this.hasApiKey()) {
      console.warn('未配置API密钥，使用离线文案')
      return this.getFallbackCopywritings(count)
    }

    try {
      let response: Response
      let data: any

      switch (this.provider) {
        case 'openai':
          response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${this.apiKey}`
            },
            body: JSON.stringify({
              model: 'gpt-4o-mini',
              messages: [
                { role: 'system', content: '你是一位极简文艺风格的文案大师，擅长创作有质感、清冷高级有留白感的文案，拒绝鸡汤和土味内容。' },
                { role: 'user', content: prompt }
              ],
              max_tokens: 500,
              temperature: 0.8,
              n: 1
            })
          })
          data = await response.json()
          return this.parseAIResponse(data, count)

        case 'doubao':
          response = await fetch('https://ark.cn-beijing.volces.com/api/text/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${this.apiKey}`
            },
            body: JSON.stringify({
              model: 'doubao-3.5-pro',
              messages: [
                { role: 'system', content: '你是一位极简文艺风格的文案大师，擅长创作有质感、清冷高级有留白感的文案，拒绝鸡汤和土味内容。' },
                { role: 'user', content: prompt }
              ],
              max_tokens: 500,
              temperature: 0.8
            })
          })
          data = await response.json()
          return this.parseAIResponse(data, count)

        case 'huggingface':
          response = await fetch('https://api-inference.huggingface.co/models/Qwen/Qwen2-7B-Instruct', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${this.apiKey}`
            },
            body: JSON.stringify({
              inputs: `<s>[INST] 你是一位极简文艺风格的文案大师，擅长创作有质感、清冷高级有留白感的文案，拒绝鸡汤和土味内容。请根据以下要求创作：${prompt} [/INST]`,
              parameters: {
                max_new_tokens: 500,
                temperature: 0.8,
                top_p: 0.9,
                repetition_penalty: 1.1
              }
            })
          })
          data = await response.json()
          if (data.error) {
            console.error('Hugging Face API错误:', data.error)
            throw new Error(data.error)
          }
          return this.parseHuggingFaceResponse(data, count)

        default:
          response = await fetch('https://ark.cn-beijing.volces.com/api/text/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${this.apiKey}`
            },
            body: JSON.stringify({
              model: 'doubao-3.5-pro',
              messages: [
                { role: 'system', content: '你是一位极简文艺风格的文案大师，擅长创作有质感、清冷高级有留白感的文案，拒绝鸡汤和土味内容。' },
                { role: 'user', content: prompt }
              ],
              max_tokens: 500,
              temperature: 0.8
            })
          })
          data = await response.json()
          return this.parseAIResponse(data, count)
      }
    } catch (error) {
      console.error('AI请求失败:', error)
      return this.getFallbackCopywritings(count)
    }
  }

  private parseHuggingFaceResponse(data: any, count: number): string[] {
    const content = data[0]?.generated_text || ''
    if (!content) {
      console.error('Hugging Face API返回异常:', data)
      throw new Error('API返回异常')
    }
    
    const cleanedContent = content.replace(/<s>\[INST\][\s\S]*?\[\/INST\]/, '').trim()
    
    let results = cleanedContent.split('\n').filter((item: string) => {
      const trimmed = item.trim()
      return trimmed && !trimmed.startsWith('##') && !trimmed.startsWith('###') && trimmed.length > 5
    })

    results = results.map((item: string) => {
      return item.trim()
        .replace(/^[\d一二三四五六七八九十]+[\.\uff0e、]\s*/, '')
        .replace(/^[①②③④⑤⑥⑦⑧⑨⑩]+\s*/, '')
        .replace(/^[-•*]\s*/, '')
        .trim()
    }).filter((item: string) => item.length > 5)

    return results.slice(0, count)
  }

  private parseAIResponse(data: any, count: number): string[] {
    const content = data.choices?.[0]?.message?.content || data.result
    if (!content) {
      console.error('API返回异常:', data)
      throw new Error('API返回异常')
    }
    
    let results = content.split('\n').filter((item: string) => {
      const trimmed = item.trim()
      return trimmed && !trimmed.startsWith('##') && !trimmed.startsWith('###') && trimmed.length > 5
    })

    results = results.map((item: string) => {
      return item.trim()
        .replace(/^[\d一二三四五六七八九十]+[\.\uff0e、]\s*/, '')
        .replace(/^[①②③④⑤⑥⑦⑧⑨⑩]+\s*/, '')
        .replace(/^[-•*]\s*/, '')
        .trim()
    }).filter((item: string) => item.length > 5)

    return results.slice(0, count)
  }

  private buildPrompt(scene: string, style: string, length: string, count: number): string {
    const sceneName = this.getSceneName(scene)
    const styleName = this.getStyleName(style)
    const lengthDesc = this.getLengthDescription(length)

    return `请为${sceneName}场景生成${count}条${styleName}风格的文案。要求：${lengthDesc}，清冷高级有留白感，拒绝鸡汤和土味。直接输出${count}条文案，每条单独一行，不加编号。`
  }

  private getSceneName(scene: string): string {
    const sceneMap: Record<string, string> = {
      'daily': '日常随拍',
      'travel': '自驾旅行',
      'night': '夜景晚风',
      'food': '美食探店',
      'alone': '独处心情',
      'birthday': '生日',
      'holiday': '节假日',
      'morning': '早安',
      'love': '表白',
      'friend': '友情',
      'work': '工作',
      'nature': '自然'
    }
    return sceneMap[scene] || scene
  }

  private getStyleName(style: string): string {
    const styleMap: Record<string, string> = {
      'simple': '简洁',
      'imagery': '意象',
      'blank': '留白',
      'cold': '冷感',
      'firework': '烟火',
      'philosophy': '哲思',
      'poetic': '诗意',
      'metaphor': '隐喻',
      'monologue': '独白',
      '物语': '物语',
      'abstract': '抽象'
    }
    return styleMap[style] || style
  }

  private getFallbackCopywritings(count: number): string[] {
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
      '人间值得',
      '温柔且坚定',
      '静守时光',
      '静待花开',
      '岁月静好',
      '人间烟火',
      '山河远阔',
      '人间星河',
      '时光清浅',
      '岁月安然',
      '心向阳光',
      '温暖如初',
      '不负时光',
      '与光同行',
      '清风徐来',
      '花开有声',
      '岁月如歌',
      '安然自若'
    ]
    
    const shuffled = [...allCopywritings].sort(() => Math.random() - 0.5)
    return shuffled.slice(0, Math.min(count, shuffled.length))
  }
}

const aiService = new AIService()
export default aiService
