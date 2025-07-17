import React from 'react';
import { MapPin, Heart, RefreshCw } from 'lucide-react';

interface HeaderProps {
  postsCount: number;
  onRefreshPosts?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ postsCount, onRefreshPosts }) => {
  return (
    <header className="absolute top-0 left-0 right-0 z-1000 bg-white bg-opacity-95 backdrop-blur-sm shadow-sm">
      <div className="flex items-center justify-between p-4 pr-20 md:pr-24">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <MapPin className="text-blue-500" size={24} />
            <h1 className="text-xl font-bold text-gray-800 truncate">Laune Map</h1>
          </div>
          <div className="flex items-center gap-1 text-sm text-gray-600">
            <Heart size={16} className="text-red-500" />
            <span className="hidden sm:inline">{postsCount}個の投稿</span>
            <span className="sm:hidden">{postsCount}</span>
          </div>
        </div>
        
        <div className="flex items-center gap-2 flex-shrink-0">
          {onRefreshPosts && (
            <button
              onClick={onRefreshPosts}
              className="p-2 text-gray-500 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
              title="投稿を更新"
            >
              <RefreshCw size={18} />
            </button>
          )}
        </div>
      </div>
      
      <div className="px-4 pb-3 pr-20 md:pr-24">
        <p className="text-sm text-gray-600">
          📍 マップをクリックして、その場所での気分を投稿しよう！
        </p>
        <p className="text-xs text-gray-500 mt-1">
          ⏰ 投稿は24時間後に自動的に削除されます
        </p>
      </div>
    </header>
  );
};