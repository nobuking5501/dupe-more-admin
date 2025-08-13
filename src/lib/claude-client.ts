import Anthropic from '@anthropic-ai/sdk'
import { ClaudeGenerationRequest, ClaudeGenerationResponse } from '../types'

const anthropic = new Anthropic({
  apiKey: process.env.CLAUDE_API_KEY,
})

console.log('Claude API Key configured:', !!process.env.CLAUDE_API_KEY)

export class ClaudeService {
  async generateBlogPost(request: ClaudeGenerationRequest): Promise<ClaudeGenerationResponse> {
    if (!process.env.CLAUDE_API_KEY) {
      throw new Error('Claude API key is not configured')
    }

    const prompt = this.buildPrompt(request)
    console.log('Generating blog post with prompt length:', prompt.length)
    
    try {
      const completion = await anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 4000,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      })

      console.log('Claude API response received')
      const content = completion.content[0]
      if (content.type !== 'text') {
        throw new Error('Unexpected response format from Claude API')
      }

      console.log('Parsing Claude response...')
      return this.parseResponse(content.text)
    } catch (error: any) {
      console.error('Claude API Error:', {
        message: error.message,
        status: error.status,
        type: error.type
      })
      
      if (error.status === 401) {
        throw new Error('Claude API認証エラー: APIキーを確認してください')
      } else if (error.status === 429) {
        throw new Error('Claude APIレート制限に達しました。しばらくしてから再試行してください')
      } else {
        throw new Error(`ブログ記事の生成に失敗しました: ${error.message}`)
      }
    }
  }

  private buildPrompt(request: ClaudeGenerationRequest): string {
    const targetLength = request.targetLength || 1500
    const tone = request.tone || 'professional'
    
    return `
あなたは脱毛サロン「Dupe＆more（デュープアンドモア）」のブログライターです。

【サロンのコンセプトと理念】
- 「諦めないで。一緒に、できる方法を見つけましょう。」
- 13歳の知的障害・自閉症の息子を持つ母親が経営者として運営
- 同じ想いを持つ母として、障害のあるお子さまの保護者に寄り添う
- 「普通の女の子と同じように」「普通の男の子と同じように」という思い
- 障害があっても「きれいになりたい」「楽になりたい」気持ちは同じ

【サロンのアプローチ】
- 嫌がることは絶対にしない
- じっと寝ていられなくても大丈夫（立ったままでも施術）
- 音や光が苦手なら事前に配慮
- 親御さんと相談しながら進める
- お子さまのペースで無理をしない
- 一人ひとりに合わせた方法を見つける

【実際の成果】
- 「多動だから絶対に無理」と思っていた保護者からも「できないと思っていたことができた！」の声
- 毎朝のヒゲ剃りが面倒で嫌がっていた男の子が楽になって喜んでいる
- 女の子が「なくなって嬉しい！女の子らしくなった！」と実感

以下のスタッフの日報をもとに、上記のコンセプトと理念に沿ったブログ記事を作成してください。

【日報内容】
${request.dailyReport}

【要件】
- 文字数: ${targetLength}文字程度
- トーン: ${tone === 'professional' ? '専門的で信頼できる' : tone === 'friendly' ? 'フレンドリーで親しみやすい' : 'カジュアルで読みやすい'}
- 読者: 障害を持つお子さまの保護者の方々（特に「諦めかけている」「不安を抱えている」方々）
- 目的: 同じ立場の母親としての共感と、「できる方法がある」という希望を伝える
- 必ず含める要素: 保護者の不安への共感、実際の成功事例、お子さまのペースを大切にする姿勢

【出力形式】
以下のJSON形式で出力してください:
{
  "title": "ブログタイトル（30文字以内）",
  "content": "本文（HTML形式、段落は<p>タグで区切る）",
  "excerpt": "記事の要約（100文字以内）",
  "suggestedTags": ["タグ1", "タグ2", "タグ3"]
}

注意: JSON以外の文字は出力しないでください。
`
  }

  private parseResponse(response: string): ClaudeGenerationResponse {
    try {
      // JSONの開始と終了を見つける
      const jsonStart = response.indexOf('{')
      const jsonEnd = response.lastIndexOf('}') + 1
      
      if (jsonStart === -1 || jsonEnd === 0) {
        throw new Error('JSON形式の応答が見つかりません')
      }
      
      const jsonString = response.slice(jsonStart, jsonEnd)
      const parsed = JSON.parse(jsonString)
      
      return {
        title: parsed.title || 'タイトルなし',
        content: parsed.content || '',
        excerpt: parsed.excerpt || '',
        suggestedTags: parsed.suggestedTags || []
      }
    } catch (error) {
      console.error('Response parsing error:', error)
      throw new Error('Claude APIからの応答の解析に失敗しました')
    }
  }
}