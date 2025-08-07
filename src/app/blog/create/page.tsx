'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function CreateBlogPost() {
  const [dailyReport, setDailyReport] = useState('')
  const [generatedPost, setGeneratedPost] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleGenerate = async () => {
    if (!dailyReport.trim()) {
      setError('日報内容を入力してください')
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/blog/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          dailyReport: dailyReport.trim(),
          targetLength: 1500,
          tone: 'friendly'
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'ブログ記事の生成に失敗しました')
      }

      setGeneratedPost(data.data)
    } catch (err: any) {
      setError(err.message || 'エラーが発生しました')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async (status: 'draft' | 'published') => {
    if (!generatedPost) return

    try {
      const response = await fetch('/api/blog/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...generatedPost,
          status,
          originalReport: dailyReport
        }),
      })

      if (response.ok) {
        alert(status === 'draft' ? '下書きとして保存しました' : '記事を公開しました')
        // リセット
        setDailyReport('')
        setGeneratedPost(null)
      } else {
        throw new Error('保存に失敗しました')
      }
    } catch (err) {
      alert('保存中にエラーが発生しました')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* ヘッダー */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                ブログ記事作成
              </h1>
              <p className="mt-2 text-gray-600">
                日報からブログ記事を自動生成します
              </p>
            </div>
            <Link
              href="/blog"
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              ← 戻る
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 左側: 日報入力 */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">
                スタッフ日報
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                今日の業務内容やお客様とのエピソードを入力してください
              </p>
            </div>
            <div className="p-6">
              <textarea
                value={dailyReport}
                onChange={(e) => setDailyReport(e.target.value)}
                placeholder="今日は○○様の脱毛施術を行いました。お子様は最初緊張されていましたが、スタッフとお話しするうちにリラックスしていただけました。ご家族の方も安心されているご様子で..."
                className="w-full h-64 p-4 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 resize-none"
                disabled={loading}
              />
              
              {error && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              <div className="mt-6 flex justify-between items-center">
                <div className="text-sm text-gray-500">
                  文字数: {dailyReport.length}
                </div>
                <button
                  onClick={handleGenerate}
                  disabled={loading || !dailyReport.trim()}
                  className="inline-flex items-center px-6 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      生成中...
                    </>
                  ) : (
                    'ブログ記事を生成'
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* 右側: 生成結果 */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">
                生成されたブログ記事
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                AI が生成した記事をプレビューできます
              </p>
            </div>
            <div className="p-6">
              {!generatedPost ? (
                <div className="text-center py-12">
                  <div className="text-gray-400 text-4xl mb-4">🤖</div>
                  <p className="text-gray-500">
                    日報を入力して「ブログ記事を生成」ボタンを押してください
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      タイトル
                    </label>
                    <input
                      type="text"
                      value={generatedPost.title}
                      onChange={(e) => setGeneratedPost({...generatedPost, title: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      要約
                    </label>
                    <textarea
                      value={generatedPost.excerpt}
                      onChange={(e) => setGeneratedPost({...generatedPost, excerpt: e.target.value})}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      本文
                    </label>
                    <textarea
                      value={generatedPost.content}
                      onChange={(e) => setGeneratedPost({...generatedPost, content: e.target.value})}
                      rows={12}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      タグ
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {generatedPost.suggestedTags?.map((tag: string, index: number) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex space-x-4">
                    <button
                      onClick={() => handleSave('draft')}
                      className="flex-1 px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                    >
                      下書き保存
                    </button>
                    <button
                      onClick={() => handleSave('published')}
                      className="flex-1 px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                    >
                      公開する
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}