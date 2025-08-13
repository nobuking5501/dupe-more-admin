import Link from 'next/link'
import AdminHeader from '@/components/AdminHeader'

export default function BlogManagement() {
  return (
    <>
      <AdminHeader 
        title="ブログ管理" 
        subtitle="日報からブログ記事を生成・管理します" 
      />
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* アクションボタン */}
        <div className="mb-8 flex justify-end">
          <Link
            href="/blog/create"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            新規記事作成
          </Link>
        </div>

        {/* 統計情報 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-2xl font-bold text-blue-600">0</div>
            <div className="text-sm text-gray-600">公開記事</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-2xl font-bold text-orange-600">0</div>
            <div className="text-sm text-gray-600">下書き</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-2xl font-bold text-green-600">0</div>
            <div className="text-sm text-gray-600">今月の記事</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-2xl font-bold text-purple-600">0</div>
            <div className="text-sm text-gray-600">日報処理数</div>
          </div>
        </div>

        {/* メインコンテンツ */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 左側: 記事作成・管理 */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">
                  記事一覧
                </h2>
              </div>
              <div className="p-6">
                <div className="text-center py-12">
                  <div className="text-gray-400 text-4xl mb-4">📝</div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    まだ記事がありません
                  </h3>
                  <p className="text-gray-500 mb-4">
                    日報から最初のブログ記事を作成しましょう
                  </p>
                  <Link
                    href="/blog/create"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                  >
                    記事を作成する
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* 右側: ショートカット */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                クィックアクション
              </h3>
              <div className="space-y-3">
                <Link
                  href="/blog/create"
                  className="block w-full text-left px-4 py-3 border border-gray-200 rounded-md hover:bg-gray-50"
                >
                  <div className="font-medium text-gray-900">📝 新規記事作成</div>
                  <div className="text-sm text-gray-500">日報から記事を生成</div>
                </Link>
                <Link
                  href="/blog/list"
                  className="block w-full text-left px-4 py-3 border border-gray-200 rounded-md hover:bg-gray-50"
                >
                  <div className="font-medium text-gray-900">📋 記事一覧</div>
                  <div className="text-sm text-gray-500">すべての記事を表示</div>
                </Link>
                <button
                  disabled
                  className="block w-full text-left px-4 py-3 border border-gray-200 rounded-md bg-gray-50 cursor-not-allowed"
                >
                  <div className="font-medium text-gray-400">⚙️ 設定</div>
                  <div className="text-sm text-gray-400">準備中</div>
                </button>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                使い方
              </h3>
              <div className="text-sm text-gray-600 space-y-2">
                <div className="flex items-start">
                  <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-medium mr-3 mt-0.5">1</span>
                  <span>スタッフの日報を入力</span>
                </div>
                <div className="flex items-start">
                  <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-medium mr-3 mt-0.5">2</span>
                  <span>Claude AIが自動で記事生成</span>
                </div>
                <div className="flex items-start">
                  <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-medium mr-3 mt-0.5">3</span>
                  <span>内容を確認・編集</span>
                </div>
                <div className="flex items-start">
                  <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-medium mr-3 mt-0.5">4</span>
                  <span>公開サイトに反映</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}