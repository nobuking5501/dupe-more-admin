import { NextRequest, NextResponse } from 'next/server'
import { SupabaseService } from '@shared/lib/supabase-client'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, content, excerpt, suggestedTags, status, originalReport } = body

    if (!title || !content) {
      return NextResponse.json(
        { success: false, error: 'タイトルと本文は必須です' },
        { status: 400 }
      )
    }

    // 日報があれば先に保存
    let reportId = null
    if (originalReport) {
      const reportResult = await SupabaseService.createDailyReport({
        staff_id: 'admin-id', // 現在は固定（将来的には認証から取得）
        date: new Date().toISOString().split('T')[0],
        content: originalReport
      })
      
      if (reportResult.error) {
        console.error('Daily report save error:', reportResult.error)
      } else {
        reportId = reportResult.data?.id
      }
    }

    // ブログ記事をSupabaseに保存
    const result = await SupabaseService.createBlogPost({
      title,
      content,
      excerpt,
      status,
      author_id: 'admin-id', // 現在は固定（将来的には認証から取得）
      tags: suggestedTags || [],
      original_report_id: reportId
    })

    if (result.error) {
      console.error('Blog post save error:', result.error)
      return NextResponse.json(
        { success: false, error: 'データベースへの保存に失敗しました' },
        { status: 500 }
      )
    }

    console.log('Blog post saved to Supabase:', {
      id: result.data?.id,
      title: result.data?.title,
      status: result.data?.status
    })

    return NextResponse.json({
      success: true,
      data: result.data,
      message: status === 'draft' ? '下書きとして保存しました' : '記事を公開しました'
    })

  } catch (error: any) {
    console.error('Blog save error:', error)
    
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || '記事の保存に失敗しました' 
      },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const result = await SupabaseService.getBlogPosts()
    
    if (result.error) {
      return NextResponse.json(
        { success: false, error: '記事の取得に失敗しました' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: result.data || []
    })
  } catch (error: any) {
    console.error('Blog fetch error:', error)
    return NextResponse.json(
      { success: false, error: '記事の取得に失敗しました' },
      { status: 500 }
    )
  }
}