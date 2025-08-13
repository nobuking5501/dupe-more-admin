import { NextRequest, NextResponse } from 'next/server'
import { SupabaseService } from '@/lib/supabase-client'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, content, excerpt, suggestedTags, status, originalReport } = body

    console.log('Blog save request:', { title, status, hasContent: !!content })

    if (!title || !content) {
      return NextResponse.json(
        { success: false, error: 'タイトルと本文は必須です' },
        { status: 400 }
      )
    }

    // 管理者スタッフを取得または作成
    const staffResult = await SupabaseService.getStaff('admin@dupe-more.com')
    let adminId = null

    if (staffResult.error || !staffResult.data || staffResult.data.length === 0) {
      console.log('Creating admin staff...')
      // 管理者スタッフが存在しない場合は作成
      const createStaffResult = await SupabaseService.createStaff({
        name: '管理者',
        email: 'admin@dupe-more.com',
        password_hash: '$2b$10$rGK.5H7K9xJ8P9Q2L3M4weOWGI7P9Q2L3M4weOWGI7',
        role: 'admin'
      })
      
      if (createStaffResult.error) {
        console.error('Failed to create admin staff:', createStaffResult.error)
        return NextResponse.json(
          { success: false, error: '管理者アカウントの作成に失敗しました' },
          { status: 500 }
        )
      }
      adminId = createStaffResult.data.id
    } else {
      adminId = staffResult.data[0].id
    }

    // 日報があれば先に保存
    let reportId = null
    if (originalReport && originalReport.trim()) {
      console.log('Saving daily report...')
      const reportResult = await SupabaseService.createDailyReport({
        staff_id: adminId,
        date: new Date().toISOString().split('T')[0],
        content: originalReport
      })
      
      if (reportResult.error) {
        console.error('Daily report save error:', reportResult.error)
      } else {
        reportId = reportResult.data?.id
        console.log('Daily report saved:', reportId)
      }
    }

    // ブログ記事をSupabaseに保存
    console.log('Saving blog post with author_id:', adminId)
    const result = await SupabaseService.createBlogPost({
      title,
      content,
      excerpt,
      status,
      author_id: adminId,
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