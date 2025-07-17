import React from 'react';
import { ZoomIn, ZoomOut, Maximize, Minimize, Map, Satellite } from 'lucide-react';

interface MapControlsProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onToggleFullscreen: () => void;
  onToggleMapType: () => void;
  isFullscreen: boolean;
  mapType: 'roadmap' | 'satellite';
}

export const MapControls: React.FC<MapControlsProps> = ({
  onZoomIn,
  onZoomOut,
  onToggleFullscreen,
  onToggleMapType,
  isFullscreen,
  mapType
}) => {
  return (
    <div className="fixed bottom-4 right-4 z-1001 flex flex-col gap-2">
      {/* ズームコントロール */}
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
        <button
          onClick={onZoomIn}
          className="block w-10 h-10 flex items-center justify-center text-gray-700 hover:bg-gray-100 transition-colors border-b border-gray-200"
          title="ズームイン"
        >
          <ZoomIn size={18} />
        </button>
        <button
          onClick={onZoomOut}
          className="block w-10 h-10 flex items-center justify-center text-gray-700 hover:bg-gray-100 transition-colors"
          title="ズームアウト"
        >
          <ZoomOut size={18} />
        </button>
      </div>

      {/* マップタイプ切り替え */}
      <button
        onClick={onToggleMapType}
        className="w-10 h-10 bg-white rounded-lg shadow-lg border border-gray-200 flex items-center justify-center text-gray-700 hover:bg-gray-100 transition-colors"
        title={mapType === 'roadmap' ? '衛星画像に切り替え' : '地図に切り替え'}
      >
        {mapType === 'roadmap' ? <Satellite size={18} /> : <Map size={18} />}
      </button>

      {/* 全画面切り替え */}
      <button
        onClick={onToggleFullscreen}
        className="w-10 h-10 bg-white rounded-lg shadow-lg border border-gray-200 flex items-center justify-center text-gray-700 hover:bg-gray-100 transition-colors"
        title={isFullscreen ? '全画面を終了' : '全画面表示'}
      >
        {isFullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
      </button>
    </div>
  );
};
