import React, { useState } from 'react';
import { MapPin, Send, X } from 'lucide-react';
import { MoodPost, MapPosition } from '../types';

interface MoodFormProps {
  selectedPosition: MapPosition | null;
  onSubmit: (post: Omit<MoodPost, 'id' | 'timestamp'>) => void;
  onCancel: () => void;
}

const moodOptions = [
  { value: 'happy' as const, icon: '😊', label: '嬉しい' },
  { value: 'smile' as const, icon: '🙂', label: '良い' },
  { value: 'neutral' as const, icon: '😐', label: '普通' },
  { value: 'sad' as const, icon: '😢', label: '悲しい' }
];

export const MoodForm: React.FC<MoodFormProps> = ({ selectedPosition, onSubmit, onCancel }) => {
  const [mood, setMood] = useState<MoodPost['mood']>('neutral');
  const [nickname, setNickname] = useState('');
  const [comment, setComment] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPosition || !nickname.trim() || !comment.trim()) return;

    onSubmit({
      lat: selectedPosition.lat,
      lng: selectedPosition.lng,
      mood,
      nickname: nickname.trim(),
      comment: comment.trim()
    });

    // フォームリセット
    setMood('neutral');
    setNickname('');
    setComment('');
  };

  if (!selectedPosition) return null;

  return (
    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-1000 p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <MapPin className="text-blue-500" size={20} />
            <h2 className="text-lg font-semibold text-gray-800">気分を投稿</h2>
          </div>
          <button
            onClick={onCancel}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              今の気分は？
            </label>
            <div className="grid grid-cols-2 gap-2">
              {moodOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setMood(option.value)}
                  className={`p-3 rounded-xl border-2 transition-all ${
                    mood === option.value
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="text-2xl mb-1">{option.icon}</div>
                  <div className="text-sm font-medium">{option.label}</div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ニックネーム
            </label>
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="あなたのニックネーム"
              className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              コメント（20文字以内）
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value.slice(0, 20))}
              placeholder="今の気持ちを一言..."
              className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              rows={2}
              maxLength={20}
              required
            />
            <div className="text-xs text-gray-500 mt-1">
              {comment.length}/20文字
            </div>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 p-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors"
            >
              キャンセル
            </button>
            <button
              type="submit"
              disabled={!nickname.trim() || !comment.trim()}
              className="flex-1 p-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              <Send size={16} />
              投稿
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};