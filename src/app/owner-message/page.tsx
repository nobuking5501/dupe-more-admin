'use client';

import { useState, useEffect } from 'react';
import AdminHeader from '@/components/AdminHeader';
import LogViewer from '@/components/LogViewer';
import { log } from '@/lib/logger';

interface OwnerMessage {
  id: string;
  year_month: string;
  title: string;
  body_md: string;
  highlights: string[];
  sources: string[];
  status: 'draft' | 'published';
  created_at: string;
  updated_at: string;
  published_at?: string;
}

export default function OwnerMessagePage() {
  const [messages, setMessages] = useState<OwnerMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [selectedYearMonth, setSelectedYearMonth] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'draft' | 'published'>('all');
  const [showLogViewer, setShowLogViewer] = useState(false);

  useEffect(() => {
    fetchMessages();
  }, [statusFilter]);

  const fetchMessages = async () => {
    try {
      const params = new URLSearchParams();
      if (statusFilter !== 'all') {
        params.append('status', statusFilter);
      }
      
      const response = await fetch(`/api/owner-message/list?${params.toString()}`);
      const result = await response.json();
      
      if (response.ok) {
        setMessages(result.data);
      } else {
        alert('メッセージの取得に失敗しました: ' + result.error);
      }
    } catch (error) {
      console.error('メッセージ取得エラー:', error);
      alert('メッセージの取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const generateMessage = async () => {
    if (!selectedYearMonth) {
      log.user('OWNER_MESSAGE_GENERATE_ATTEMPT', { error: 'No year-month selected' });
      alert('年月を選択してください');
      return;
    }

    log.user('OWNER_MESSAGE_GENERATE_START', { yearMonth: selectedYearMonth });
    setGenerating(true);
    
    try {
      const response = await fetch('/api/owner-message/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ yearMonth: selectedYearMonth }),
      });

      const result = await response.json();
      
      if (response.ok) {
        log.user('OWNER_MESSAGE_GENERATE_SUCCESS', { 
          yearMonth: selectedYearMonth,
          messageId: result.data?.id 
        });
        alert('オーナーメッセージが生成されました');
        fetchMessages();
      } else {
        log.error('OWNER_MESSAGE', 'Generation failed from server', { 
          yearMonth: selectedYearMonth, 
          error: result.error 
        });
        alert('生成に失敗しました: ' + result.error);
      }
    } catch (error) {
      log.error('OWNER_MESSAGE', 'Generation failed with exception', { 
        yearMonth: selectedYearMonth, 
        error 
      });
      alert('生成に失敗しました');
    } finally {
      setGenerating(false);
    }
  };

  const publishMessage = async (id: string) => {
    try {
      const response = await fetch('/api/owner-message/publish', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id }),
      });

      const result = await response.json();
      
      if (response.ok) {
        alert('メッセージが公開されました');
        fetchMessages();
      } else {
        alert('公開に失敗しました: ' + result.error);
      }
    } catch (error) {
      console.error('公開エラー:', error);
      alert('公開に失敗しました');
    }
  };

  const unpublishMessage = async (id: string) => {
    try {
      const response = await fetch(`/api/owner-message/publish?id=${id}`, {
        method: 'DELETE',
      });

      const result = await response.json();
      
      if (response.ok) {
        alert('メッセージが非公開になりました');
        fetchMessages();
      } else {
        alert('非公開化に失敗しました: ' + result.error);
      }
    } catch (error) {
      console.error('非公開エラー:', error);
      alert('非公開化に失敗しました');
    }
  };

  const deleteMessage = async (id: string) => {
    if (!confirm('このメッセージを削除しますか？')) {
      return;
    }

    try {
      const response = await fetch(`/api/owner-message/list?id=${id}`, {
        method: 'DELETE',
      });

      const result = await response.json();
      
      if (response.ok) {
        alert('メッセージが削除されました');
        fetchMessages();
      } else {
        alert('削除に失敗しました: ' + result.error);
      }
    } catch (error) {
      console.error('削除エラー:', error);
      alert('削除に失敗しました');
    }
  };

  // 現在月から12ヶ月分の選択肢を生成
  const generateMonthOptions = () => {
    const options = [];
    const now = new Date();
    for (let i = 0; i < 12; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const yearMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      options.push(yearMonth);
    }
    return options;
  };

  if (loading) {
    return (
      <>
        <AdminHeader title="オーナーメッセージ管理" />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">読み込み中...</div>
        </div>
      </>
    );
  }

  return (
    <>
      <AdminHeader title="オーナーメッセージ管理" />
      <div className="container mx-auto px-4 py-8">
        
        {/* 生成セクション */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-xl font-semibold mb-4">新しいメッセージを生成</h2>
          <div className="flex gap-4 items-end">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                対象月
              </label>
              <select
                value={selectedYearMonth}
                onChange={(e) => setSelectedYearMonth(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2"
              >
                <option value="">月を選択</option>
                {generateMonthOptions().map(month => (
                  <option key={month} value={month}>
                    {month.replace('-', '年') + '月'}
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={generateMessage}
              disabled={generating}
              className="bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600 disabled:opacity-50"
            >
              {generating ? '生成中...' : 'メッセージ生成'}
            </button>
          </div>
        </div>

        {/* フィルターセクション */}
        <div className="mb-6">
          <div className="flex gap-2">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-4 py-2 rounded-md ${
                statusFilter === 'all' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              すべて
            </button>
            <button
              onClick={() => setStatusFilter('draft')}
              className={`px-4 py-2 rounded-md ${
                statusFilter === 'draft' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              ドラフト
            </button>
            <button
              onClick={() => setStatusFilter('published')}
              className={`px-4 py-2 rounded-md ${
                statusFilter === 'published' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              公開中
            </button>
          </div>
        </div>

        {/* メッセージ一覧 */}
        <div className="space-y-6">
          {messages.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              メッセージがありません
            </div>
          ) : (
            messages.map((message) => (
              <div key={message.id} className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-semibold">{message.title}</h3>
                    <p className="text-gray-600 text-sm">
                      {message.year_month.replace('-', '年') + '月'} • 
                      <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
                        message.status === 'published' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {message.status === 'published' ? '公開中' : 'ドラフト'}
                      </span>
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {message.status === 'draft' ? (
                      <button
                        onClick={() => publishMessage(message.id)}
                        className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600"
                      >
                        公開
                      </button>
                    ) : (
                      <button
                        onClick={() => unpublishMessage(message.id)}
                        className="bg-yellow-500 text-white px-4 py-2 rounded-md hover:bg-yellow-600"
                      >
                        非公開
                      </button>
                    )}
                    <button
                      onClick={() => deleteMessage(message.id)}
                      className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600"
                    >
                      削除
                    </button>
                  </div>
                </div>
                
                {message.highlights && message.highlights.length > 0 && (
                  <div className="mb-4">
                    <h4 className="font-medium text-gray-700 mb-2">ハイライト:</h4>
                    <div className="flex flex-wrap gap-2">
                      {message.highlights.map((highlight, index) => (
                        <span
                          key={index}
                          className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm"
                        >
                          {highlight}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="prose max-w-none">
                  <div 
                    className="text-gray-700 whitespace-pre-wrap"
                    style={{ maxHeight: '200px', overflow: 'auto' }}
                  >
                    {message.body_md}
                  </div>
                </div>
                
                <div className="mt-4 text-sm text-gray-500">
                  作成: {new Date(message.created_at).toLocaleString('ja-JP')}
                  {message.published_at && (
                    <span className="ml-4">
                      公開: {new Date(message.published_at).toLocaleString('ja-JP')}
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* デバッグ用ログビューアー */}
        {process.env.NODE_ENV === 'development' && (
          <div className="fixed bottom-4 right-4">
            <button
              onClick={() => setShowLogViewer(true)}
              className="bg-gray-800 text-white px-4 py-2 rounded-full shadow-lg hover:bg-gray-700"
            >
              📋 ログ
            </button>
          </div>
        )}
      </div>

      <LogViewer isOpen={showLogViewer} onClose={() => setShowLogViewer(false)} />
    </>
  );
}