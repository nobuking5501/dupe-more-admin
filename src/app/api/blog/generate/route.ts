import { NextRequest, NextResponse } from 'next/server'
import { ClaudeService } from '@/lib/claude-client'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { dailyReport, targetLength, tone } = body

    if (!dailyReport || typeof dailyReport !== 'string') {
      return NextResponse.json(
        { success: false, error: '日報内容が必要です' },
        { status: 400 }
      )
    }

    const claudeService = new ClaudeService()
    const result = await claudeService.generateBlogPost({
      dailyReport,
      targetLength,
      tone
    })

    return NextResponse.json({
      success: true,
      data: result
    })

  } catch (error: any) {
    console.error('Blog generation error:', error)
    
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'ブログ記事の生成に失敗しました' 
      },
      { status: 500 }
    )
  }
}