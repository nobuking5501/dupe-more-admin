'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase-client'

interface BlogPost {
  id: string
  title: string
  content: string
  slug: string
  published: boolean
  created_at: string
  updated_at: string
}

export default function BlogListPage() {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPosts()
  }, [])

  const fetchPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setPosts(data || [])
    } catch (error) {
      console.error('Error fetching posts:', error)
    } finally {
      setLoading(false)
    }
  }

  const togglePublish = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('blog_posts')
        .update({ published: !currentStatus })
        .eq('id', id)

      if (error) throw error
      
      // Update local state
      setPosts(posts.map(post => 
        post.id === id ? { ...post, published: !currentStatus } : post
      ))
    } catch (error) {
      console.error('Error toggling publish status:', error)
    }
  }

  const deleteBlogPost = async (id: string) => {
    if (!confirm('この記事を削除してよろしいですか？')) return

    try {
      const { error } = await supabase
        .from('blog_posts')
        .delete()
        .eq('id', id)

      if (error) throw error
      
      // Update local state
      setPosts(posts.filter(post => post.id !== id))
    } catch (error) {
      console.error('Error deleting post:', error)
    }
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-6"></div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">ブログ記事一覧</h1>
        <Link
          href="/blog/create"
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          新規作成
        </Link>
      </div>

      {posts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">まだ記事がありません</p>
          <Link
            href="/blog/create"
            className="inline-block mt-4 text-blue-600 hover:text-blue-800"
          >
            最初の記事を作成する
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {posts.map((post) => (
            <div
              key={post.id}
              className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">
                    {post.title}
                  </h2>
                  <p className="text-gray-600 mb-3 line-clamp-2">
                    {post.content.substring(0, 150)}...
                  </p>
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <span>作成日: {new Date(post.created_at).toLocaleDateString('ja-JP')}</span>
                    <span>更新日: {new Date(post.updated_at).toLocaleDateString('ja-JP')}</span>
                    <span className={`px-2 py-1 rounded text-xs ${
                      post.published 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {post.published ? '公開中' : '下書き'}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Link
                  href={`/blog/create?id=${post.id}`}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  編集
                </Link>
                <button
                  onClick={() => togglePublish(post.id, post.published)}
                  className={`text-sm font-medium ${
                    post.published
                      ? 'text-orange-600 hover:text-orange-800'
                      : 'text-green-600 hover:text-green-800'
                  }`}
                >
                  {post.published ? '非公開にする' : '公開する'}
                </button>
                <button
                  onClick={() => deleteBlogPost(post.id)}
                  className="text-red-600 hover:text-red-800 text-sm font-medium"
                >
                  削除
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}