import React, { useState, useEffect } from 'react';
import { MoodMarker } from './MoodMarker';
import { MoodForm } from './MoodForm';
import { MoodPost, MapPosition } from '../types';
import { filterRecentPosts } from '../utils/timeFilter';

interface SimpleMapComponentProps {
  posts: MoodPost[];
  onAddPost: (post: Omit<MoodPost, 'id' | 'timestamp'>) => void;
}

export const SimpleMapComponent: React.FC<SimpleMapComponentProps> = ({ posts, onAddPost }) => {
  const [selectedPosition, setSelectedPosition] = useState<MapPosition | null>(null);
  const [userLocation, setUserLocation] = useState<MapPosition>({ lat: 35.6762, lng: 139.6503 });
  const [mapCenter, setMapCenter] = useState<MapPosition>({ lat: 35.6762, lng: 139.6503 });
  const [zoom, setZoom] = useState(13);
  const [forceUpdate, setForceUpdate] = useState(0);

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

  // 定期的にマーカーを更新してリアルタイムで期限切れ投稿を削除
  useEffect(() => {
    const updateInterval = setInterval(() => {
      setForceUpdate(prev => prev + 1);
    }, 60 * 1000); // 1分間隔

    return () => clearInterval(updateInterval);
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

  const shouldShowTooltip = (post: MoodPost, filteredPosts: MoodPost[]) => {
    const radius = 0.01;
    const nearbyPosts = filteredPosts.filter(p => {
      const distance = Math.sqrt(
        Math.pow(p.lat - post.lat, 2) + Math.pow(p.lng - post.lng, 2)
      );
      return distance <= radius && p.id !== post.id;
    });
    return nearbyPosts.length < 3;
  };

  // 24時間以内の投稿をフィルタリング（リアルタイムチェック）
  const recentPosts = React.useMemo(() => {
    const filtered = filterRecentPosts(posts);
    if (filtered.length !== posts.length) {
      console.log(`Filtered out ${posts.length - filtered.length} expired posts from simple map`);
    }
    return filtered;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [posts, forceUpdate]);

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
        {recentPosts.map((post) => (
          <MoodMarker
            key={post.id}
            post={post}
            shouldShowTooltip={shouldShowTooltip(post, recentPosts)}
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
    </div>
  );
};