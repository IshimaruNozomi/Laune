import React from 'react';
import { MapPin, Heart, Trash2 } from 'lucide-react';

interface HeaderProps {
  postsCount: number;
  onClearPosts: () => void;
}

export const Header: React.FC<HeaderProps> = ({ postsCount, onClearPosts }) => {
  return (
    <header className="absolute top-0 left-0 right-0 z-1000 bg-white bg-opacity-95 backdrop-blur-sm shadow-sm">
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <MapPin className="text-blue-500" size={24} />
            <h1 className="text-xl font-bold text-gray-800">Laune Map</h1>
          </div>
          <div className="flex items-center gap-1 text-sm text-gray-600">
            <Heart size={16} className="text-red-500" />
            <span>{postsCount}個の投稿</span>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={onClearPosts}
            className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
            title="すべての投稿を削除"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>
      
      <div className="px-4 pb-3">
        <p className="text-sm text-gray-600">
          📍 マップをクリックして、その場所での気分を投稿しよう！
        </p>
      </div>
    </header>
  );
};