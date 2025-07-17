import React, { useState, useEffect } from 'react';
import { MoodMarker } from './MoodMarker';
import { MoodForm } from './MoodForm';
import { MoodPost, MapPosition } from '../types';

interface SimpleMapComponentProps {
  posts: MoodPost[];
  onAddPost: (post: Omit<MoodPost, 'id' | 'timestamp'>) => void;
}

export const SimpleMapComponent: React.FC<SimpleMapComponentProps> = ({ posts, onAddPost }) => {
  const [selectedPosition, setSelectedPosition] = useState<MapPosition | null>(null);
  const [userLocation, setUserLocation] = useState<MapPosition>({ lat: 35.6762, lng: 139.6503 });
  const [mapCenter, setMapCenter] = useState<MapPosition>({ lat: 35.6762, lng: 139.6503 });
  const [zoom, setZoom] = useState(13);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setUserLocation(newLocation);
          setMapCenter(newLocation);
        },
        (error) => {
          console.log('位置情報の取得に失敗しました:', error);
        }
      );
    }
  }, []);

  const handleMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // 簡易的な座標変換（実際のマップ投影法ではありませんが、デモ用）
    const lng = mapCenter.lng + ((x / rect.width - 0.5) * 0.1);
    const lat = mapCenter.lat - ((y / rect.height - 0.5) * 0.1);
    
    setSelectedPosition({ lat, lng });
  };

  const handleSubmit = (post: Omit<MoodPost, 'id' | 'timestamp'>) => {
    onAddPost(post);
    setSelectedPosition(null);
  };

  const handleCancel = () => {
    setSelectedPosition(null);
  };

  const shouldShowTooltip = (post: MoodPost) => {
    const radius = 0.01;
    const nearbyPosts = posts.filter(p => {
      const distance = Math.sqrt(
        Math.pow(p.lat - post.lat, 2) + Math.pow(p.lng - post.lng, 2)
      );
      return distance <= radius && p.id !== post.id;
    });
    return nearbyPosts.length < 3;
  };

  return (
    <div className="relative w-full h-full">
      <div 
        className="map-container cursor-crosshair"
        onClick={handleMapClick}
      >
        <div className="map-grid" />
        
        {/* 現在位置マーカー */}
        <div
          style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
            width: '20px',
            height: '20px',
            backgroundColor: '#3B82F6',
            borderRadius: '50%',
            border: '3px solid white',
            boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
            zIndex: 999
          }}
        />
        
        {/* 投稿マーカー */}
        {posts.map((post) => (
          <MoodMarker
            key={post.id}
            post={post}
            shouldShowTooltip={shouldShowTooltip(post)}
          />
        ))}
        
        {/* 選択位置の一時マーカー */}
        {selectedPosition && (
          <div
            style={{
              position: 'absolute',
              left: `${((selectedPosition.lng - mapCenter.lng + 0.05) / 0.1) * 100}%`,
              top: `${((mapCenter.lat - selectedPosition.lat + 0.05) / 0.1) * 100}%`,
              transform: 'translate(-50%, -50%)',
              width: '30px',
              height: '30px',
              backgroundColor: '#F59E0B',
              borderRadius: '50%',
              border: '3px solid white',
              boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
              zIndex: 998,
              animation: 'pulse 1s infinite'
            }}
          />
        )}
      </div>

      <MoodForm
        selectedPosition={selectedPosition}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
      />
      
      <style jsx>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
          50% { opacity: 0.7; transform: translate(-50%, -50%) scale(1.1); }
        }
      `}</style>
    </div>
  );
};