import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://yaogagvttkpoapkwdrjd.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlhb2dhZ3Z0dGtwb2Fwa3dkcmpkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQzMTQ2NzQsImV4cCI6MjA2OTg5MDY3NH0.sRSDHAq3XqDP7AmumBJ52RyWXNIzNPBFFHR01bxHjjY'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

// 通常のクライアント（anon key使用）
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// 管理者用クライアント（service role key使用）
export const supabaseAdmin = supabaseServiceKey 
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  : null

// データベース操作用のヘルパー関数
export class SupabaseService {
  // 通常のクライアントも公開
  static supabase = supabase

  // ブログ記事の取得
  static async getBlogPosts(status?: 'draft' | 'published') {
    let query = supabase
      .from('blog_posts')
      .select(`
        *,
        staff:author_id (
          name,
          email
        )
      `)
      .order('created_at', { ascending: false })
    
    if (status) {
      query = query.eq('status', status)
    }
    
    return await query
  }

  // ブログ記事の作成
  static async createBlogPost(data: {
    title: string
    content: string
    excerpt: string
    status: 'draft' | 'published'
    author_id: string
    tags?: string[]
    original_report_id?: string
  }) {
    if (!supabaseAdmin) {
      throw new Error('Supabase admin client is not available')
    }

    const postData = {
      ...data,
      published_at: data.status === 'published' ? new Date().toISOString() : null
    }

    return await supabaseAdmin
      .from('blog_posts')
      .insert([postData])
      .select()
      .single()
  }

  // ブログ記事の更新
  static async updateBlogPost(id: string, data: Partial<{
    title: string
    content: string
    excerpt: string
    status: 'draft' | 'published'
    tags: string[]
  }>) {
    if (!supabaseAdmin) {
      throw new Error('Supabase admin client is not available')
    }

    const updateData = {
      ...data,
      updated_at: new Date().toISOString(),
      published_at: data.status === 'published' ? new Date().toISOString() : undefined
    }

    return await supabaseAdmin
      .from('blog_posts')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()
  }

  // 日報の作成
  static async createDailyReport(data: {
    staff_id: string
    date: string
    content: string
  }) {
    if (!supabaseAdmin) {
      throw new Error('Supabase admin client is not available')
    }

    return await supabaseAdmin
      .from('daily_reports')
      .insert([data])
      .select()
      .single()
  }

  // スタッフ情報の取得
  static async getStaff(email?: string) {
    if (!supabaseAdmin) {
      throw new Error('Supabase admin client is not available')
    }

    let query = supabaseAdmin
      .from('staff')
      .select('*')
    
    if (email) {
      query = query.eq('email', email)
    }
    
    return await query
  }

  // スタッフの作成
  static async createStaff(data: {
    name: string
    email: string
    password_hash: string
    role?: 'admin' | 'staff'
  }) {
    if (!supabaseAdmin) {
      throw new Error('Supabase admin client is not available')
    }

    return await supabaseAdmin
      .from('staff')
      .insert([data])
      .select()
      .single()
  }
}