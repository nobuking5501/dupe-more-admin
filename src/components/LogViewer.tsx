'use client';

import { useState, useEffect } from 'react';
import { logger, log } from '@/lib/logger';

interface LogViewerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LogViewer({ isOpen, onClose }: LogViewerProps) {
  const [logs, setLogs] = useState<any[]>([]);
  const [filterLevel, setFilterLevel] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      refreshLogs();
      // Auto-refresh every 2 seconds when open
      const interval = setInterval(refreshLogs, 2000);
      return () => clearInterval(interval);
    }
  }, [isOpen, filterLevel, filterCategory]);

  const refreshLogs = () => {
    const level = filterLevel === 'all' ? undefined : filterLevel as any;
    const category = filterCategory === 'all' ? undefined : filterCategory;
    const allLogs = logger.getLogs(level, category);
    
    const filteredLogs = searchTerm 
      ? allLogs.filter(log => 
          log.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
          JSON.stringify(log.data || {}).toLowerCase().includes(searchTerm.toLowerCase())
        )
      : allLogs;
    
    setLogs(filteredLogs.slice(-100)); // Show last 100 logs
  };

  const clearLogs = () => {
    logger.clearLogs();
    setLogs([]);
    log.user('LOG_VIEWER', 'Logs cleared');
  };

  const exportLogs = () => {
    const logsJson = logger.exportLogs();
    const blob = new Blob([logsJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `admin-logs-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
    log.user('LOG_VIEWER', 'Logs exported');
  };

  const getLogLevelColor = (level: string) => {
    switch (level) {
      case 'error': return 'text-red-600 bg-red-50';
      case 'warn': return 'text-yellow-600 bg-yellow-50';
      case 'info': return 'text-blue-600 bg-blue-50';
      case 'debug': return 'text-gray-600 bg-gray-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const categories = [...new Set(logger.getLogs().map(log => log.category))];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full h-5/6 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-semibold">システムログビューアー</h2>
          <div className="flex items-center space-x-3">
            <button
              onClick={clearLogs}
              className="px-3 py-1 text-sm bg-yellow-500 text-white rounded hover:bg-yellow-600"
            >
              ログクリア
            </button>
            <button
              onClick={exportLogs}
              className="px-3 py-1 text-sm bg-green-500 text-white rounded hover:bg-green-600"
            >
              エクスポート
            </button>
            <button
              onClick={onClose}
              className="px-3 py-1 text-sm bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              閉じる
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="p-4 border-b bg-gray-50 flex flex-wrap gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">レベル</label>
            <select
              value={filterLevel}
              onChange={(e) => setFilterLevel(e.target.value)}
              className="px-3 py-1 border rounded text-sm"
            >
              <option value="all">すべて</option>
              <option value="error">エラー</option>
              <option value="warn">警告</option>
              <option value="info">情報</option>
              <option value="debug">デバッグ</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">カテゴリ</label>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-3 py-1 border rounded text-sm"
            >
              <option value="all">すべて</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div className="flex-1">
            <label className="block text-sm font-medium mb-1">検索</label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="メッセージまたはデータで検索..."
              className="w-full px-3 py-1 border rounded text-sm"
            />
          </div>
        </div>

        {/* Log List */}
        <div className="flex-1 overflow-auto p-4">
          <div className="space-y-2">
            {logs.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                ログが見つかりません
              </div>
            ) : (
              logs.map((logEntry, index) => (
                <div key={index} className="border rounded p-3 text-sm">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getLogLevelColor(logEntry.level)}`}>
                        {logEntry.level.toUpperCase()}
                      </span>
                      <span className="font-medium text-gray-700">
                        {logEntry.category}
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(logEntry.timestamp).toLocaleString('ja-JP')}
                      </span>
                    </div>
                    {logEntry.sessionId && (
                      <span className="text-xs text-gray-400">
                        {logEntry.sessionId.split('_')[1]}
                      </span>
                    )}
                  </div>
                  
                  <div className="text-gray-900 mb-2">
                    {logEntry.message}
                  </div>
                  
                  {logEntry.data && (
                    <div className="bg-gray-100 p-2 rounded text-xs overflow-auto">
                      <pre>{JSON.stringify(logEntry.data, null, 2)}</pre>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}