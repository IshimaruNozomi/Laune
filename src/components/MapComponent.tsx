import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, useMapEvents } from 'react-leaflet';
import { MoodMarker } from './MoodMarker';
import { MoodForm } from './MoodForm';
import { MoodPost, MapPosition } from '../types';
import { filterRecentPosts } from '../utils/timeFilter';

interface MapComponentProps {
  posts: MoodPost[];
  onAddPost: (post: Omit<MoodPost, 'id' | 'timestamp'>) => void;
}

const MapClickHandler: React.FC<{ onLocationSelect: (position: MapPosition) => void }> = ({ onLocationSelect }) => {
  useMapEvents({
    click: (e) => {
      onLocationSelect({
        lat: e.latlng.lat,
        lng: e.latlng.lng
      });
    }
  });
  return null;
};

export const MapComponent: React.FC<MapComponentProps> = ({ posts, onAddPost }) => {
  const [selectedPosition, setSelectedPosition] = useState<MapPosition | null>(null);
  const [userLocation, setUserLocation] = useState<MapPosition>({ lat: 35.6762, lng: 139.6503 }); // 東京駅
  const [forceUpdate, setForceUpdate] = useState(0);

  useEffect(() => {
    // 現在位置を取得
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
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

  const handleLocationSelect = (position: MapPosition) => {
    setSelectedPosition(position);
  };

  const handleSubmit = (post: Omit<MoodPost, 'id' | 'timestamp'>) => {
    onAddPost(post);
    setSelectedPosition(null);
  };

  const handleCancel = () => {
    setSelectedPosition(null);
  };

  // 投稿密度を計算してツールチップを表示するかどうかを決定
  const shouldShowTooltip = (post: MoodPost, filteredPosts: MoodPost[]) => {
    const radius = 0.01; // 約1km
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
      console.log(`Filtered out ${posts.length - filtered.length} expired posts from leaflet map`);
    }
    return filtered;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [posts, forceUpdate]);

  return (
    <div className="relative w-full h-full">
      <MapContainer
        center={[userLocation.lat, userLocation.lng]}
        zoom={13}
        className="w-full h-full"
        style={{ height: '100vh' }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <MapClickHandler onLocationSelect={handleLocationSelect} />
        
        {recentPosts.map((post) => (
          <MoodMarker
            key={post.id}
            post={post}
            shouldShowTooltip={shouldShowTooltip(post, recentPosts)}
          />
        ))}
      </MapContainer>

      <MoodForm
        selectedPosition={selectedPosition}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
      />
    </div>
  );
};