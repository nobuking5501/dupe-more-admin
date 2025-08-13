import Link from 'next/link'

interface AdminHeaderProps {
  title: string
  subtitle?: string
  showBackButton?: boolean
  backHref?: string
}

export default function AdminHeader({ 
  title, 
  subtitle, 
  showBackButton = false, 
  backHref = '/' 
}: AdminHeaderProps) {
  return (
    <div className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* 左側: ロゴとナビゲーション */}
          <div className="flex items-center">
            <Link 
              href="/" 
              className="flex items-center space-x-2"
            >
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white text-sm font-bold">D</span>
              </div>
              <span className="text-lg font-semibold text-gray-900">Dupe&more 管理</span>
            </Link>
            
            <nav className="hidden md:ml-8 md:flex md:space-x-8">
              <Link 
                href="/"
                className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
              >
                ダッシュボード
              </Link>
              <Link 
                href="/blog"
                className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
              >
                ブログ管理
              </Link>
              <Link 
                href="/owner-message"
                className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
              >
                オーナーメッセージ
              </Link>
            </nav>
          </div>

          {/* 右側: アクション */}
          <div className="flex items-center space-x-4">
            {showBackButton && (
              <Link
                href={backHref}
                className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                ← 戻る
              </Link>
            )}
            <div className="text-sm text-gray-500">
              管理者
            </div>
          </div>
        </div>
      </div>
      
      {/* ページタイトル部分 */}
      {(title || subtitle) && (
        <div className="border-t border-gray-200 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
            {subtitle && (
              <p className="mt-1 text-sm text-gray-600">{subtitle}</p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}