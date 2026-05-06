class AIService {
  private apiKey: string = ''
  private provider: string = 'doubao'

  constructor() {
    const storedKey = localStorage.getItem('liubai_api_key')
    const storedProvider = localStorage.getItem('liubai_api_provider')
    
    this.apiKey = storedKey || (import.meta.env.VUE_APP_AI_API_KEY as string) || ''
    this.provider = storedProvider || (import.meta.env.VUE_APP_AI_PROVIDER as string) || 'doubao'
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
      '不负韶华',
      '山有木兮木有枝',
      '心悦君兮君不知',
      '人生若只如初见',
      '何事秋风悲画扇',
      '等闲变却故人心',
      '却道故人心易变',
      '庄周梦蝶',
      '似是而非',
      '亦真亦幻',
      '若即若离',
      '若隐若现',
      '雾里看花',
      '水中望月',
      '镜花水月',
      '梦幻泡影',
      '一沙一世界',
      '一花一天堂',
      '心如止水',
      '波澜不惊',
      '安之若素',
      '处变不惊',
      '随波逐流',
      '顺其自然',
      '悠然自得',
      '怡然自乐',
      '自得其乐',
      '闲云野鹤',
      '与世无争',
      '淡泊名利',
      '超然物外',
      '清心寡欲',
      '无欲则刚',
      '宁静致远',
      '静以修身',
      '俭以养德',
      '淡泊明志',
      '宁静而致远',
      '心远地自偏',
      '采菊东篱下',
      '悠然见南山',
      '空山新雨后',
      '天气晚来秋',
      '明月松间照',
      '清泉石上流',
      '竹喧归浣女',
      '莲动下渔舟',
      '随意春芳歇',
      '王孙自可留',
      '行到水穷处',
      '坐看云起时',
      '偶然值林叟',
      '谈笑无还期',
      '山光悦鸟性',
      '潭影空人心',
      '万籁此都寂',
      '但余钟磬音',
      '蝉噪林逾静',
      '鸟鸣山更幽',
      '大漠孤烟直',
      '长河落日圆',
      '萧关逢候骑',
      '都护在燕然',
      '白日依山尽',
      '黄河入海流',
      '欲穷千里目',
      '更上一层楼',
      '千山鸟飞绝',
      '万径人踪灭',
      '孤舟蓑笠翁',
      '独钓寒江雪',
      '两个黄鹂鸣翠柳',
      '一行白鹭上青天',
      '窗含西岭千秋雪',
      '门泊东吴万里船',
      '千山万壑赴荆门',
      '生长明妃尚有村',
      '一去紫台连朔漠',
      '独留青冢向黄昏',
      '画图省识春风面',
      '环佩空归夜月魂',
      '千载琵琶作胡语',
      '分明怨恨曲中论',
      '群山万壑赴荆门',
      '生长明妃尚有村',
      '一去紫台连朔漠',
      '独留青冢向黄昏',
      '画图省识春风面',
      '环佩空归夜月魂',
      '千载琵琶作胡语',
      '分明怨恨曲中论'
    ]

    const shuffled = allCopywritings.sort(() => Math.random() - 0.5)
    return shuffled.slice(0, count)
  }
}

export default new AIService()
