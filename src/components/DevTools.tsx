'use client';

import { useState } from 'react';
import LogViewer from './LogViewer';

export default function DevTools() {
  const [showLogViewer, setShowLogViewer] = useState(false);

  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <>
      {/* Fixed log button for development */}
      <div className="fixed bottom-4 right-4 z-40">
        <button
          onClick={() => setShowLogViewer(true)}
          className="bg-gray-800 text-white px-4 py-2 rounded-full shadow-lg hover:bg-gray-700 text-sm font-medium"
        >
          📋 開発ログ
        </button>
      </div>

      <LogViewer isOpen={showLogViewer} onClose={() => setShowLogViewer(false)} />
    </>
  );
}